import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const frameCount = 182;
    // Serve the optimized .webp frames from the public/frames2 directory
    const urls = Array.from({ length: frameCount }, (_, i) =>
      `/frames2/frame_${(i + 1).toString().padStart(4, '0')}.webp`
    );

    return NextResponse.json({ urls }, {
      headers: {
        // Let browsers and CDNs cache these immutable static assets for a long time
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error building frame URLs:', error);
    return NextResponse.json({ error: 'Failed to build frame URLs' }, { status: 500 });
  }
}

