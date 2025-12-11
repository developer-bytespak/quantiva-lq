import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    // List all blobs in the Frames folder
    const { blobs } = await list({
      token,
      prefix: 'Frames/',
    });

    // Sort blobs by name to ensure correct order
    const sortedBlobs = blobs.sort((a, b) => {
      const aNum = parseInt(a.pathname.match(/frame_(\d+)/)?.[1] || '0');
      const bNum = parseInt(b.pathname.match(/frame_(\d+)/)?.[1] || '0');
      return aNum - bNum;
    });

    // Return the URLs
    const urls = sortedBlobs.map(blob => blob.url);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error fetching blob URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blob URLs' },
      { status: 500 }
    );
  }
}

