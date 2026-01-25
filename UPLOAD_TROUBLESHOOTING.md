# Image Upload Troubleshooting Guide

## Common Upload Issues

### "Failed to upload image" Error

This error can occur for several reasons. Follow these steps to diagnose and fix the issue:

#### 1. Check Vercel Blob Token Configuration

The upload system uses Vercel Blob storage and requires a valid token.

**Test the configuration:**
```bash
# Visit this URL while your dev server is running
http://localhost:3000/api/test-blob
```

**Expected response:**
```json
{
  "configured": true,
  "tokenPrefix": "vercel_blob_rw_...",
  "message": "Vercel Blob token is configured"
}
```

**If token is missing:**
1. Check your `.env` file has: `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...`
2. Get a new token from [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Storage → Blob
3. Restart your dev server after adding the token

#### 2. Check File Requirements

- **Supported formats:** JPEG, JPG, PNG, WebP, AVIF
- **Maximum size:** 15MB
- **Compression:** Images are automatically compressed (except AVIF)

#### 3. Check Environment Variables

Make sure these are set in your `.env` file:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_YOUR_TOKEN_HERE
```

#### 4. Check Server Logs

When an upload fails, check your terminal/console for detailed error messages:

```bash
# Look for these log entries:
❌ BLOB_READ_WRITE_TOKEN is not configured
❌ Error uploading file: [error details]
```

#### 5. Token Generation

If you need to create a new Vercel Blob token:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to: **Storage** → **Blob**
4. Click "Create Store" if you haven't already
5. Copy the `BLOB_READ_WRITE_TOKEN`
6. Add it to your `.env` file
7. Restart the server

## Deployment Checklist

When deploying to Vercel, ensure:

### Environment Variables in Vercel

1. Go to your project settings in Vercel
2. Navigate to: **Settings** → **Environment Variables**
3. Add: `BLOB_READ_WRITE_TOKEN` with your token value
4. Apply to: **Production**, **Preview**, and **Development**
5. Redeploy your application

### Image Domains Configuration

The `next.config.ts` already includes necessary image domains:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.blob.vercel-storage.com',
      pathname: '/**',
    },
  ],
}
```

## Testing Upload Locally

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Blob Configuration
Visit: `http://localhost:3000/api/test-blob`

### 3. Test Image Upload
1. Navigate to: Products → Add Product
2. Try uploading a small image (< 1MB)
3. Check browser console for errors
4. Check terminal for server logs

## Common Error Messages

### "Upload service not configured"
**Cause:** `BLOB_READ_WRITE_TOKEN` environment variable is missing  
**Fix:** Add the token to your `.env` file and restart the server

### "Invalid file type"
**Cause:** Trying to upload unsupported file format  
**Fix:** Only upload JPEG, PNG, WebP, or AVIF images

### "File too large"
**Cause:** File exceeds 15MB limit  
**Fix:** Compress the image before uploading or increase the limit in `app/api/upload/route.ts`

### "Failed to upload file" with network error
**Cause:** Network connectivity issue or invalid Vercel Blob token  
**Fix:** 
1. Check your internet connection
2. Verify the token is valid
3. Try generating a new token from Vercel

## Image Compression

Images are automatically compressed using `browser-image-compression`:

- **JPEG/PNG:** Compressed to max 1MB, 1920px width/height
- **WebP:** Preserved format, compressed
- **AVIF:** No compression (already optimized)

## Directory Structure

Uploaded images are organized by directory:

- `products/` - Product images
- `products/banner/` - Product banner images
- `category-icons/` - Category icons
- `general/` - Other images

## Advanced Debugging

Enable detailed logging:

```typescript
// In app/api/upload/route.ts
console.log('File details:', {
  name: file?.name,
  size: file?.size,
  type: file?.type,
  directory
});
```

Check browser console:
```
F12 → Console → Network tab → Look for /api/upload request
```

## Need Help?

If issues persist:

1. Check Vercel Blob status: [Vercel Status Page](https://www.vercel-status.com/)
2. Review server logs for detailed error messages
3. Verify your Vercel account has active Blob storage
4. Try uploading a different image file
5. Clear browser cache and cookies

## Related Files

- **Upload API:** `app/api/upload/route.ts`
- **Image Uploader Component:** `app/components/ImageUploader.tsx`
- **Environment Config:** `.env`
- **Next.js Config:** `next.config.ts`
- **Test Endpoint:** `app/api/test-blob/route.ts`

---

**Note:** After any configuration changes, always restart your development server for changes to take effect.
