import { SubscriptionStatus } from '@prisma/client';

import type { Stripe } from '@documenso/lib/server-only/stripe';
import { prisma } from '@documenso/prisma';

export type OnSubscriptionDeletedOptions = {
  subscription: Stripe.Subscription;
};

export const onSubscriptionDeleted = async ({ subscription }: OnSubscriptionDeletedOptions) => {
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      planId: subscription.id,
    },
  });

  if (!existingSubscription) {
    return;
  }

  await prisma.subscription.update({
    where: {
      id: existingSubscription.id,
      ...(existingSubscription.teamId ? { teamId: existingSubscription.teamId } : {}),
    },
    data: {
      status: SubscriptionStatus.INACTIVE,
    },
  });
};
