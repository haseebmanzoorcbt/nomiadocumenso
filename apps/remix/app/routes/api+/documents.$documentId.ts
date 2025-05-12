import { z } from 'zod';
import { prisma } from '@documenso/prisma'
import type { LoaderFunctionArgs } from 'react-router'
import { getFileFromS3 } from '@documenso/lib/universal/upload/get-file'

const DocumentIdSchema = z.object({
  documentId: z.string()
})

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    // Validate the document ID
    const { documentId } = DocumentIdSchema.parse({ documentId: params.documentId });

    // Fetch the document data
    const documentIdNumber = Number(documentId)
    if (Number.isNaN(documentIdNumber)) 
      return new Response(JSON.stringify({ error: 'Invalid document ID: must be a number' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })





    const document = await prisma.document.findUnique({
      where: { id: documentIdNumber },
      select: { documentDataId: true }
    });
    console.log(document);
    if (!document?.documentDataId)
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });

    const documentData = await prisma.documentData.findUnique({
      where: { id: document.documentDataId },
      select: {
        id: true,
        type: true,
        data: true,
        initialData: true,
      },
    });

    if (!documentData) {
      return new Response(JSON.stringify({ error: 'Document data not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }


    // const file = await getFileFromS3(documentData.data);

    return new Response(JSON.stringify(documentData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Invalid document ID format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    console.error('Error fetching document data:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 


