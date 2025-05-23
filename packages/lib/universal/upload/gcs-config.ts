import { Storage } from '@google-cloud/storage'
import { env } from '@documenso/lib/utils/env'

export function getGCSClient() {
  const uploadTransport = env('NEXT_PUBLIC_UPLOAD_TRANSPORT')
  if (uploadTransport !== 'gcs') 
    throw new Error('Invalid upload transport')

  return new Storage({
    projectId: env('NEXT_PRIVATE_GCS_PROJECT_ID'),
    credentials: {
      client_email: env('NEXT_PRIVATE_GCS_CLIENT_EMAIL'),
      private_key: (() => {
        const key = env('NEXT_PRIVATE_GCS_PRIVATE_KEY');
        if (!key) {
          throw new Error('NEXT_PRIVATE_GCS_PRIVATE_KEY is not set');
        }
        return key.replace(/\\n/g, '\n');
      })(),
    },
  });
};

export const getGCSBucket = () => {
  const client = getGCSClient();
  return client.bucket(env('NEXT_PRIVATE_GCS_BUCKET') ?? 'abuzar');
};

 