import { prisma } from '@documenso/prisma';

export type GetSubscriptionsByUserIdOptions = {
  userId: number;
};

export const getSubscriptionsByUserId = async ({
  userId,
}: GetSubscriptionsByUserIdOptions | any) => {
  console.log('[GET_SUBSCRIPTIONS_BY_USER_ID] Fetching subscriptions for user:', userId);
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
    },
  });

  console.log('[GET_SUBSCRIPTIONS_BY_USER_ID] Found subscriptions:', subscriptions);
  return subscriptions;
};
