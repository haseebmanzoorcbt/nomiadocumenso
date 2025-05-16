import { DocumentDataType } from '@prisma/client';
import { base64 } from '@scure/base';
import { PDFDocument } from 'pdf-lib';
import { match } from 'ts-pattern';

import { env } from '@documenso/lib/utils/env';

import { AppError } from '../../errors/app-error';
import { createDocumentData } from '../../server-only/document-data/create-document-data';
import { uploadS3File } from './server-actions';

// @ts-expect-error: No types for 'node-pdftk'
import pdftk from 'node-pdftk';
// Ensure this file is only used on the server

interface File {
  name: string
  type: string
  arrayBuffer: () => Promise<ArrayBuffer>
}


/**
 * Uploads a document file to the appropriate storage location and creates
 * a document data record.
 */
export const putPdfFileServerSide = async (file: File , isDocumentCompleted: boolean) => {
  const isEncryptedDocumentsAllowed = false;

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await PDFDocument.load(arrayBuffer).catch((e) => {
    console.error(`PDF upload parse error: ${e.message}`);
    throw new AppError('INVALID_DOCUMENT_FILE');
  });

  console.log('pdf', pdf.isEncrypted);

  if (!isEncryptedDocumentsAllowed && pdf.isEncrypted) {
    throw new AppError('INVALID_DOCUMENT_FILE');
  }

  //will comment this out when we have a way to test it (User cant upload the document again on NomiaSigns for signing because it will be encrypted and only CopyContents will be allowed)
  const isDocumentCompleted_ = false;
  const finalBuffer = isDocumentCompleted_
    ? await pdftk
        .input(Buffer.from(arrayBuffer))
        .encrypt128Bit()
        .allow('CopyContents')
        .output()
    : Buffer.from(arrayBuffer);

  const securedFile = new File(
    [finalBuffer],
    file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`,
    { type: 'application/pdf' }
  );

  console.log('securedFile', securedFile);

  const { type, data } = await putFileServerSide(securedFile);

  return await createDocumentData({ type, data });
};

/**
 * Uploads a file to the appropriate storage location.
 */
export const putFileServerSide = async (file: File) => {
  const NEXT_PUBLIC_UPLOAD_TRANSPORT = env('NEXT_PUBLIC_UPLOAD_TRANSPORT');

  return await match(NEXT_PUBLIC_UPLOAD_TRANSPORT)
    .with('s3', async () => putFileInS3(file))
    .with('gcs', async () => putFileInS3(file))
    .otherwise(async () => putFileInDatabase(file));
};

const putFileInDatabase = async (file: File) => {
  const contents = await file.arrayBuffer();

  const binaryData = new Uint8Array(contents);

  const asciiData = base64.encode(binaryData);

  return {
    type: DocumentDataType.BYTES_64,
    data: asciiData,
  };
};

const putFileInS3 = async (file: File) => {
  const buffer = await file.arrayBuffer();

  const blob = new Blob([buffer], { type: file.type });

  const newFile = new File([blob], file.name, {
    type: file.type,
  });

  const { key } = await uploadS3File(newFile);

  return {
    type: DocumentDataType.S3_PATH,
    data: key,
  };
};

