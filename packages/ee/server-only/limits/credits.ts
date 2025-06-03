import { prisma } from '@documenso/prisma';
import { PLAN_DOCUMENT_QUOTAS } from './constants';

export type CreditManagementOptions = {
  userId: number;
  teamId?: number | null;
  planId?: string;
};

/**
 * Add credits to a user's account based on their subscription
 */
export async function addUserCredits({ userId, teamId, planId }: CreditManagementOptions) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { 
      subscriptions: true,
      userCredits: {
        where: { isActive: true },
        orderBy: { lastUpdatedAt: 'desc' },
        take: 1
      }
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  
  // Get active subscriptions
  const activeSubscriptions = user.subscriptions.filter(sub => 
    sub.status === 'ACTIVE' && 
    (!sub.periodEnd || new Date(sub.periodEnd) > now)
  );

  if (activeSubscriptions.length === 0 && !planId) {
    return null;
  }

  // Calculate total credits from all active subscriptions
  const totalCredits = activeSubscriptions.reduce((total, sub) => {
    const planCredits = PLAN_DOCUMENT_QUOTAS[sub.planId] ?? 0;
    return total + planCredits;
  }, 0);

  // Add credits from the new plan if provided
  const newPlanCredits = planId ? PLAN_DOCUMENT_QUOTAS[planId] ?? 0 : 0;
  const finalCredits = totalCredits + newPlanCredits;

  // Get existing active credits
  const existingCredits = user.userCredits[0]?.credits ?? 0;

  // Create new credit record with accumulated credits
  return prisma.userCredits.create({
    data: {
      userId,
      credits: existingCredits + finalCredits,
      expiresAt: activeSubscriptions[0]?.periodEnd,
      isActive: true,
    },
  });
}

/**
 * Deduct credits when a document is completed
 */
export async function deductCredits({ userId, teamId }: CreditManagementOptions) {
  const activeCredits = await prisma.userCredits.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: {
      lastUpdatedAt: 'desc',
    },
  });

  if (!activeCredits || activeCredits.credits <= 0) {
    throw new Error('No credits available');
  }

  return prisma.userCredits.update({
    where: { id: activeCredits.id },
    data: {
      credits: activeCredits.credits - 1,
    },
  });
}

/**
 * Get current available credits for a user
 */
export async function getAvailableCredits({ userId, teamId }: CreditManagementOptions) {

  const activeCredits = await prisma.userCredits.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: {
      lastUpdatedAt: 'desc',
    },
  });

  return activeCredits?.credits ?? 0;
}

/**
 * Deactivate expired credits
 */
export async function deactivateExpiredCredits() {
  const now = new Date();
  
  return prisma.userCredits.updateMany({
    where: {
      isActive: true,
      expiresAt: {
        lt: now,
      },
    },
    data: {
      isActive: false,
    },
  });
} 