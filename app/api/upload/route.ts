import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Configure route to handle larger request bodies
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  console.log('Upload API called (Vercel Blob)');

  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is not configured');
      return NextResponse.json({ 
        error: 'Upload service not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables.' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const directory = formData.get('directory') as string || 'general';

    console.log('File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      directory
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF images are allowed.'
      }, { status: 400 });
    }

    // Validate file size (15MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 15MB.'
      }, { status: 400 });
    }

    // Sanitize filename and prepare path
    const sanitizedFileName = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .toLowerCase();

    // Construct path with directory
    const fileName = `${directory}/${Date.now()}-${sanitizedFileName}`;

    console.log('⬆️ Uploading to Vercel Blob:', fileName);
    console.log('Token available:', !!process.env.BLOB_READ_WRITE_TOKEN);

    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ Upload successful:', blob.url);

    return NextResponse.json({
      url: blob.url,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ Error uploading file:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check server logs for more details'
      },
      { status: 500 }
    );
  }
}