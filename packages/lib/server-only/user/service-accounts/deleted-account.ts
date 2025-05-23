import { prisma } from '@documenso/prisma';

export const deletedAccountServiceAccount = async (email_to_use: string) => {
  const serviceAccount = await prisma.user.findFirst({
    where: {
      email: email_to_use,
    },
  });

  if (!serviceAccount) {
    throw new Error(
      'Deleted account service account not found, have you ran the appropriate migrations?',
    );
  }

  return serviceAccount;
};
