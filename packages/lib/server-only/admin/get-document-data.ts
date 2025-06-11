import { prisma } from "@documenso/prisma";



export type GetDocumentDataOptions = {
  id: string;
};

export const getDocumentData = async ({ id }: GetDocumentDataOptions) => {
  const documentData = await prisma.documentData.findUnique({
    where: {
      id,
    },
  });

  return documentData;
};
