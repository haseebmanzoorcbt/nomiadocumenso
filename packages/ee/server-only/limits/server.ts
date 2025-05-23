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

  // console.log('most recent subscription:', mostRecentSubscription);
  // console.log('is most recent valid:', isMostRecentValid);

  if (isMostRecentValid) {
    // If most recent subscription is valid, consider all subscriptions with future periodEnd
    const validSubscriptions = user.subscriptions.filter(
      (sub) => 
        PLAN_DOCUMENT_QUOTAS[sub.planId] && 
        (PAY_AS_YOU_GO_PLANS.includes(sub.planId) || 
         (sub.periodEnd && new Date(sub.periodEnd) > now))
    );

    // console.log('valid subscriptions:', validSubscriptions);
    // console.log('PLAN_DOCUMENT_QUOTAS:', PLAN_DOCUMENT_QUOTAS);

    if (validSubscriptions.length > 0) {
      // Group subscriptions by planId to handle multiple subscriptions of the same plan
      const planGroups = validSubscriptions.reduce((groups, sub) => {
        if (!groups[sub.planId]) {
          groups[sub.planId] = [];
        }
        groups[sub.planId].push(sub);
        return groups;
      }, {} as Record<string, typeof validSubscriptions>);

      // console.log('plan groups:', planGroups);

      // Calculate total quota from all valid subscriptions
      documentQuota = Object.entries(planGroups).reduce((total, [planId, subscriptions]) => {
        const planQuota = PLAN_DOCUMENT_QUOTAS[planId] ?? 0;
        const groupTotal = planQuota * subscriptions.length;
        // console.log(`Plan ${planId} has ${subscriptions.length} subscriptions, total quota:`, groupTotal);
        return total + groupTotal;
      }, 0);

      // console.log('total document quota from all valid subscriptions:', documentQuota);
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
      // console.log('marked all expired subscriptions as inactive and cancelled:', expiredSubscriptions);
    }

    // Reset to free credits since most recent subscription is expired
    documentQuota = DEFAULT_FREE_CREDITS;


    // console.log('most recent subscription expired, using default free credits:', documentQuota);
  }

  // Count all current documents (not just this month)
  const documentsUsed = await prisma.document.count({
    where: {
      userId: user.id,
      teamId: null,
      status: 'COMPLETED',
      source: {
        not: DocumentSource.TEMPLATE_DIRECT_LINK,
      },
    },
  });

  // console.log('documents used:', documentsUsed);

  // For simplicity, keep recipients/directTemplates logic as before
  const quota = { documents: documentQuota, recipients: 10, directTemplates: 3 };
  const remaining = {
    documents: Math.max(documentQuota - documentsUsed, 0),
    recipients: 10, // You can adjust this if you want per-plan recipient quotas
    directTemplates: 3, // You can adjust this if you want per-plan template quotas
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
    include: { subscription: true },
  });

  if (!team) throw new Error('Team not found');

  const { subscription } = team;

  let documentQuota = DEFAULT_FREE_CREDITS;
  if (subscription && subscription.status === SubscriptionStatus.ACTIVE && PLAN_DOCUMENT_QUOTAS[subscription.planId]) {
    documentQuota = PLAN_DOCUMENT_QUOTAS[subscription.planId];
  }

  // Count documents for the team this month
  const documentsUsed = await prisma.document.count({
    where: {
      teamId: team.id,
      source: { not: DocumentSource.TEMPLATE_DIRECT_LINK },
    },
  });

  const quota = { documents: documentQuota, recipients: 10, directTemplates: 3 };
  const remaining = {
    documents: Math.max(documentQuota - documentsUsed, 0),
    recipients: 10,
    directTemplates: 3,
  };

  return { quota, remaining };
};
