import { DocumentSource, SubscriptionStatus } from '@prisma/client';
import { DateTime } from 'luxon';

import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { prisma } from '@documenso/prisma';

import { getDocumentRelatedPrices } from '../stripe/get-document-related-prices.ts';
import { PLAN_DOCUMENT_QUOTAS, DEFAULT_FREE_CREDITS, FREE_PLAN_LIMITS, SELFHOSTED_PLAN_LIMITS, TEAM_PLAN_LIMITS } from './constants';
import { ERROR_CODES } from './errors';
import type { TLimitsResponseSchema } from './schema';
import { ZLimitsSchema } from './schema';

const PAY_AS_YOU_GO_PLANS = [
  'PLN_f54sm9jv38v7r5m',
  'PLN_5nmok91ploz44u6', 
  'PLN_kxqcw02dow71g6c',
  'PLN_ktbomtrjkiz73i1',
  'PLN_59961ig3ply5r3s',
  'PLN_bit1oy0ayiqpkdu'
];

export type GetServerLimitsOptions = {
  email: string;
  teamId?: number | null;
};

export async function getServerLimits({
  email,
  teamId,
}: GetServerLimitsOptions): Promise<TLimitsResponseSchema> {
  if (!email) {
    throw new Error(ERROR_CODES.UNAUTHORIZED);
  }

  return teamId ? handleTeamLimits({ email, teamId }) : handleUserLimits({ email });
}

type HandleUserLimitsOptions = {
  email: string;
};

const handleUserLimits = async ({ email }: HandleUserLimitsOptions) => {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { subscriptions: true },
  });

  if (!user) {
    throw new Error(ERROR_CODES.USER_FETCH_FAILED);
  }

  // Default to free credits
  let documentQuota = DEFAULT_FREE_CREDITS;

  const now = new Date();

  // Sort subscriptions by periodEnd date to find the most recent
  const sortedSubscriptions = [...user.subscriptions].sort((a, b) => {
    if (!a.periodEnd) return 1;
    if (!b.periodEnd) return -1;
    return new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime();
  });

  const mostRecentSubscription = sortedSubscriptions[0];
  const isMostRecentValid = mostRecentSubscription && (
    PAY_AS_YOU_GO_PLANS.includes(mostRecentSubscription.planId) || 
    (mostRecentSubscription.periodEnd && new Date(mostRecentSubscription.periodEnd) > now)
  );

  if (isMostRecentValid) {
    // If most recent subscription is valid, consider all subscriptions with future periodEnd
    const validSubscriptions = user.subscriptions.filter(
      (sub) => 
        PLAN_DOCUMENT_QUOTAS[sub.planId] && 
        (PAY_AS_YOU_GO_PLANS.includes(sub.planId) || 
         (sub.periodEnd && new Date(sub.periodEnd) > now))
    );

    if (validSubscriptions.length > 0) {
      // Group subscriptions by planId to handle multiple subscriptions of the same plan
      const planGroups = validSubscriptions.reduce((groups, sub) => {
        if (!groups[sub.planId]) {
          groups[sub.planId] = [];
        }
        groups[sub.planId].push(sub);
        return groups;
      }, {} as Record<string, typeof validSubscriptions>);

      // Calculate total quota from all valid subscriptions
      documentQuota = Object.entries(planGroups).reduce((total, [planId, subscriptions]) => {
        const planQuota = PLAN_DOCUMENT_QUOTAS[planId] ?? 0;
        const groupTotal = planQuota * subscriptions.length;
        return total + groupTotal;
      }, 0);
    }
  } else {
    // If most recent subscription is expired, mark all as cancelled and reset to free credits
    const expiredSubscriptions = user.subscriptions.filter(
      (sub) => sub.periodEnd && new Date(sub.periodEnd) <= now
    );

    if (expiredSubscriptions.length > 0) {
      // Update all expired subscriptions in the database
      await Promise.all(
        expiredSubscriptions.map((sub) =>
          prisma.subscription.update({
            where: { id: sub.id },
            data: { 
              status: SubscriptionStatus.INACTIVE,
              cancelAtPeriodEnd: true 
            },
          })
        )
      );
    }

    // Reset to free credits since most recent subscription is expired
    documentQuota = DEFAULT_FREE_CREDITS;
  }

  // Get all teams where the user is the owner
  const ownedTeams = await prisma.team.findMany({
    where: {
      ownerUserId: user.id
    },
    select: {
      id: true
    }
  });

  const ownedTeamIds = ownedTeams.map(team => team.id);

  // Count all current documents (not just this month)
  const documentsUsed = await prisma.document.count({
    where: {
      OR: [
        // Personal documents
        {
          userId: user.id,
          teamId: null,
          status: 'COMPLETED',
          source: {
            not: DocumentSource.TEMPLATE_DIRECT_LINK,
          },
        },
        // Documents in teams where user is the owner
        {
          teamId: {
            in: ownedTeamIds
          },
          status: 'COMPLETED',
          source: {
            not: DocumentSource.TEMPLATE_DIRECT_LINK,
          },
        }
      ],
    },
  });

  const quota = { documents: documentQuota, recipients: Infinity, directTemplates: Infinity };
  const remaining = {
    documents: Math.max(documentQuota - documentsUsed, 0),
    recipients: Infinity,
    directTemplates: Infinity,
  };

  return { quota, remaining };
};

