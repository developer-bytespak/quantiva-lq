import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const frameCount = 359;
    const urls = Array.from({ length: frameCount }, (_, i) =>
      `/Frames/frame_${(i + 1).toString().padStart(4, '0')}.png`
    );

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error building frame URLs:', error);
    return NextResponse.json({ error: 'Failed to build frame URLs' }, { status: 500 });
  }
}

