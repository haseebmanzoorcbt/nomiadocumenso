import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import slugify from '@sindresorhus/slugify';
import path from 'node:path';

import { env } from '@documenso/lib/utils/env';

import { ONE_HOUR, ONE_SECOND } from '../../constants/time';

import { Storage } from '@google-cloud/storage';
import { alphaid } from '../id';

export const getPresignPostUrl = async (fileName: string, contentType: string, userId?: number) => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');
  const { name, ext } = path.parse(fileName);
  let key = `${alphaid(12)}/${slugify(name)}${ext}`;

  if (userId) {
    key = `${userId}/${key}`;
  }

  if (NEXT_PUBLIC_UPLOAD_TRANSPORT === 'gcs') {
    const bucket = getGCSBucket();
    const [url] = await bucket.file(key).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + ONE_HOUR,
      contentType,
    });
    return { key, url };
  }

  const client = getS3Client();
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const putObjectCommand = new PutObjectCommand({
    Bucket: env('NEXT_PRIVATE_UPLOAD_BUCKET'),
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(client, putObjectCommand, {
    expiresIn: ONE_HOUR / ONE_SECOND,
  });

  return { key, url };
};

export const getAbsolutePresignPostUrl = async (key: string) => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');

  if (NEXT_PUBLIC_UPLOAD_TRANSPORT === 'gcs') {
    const bucket = getGCSBucket();
    const [url] = await bucket.file(key).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + ONE_HOUR,
    });
    return { key, url };
  }

  const client = getS3Client();
  const { getSignedUrl: getS3SignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const putObjectCommand = new PutObjectCommand({
    Bucket: env('NEXT_PRIVATE_UPLOAD_BUCKET'),
    Key: key,
  });

  const url = await getS3SignedUrl(client, putObjectCommand, {
    expiresIn: ONE_HOUR / ONE_SECOND,
  });

  return { key, url };
};

export const getPresignGetUrl = async (key: string) => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');

  if (NEXT_PUBLIC_UPLOAD_TRANSPORT === 'gcs') {
    const bucket = getGCSBucket();
    const [url] = await bucket.file(key).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + ONE_HOUR,
    });
    return { key, url };
  }

  if (env('NEXT_PRIVATE_UPLOAD_DISTRIBUTION_DOMAIN')) {
    const distributionUrl = new URL(key, `${env('NEXT_PRIVATE_UPLOAD_DISTRIBUTION_DOMAIN')}`);

    const { getSignedUrl: getCloudfrontSignedUrl } = await import('@aws-sdk/cloudfront-signer');

    const url = getCloudfrontSignedUrl({
      url: distributionUrl.toString(),
      keyPairId: `${env('NEXT_PRIVATE_UPLOAD_DISTRIBUTION_KEY_ID')}`,
      privateKey: `${env('NEXT_PRIVATE_UPLOAD_DISTRIBUTION_KEY_CONTENTS')}`,
      dateLessThan: new Date(Date.now() + ONE_HOUR).toISOString(),
    });

    return { key, url };
  }

  const client = getS3Client();

  const { getSignedUrl: getS3SignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const getObjectCommand = new GetObjectCommand({
    Bucket: env('NEXT_PRIVATE_UPLOAD_BUCKET'),
    Key: key,
  });

  const url = await getS3SignedUrl(client, getObjectCommand, {
    expiresIn: ONE_HOUR / ONE_SECOND,
  });

  return { key, url };
};

/**
 * Uploads a file to S3.
 */
export const uploadS3File = async (file: File) => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');
  const { name, ext } = path.parse(file.name);
  const key = `${alphaid(12)}/${slugify(name)}${ext}`;
  const fileBuffer = await file.arrayBuffer();

  if (NEXT_PUBLIC_UPLOAD_TRANSPORT === 'gcs') {
    const bucket = getGCSBucket();
    const gcsFile = bucket.file(key);
    await gcsFile.save(Buffer.from(fileBuffer), {
      contentType: file.type,
    });
    return { key };
  }

  const client = getS3Client();
  const response = await client.send(
    new PutObjectCommand({
      Bucket: env('NEXT_PRIVATE_UPLOAD_BUCKET'),
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    }),
  );

  return { key, response };
};


export const deleteS3File = async (key: string) => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');

  if (NEXT_PUBLIC_UPLOAD_TRANSPORT === 'gcs') {
    const bucket = getGCSBucket();
    await bucket.file(key).delete();
    return;
  }

  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: env('NEXT_PRIVATE_UPLOAD_BUCKET'),
      Key: key,
    }),
  );
};

const getS3Client = () => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');

  if (NEXT_PUBLIC_UPLOAD_TRANSPORT !== 's3') {
    throw new Error('Invalid upload transport');
  }

  const hasCredentials =
    env('NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID') && env('NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY');

  return new S3Client({
    endpoint: env('NEXT_PRIVATE_UPLOAD_ENDPOINT') || undefined,
    forcePathStyle: env('NEXT_PRIVATE_UPLOAD_FORCE_PATH_STYLE') === 'true',
    region: env('NEXT_PRIVATE_UPLOAD_REGION') || 'us-east-1',
    credentials: hasCredentials
      ? {
          accessKeyId: String(env('NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID')),
          secretAccessKey: String(env('NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY')),
        }
      : undefined,
  });
};

export const getGCSClient = () => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');
  if (NEXT_PUBLIC_UPLOAD_TRANSPORT !== 'gcs') {
    throw new Error('Invalid upload transport');
  }

  const clientEmail = env('NEXT_PRIVATE_GCS_CLIENT_EMAIL');
  const privateKey = env('NEXT_PRIVATE_GCS_PRIVATE_KEY');
  const bucketName = env('NEXT_PRIVATE_GCS_BUCKET');

  if (!clientEmail || !privateKey || !bucketName) {
    throw new Error('Missing required GCS credentials');
  }

  return new Storage({
    projectId: env('NEXT_PRIVATE_GCS_PROJECT_ID'),
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
  });
};

export const getGCSBucket = () => {
  const client = getGCSClient();
  const bucketName = env('NEXT_PRIVATE_GCS_BUCKET');
  if (!bucketName) {
    throw new Error('Missing GCS bucket name');
  }
  return client.bucket(bucketName);
};
