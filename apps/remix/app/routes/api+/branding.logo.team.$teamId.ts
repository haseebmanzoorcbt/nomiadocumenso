import sharp from 'sharp';

import { prisma } from '@documenso/prisma';

import type { Route } from './+types/branding.logo.team.$teamId';

export async function loader({ params }: Route.LoaderArgs) {
  const teamId = Number(params.teamId);

  if (teamId === 0 || Number.isNaN(teamId)) {
    return Response.json(
      {
        status: 'error',
        message: 'Invalid team ID',
      },
      { status: 400 },
    );
  }

  const settings = await prisma.teamGlobalSettings.findFirst({
    where: {
      teamId,
    },
  });

  if (!settings || !settings.brandingEnabled) {
    return Response.json(
      {
        status: 'error',
        message: 'Not found',
      },
      { status: 404 },
    );
  }

  if (!settings.brandingLogo) {
    return Response.json(
      {
        status: 'error',
        message: 'Not found',
      },
      { status: 404 },
    );
  }

  try {
    const logoData = JSON.parse(settings.brandingLogo);
    
    if (logoData.type !== 'BYTES_64' || !logoData.data) {
      throw new Error('Invalid logo data format');
    }

    const binaryData = Buffer.from(logoData.data, 'base64');
    
    const img = await sharp(binaryData)
      .toFormat('png', {
        quality: 80,
      })
      .toBuffer();

    return new Response(img, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': img.length.toString(),
        // Stale while revalidate for 1 hours to 24 hours
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error processing branding logo:', error);
    return Response.json(
      {
        status: 'error',
        message: 'Error processing logo',
      },
      { status: 500 },
    );
  }
}