type HandleTeamLimitsOptions = {
  email: string;
  teamId: number;
};

const handleTeamLimits = async ({ email, teamId }: HandleTeamLimitsOptions) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          user: { email },
        },
      },
    },
    include: { 
      subscription: true,
      owner: {
        include: {
          subscriptions: true
        }
      }
    },
  });
  console.log('team:', team);
  if (!team) throw new Error('Team not found');

  // Default to free credits
  let documentQuota = DEFAULT_FREE_CREDITS;

  // First check team subscription
  if (team.subscription && team.subscription.status === SubscriptionStatus.ACTIVE && PLAN_DOCUMENT_QUOTAS[team.subscription.planId]) {
    console.log('team subscription:');
    documentQuota = PLAN_DOCUMENT_QUOTAS[team.subscription.planId];
  } else {
    // If no team subscription, use owner's credits
    console.log('no team subscription, using owner\'s credits');
    const now = new Date();
    const ownerSubscriptions = team.owner.subscriptions;
    console.log('owner subscriptions:', ownerSubscriptions);

    // Sort subscriptions by periodEnd date to find the most recent
    const sortedSubscriptions = [...ownerSubscriptions].sort((a, b) => {
      if (!a.periodEnd) return 1;
      if (!b.periodEnd) return -1;
      return new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime();
    });

    const mostRecentSubscription = sortedSubscriptions[0];
    const isMostRecentValid = mostRecentSubscription && (
      PAY_AS_YOU_GO_PLANS.includes(mostRecentSubscription.planId) || 
      (mostRecentSubscription.periodEnd && new Date(mostRecentSubscription.periodEnd) > now)
    );

    if (isMostRecentValid) {
      // If most recent subscription is valid, consider all subscriptions with future periodEnd
      const validSubscriptions = ownerSubscriptions.filter(
        (sub) => 
          PLAN_DOCUMENT_QUOTAS[sub.planId] && 
          (PAY_AS_YOU_GO_PLANS.includes(sub.planId) || 
           (sub.periodEnd && new Date(sub.periodEnd) > now))
      );

      if (validSubscriptions.length > 0) {
        // Group subscriptions by planId to handle multiple subscriptions of the same plan
        const planGroups = validSubscriptions.reduce((groups, sub) => {
          if (!groups[sub.planId]) {
            groups[sub.planId] = [];
          }
          groups[sub.planId].push(sub);
          return groups;
        }, {} as Record<string, typeof validSubscriptions>);

        // Calculate total quota from all valid subscriptions
        documentQuota = Object.entries(planGroups).reduce((total, [planId, subscriptions]) => {
          const planQuota = PLAN_DOCUMENT_QUOTAS[planId] ?? 0;
          const groupTotal = planQuota * subscriptions.length;
          return total + groupTotal;
        }, 0);
      }
    }
  }

  // Count documents for the team and its owner
  const documentsUsed = await prisma.document.count({
    where: {
      OR: [
        // Team documents
        {
          teamId: team.id,
          source: { not: DocumentSource.TEMPLATE_DIRECT_LINK },
          status: 'COMPLETED',
        },
        // Owner's documents that are not team documents
        {
          userId: team.ownerUserId,
          teamId: null,
          source: { not: DocumentSource.TEMPLATE_DIRECT_LINK },
          status: 'COMPLETED',
        }
      ],
    },
  });

  const quota = { documents: documentQuota, recipients: Infinity, directTemplates: Infinity };
  
  const remaining = {
    documents: Math.max(documentQuota - documentsUsed, 0),
    recipients: Infinity,
    directTemplates: Infinity,
  };

  return { quota, remaining };
};



