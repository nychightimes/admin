import { NextResponse } from 'next/server';

export async function GET() {
  const tokenExists = !!process.env.BLOB_READ_WRITE_TOKEN;
  const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20);
  
  return NextResponse.json({
    configured: tokenExists,
    tokenPrefix: tokenPrefix ? `${tokenPrefix}...` : 'Not found',
    message: tokenExists 
      ? 'Vercel Blob token is configured' 
      : 'BLOB_READ_WRITE_TOKEN environment variable is missing',
    hint: !tokenExists 
      ? 'Add BLOB_READ_WRITE_TOKEN to your .env file or Vercel environment variables'
      : 'Token looks good. If uploads still fail, check the token validity.'
  });
}
