import { env } from '@documenso/lib/utils/env';

export type SignWithLocalCertOptions = {
  pdf: Buffer;
};

export const signWithLocalCert = async ({ pdf }: SignWithLocalCertOptions) => {
  // Local processing without certificate - return PDF as-is without signing
  return pdf;
};
