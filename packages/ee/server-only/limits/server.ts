import { DocumentSource, SubscriptionStatus } from '@prisma/client';
import { DateTime } from 'luxon';

import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { prisma } from '@documenso/prisma';

import { getDocumentRelatedPrices } from '../stripe/get-document-related-prices.ts';
import { PLAN_DOCUMENT_QUOTAS, DEFAULT_FREE_CREDITS, FREE_PLAN_LIMITS, SELFHOSTED_PLAN_LIMITS, TEAM_PLAN_LIMITS } from './constants';
import { ERROR_CODES } from './errors';
import type { TLimitsResponseSchema } from './schema';
import { ZLimitsSchema } from './schema';
import { getAvailableCredits, addUserCredits } from './credits';

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
  console.log("user subscription found", user?.subscriptions);

  if (!user) {
    throw new Error(ERROR_CODES.USER_FETCH_FAILED);
  }

  // Get available credits from the new credit system
  const availableCredits = await getAvailableCredits({ userId: user.id });


  // Count all current documents (not just this month)

  const quota = { 
    documents: availableCredits || DEFAULT_FREE_CREDITS, 
    recipients: Infinity, 
    directTemplates: Infinity 
  };
  
  const remaining = {
    documents: availableCredits,
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

  if (!team) throw new Error('Team not found');

  // Get available credits for the team owner
  const availableCredits = await getAvailableCredits({ userId: team.ownerUserId });





  const quota = { 
    documents: availableCredits || DEFAULT_FREE_CREDITS, 
    recipients: Infinity, 
    directTemplates: Infinity 
  };
  
  const remaining = {
    documents: availableCredits,
    recipients: Infinity,
    directTemplates: Infinity,
  };

  return { quota, remaining };
};



