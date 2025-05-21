import { DocumentSource, SubscriptionStatus } from '@prisma/client';
import { DateTime } from 'luxon';

import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { prisma } from '@documenso/prisma';

import { getDocumentRelatedPrices } from '../stripe/get-document-related-prices.ts';
import { PLAN_DOCUMENT_QUOTAS, DEFAULT_FREE_CREDITS, FREE_PLAN_LIMITS, SELFHOSTED_PLAN_LIMITS, TEAM_PLAN_LIMITS } from './constants';
import { ERROR_CODES } from './errors';
import type { TLimitsResponseSchema } from './schema';
import { ZLimitsSchema } from './schema';

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

  // Get all subscriptions with known plan codes
  const allSubscriptions = user.subscriptions.filter(
    (sub) => PLAN_DOCUMENT_QUOTAS[sub.planId]
  );

  console.log('all subscriptions:', allSubscriptions);

  if (allSubscriptions.length > 0) {
    // Calculate total quota from all subscriptions
    documentQuota = allSubscriptions.reduce((total, sub) => {
      const planQuota = PLAN_DOCUMENT_QUOTAS[sub.planId] ?? 0;
      return total + planQuota;
    }, 0);

    console.log('total document quota from all subscriptions:', documentQuota);
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

  console.log('documents used:', documentsUsed);

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
