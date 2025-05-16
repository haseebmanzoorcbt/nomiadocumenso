import { DocumentDataType } from '@prisma/client';
import { base64 } from '@scure/base';
import { PDFDocument } from 'pdf-lib';
import { match } from 'ts-pattern';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { env } from '@documenso/lib/utils/env';

import { AppError } from '../../errors/app-error';
import { createDocumentData } from '../../server-only/document-data/create-document-data';
import { uploadS3File } from './server-actions';

type File = {
  name: string;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

interface PDFPermissions {
  printing?: boolean;
  modifying?: boolean;
  copying?: boolean;
  annotating?: boolean;
  fillingForms?: boolean;
  contentAccessibility?: boolean;
  documentAssembly?: boolean;
}

async function setPDFPermissions(
  inputBuffer: ArrayBuffer,
  permissions: PDFPermissions
): Promise<ArrayBuffer> {
  const tempInputPath = join(tmpdir(), `input-${Date.now()}.pdf`);
  const tempOutputPath = join(tmpdir(), `output-${Date.now()}.pdf`);

  try {
    // Write input buffer to temp file
    await writeFile(tempInputPath, new Uint8Array(inputBuffer));

    // Build pdftk arguments
    const args = [
      tempInputPath,
      'output',
      tempOutputPath,
      'encrypt_128bit',
    ];

    // Add permission flags
    if (permissions.printing) args.push('allow', 'Printing');
    if (permissions.modifying) args.push('allow', 'ModifyContents');
    if (permissions.copying) args.push('allow', 'CopyContents');
    if (permissions.annotating) args.push('allow', 'ModifyAnnotations');
    if (permissions.fillingForms) args.push('allow', 'FillIn');
    if (permissions.contentAccessibility) args.push('allow', 'Accessibility');
    if (permissions.documentAssembly) args.push('allow', 'Assembly');

    // Run pdftk
    await new Promise<void>((resolve, reject) => {
      const pdftk = spawn('pdftk', args);
      
      pdftk.on('error', (err) => reject(new Error(`Failed to run pdftk: ${err.message}`)));
      pdftk.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`pdftk exited with code ${code}`));
      });
    });

    // Read the output file
    const outputBuffer = await readFile(tempOutputPath);
    return outputBuffer.buffer;

  } finally {
    // Clean up temp files
    await Promise.all([
      unlink(tempInputPath).catch(() => {}),
      unlink(tempOutputPath).catch(() => {})
    ]);
  }
}

/**
 * Uploads a document file to the appropriate storage location and creates
 * a document data record.
 */
export const putPdfFileServerSide = async (file: File) => {
  const isEncryptedDocumentsAllowed = false;

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await PDFDocument.load(arrayBuffer).catch((e) => {
    console.error(`PDF upload parse error: ${e.message}`);
    throw new AppError('INVALID_DOCUMENT_FILE');
  });

  if (!isEncryptedDocumentsAllowed && pdf.isEncrypted) {
    throw new AppError('INVALID_DOCUMENT_FILE');
  }

  // Set PDF permissions
  const securedBuffer = await setPDFPermissions(arrayBuffer, {
    printing: true,
    copying: false,
    modifying: false,
    annotating: false,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: false
  });

  // Create a new file with the secured buffer
  const securedFile = new File(
    [securedBuffer],
    file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`,
    { type: 'application/pdf' }
  );

  const { type, data } = await putFileServerSide(securedFile);

  return await createDocumentData({ type, data });
};

/**
 * Uploads a file to the appropriate storage location.
 */
export const putFileServerSide = async (file: File) => {

console.log('putFileServerSide');
  
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

