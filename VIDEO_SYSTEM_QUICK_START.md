# Video System - Quick Start Guide

Get your video tutorial system up and running in 5 minutes!

## Prerequisites

- ✅ Supabase project created
- ✅ Environment variables configured (`.env.local`)
- ✅ Database tables created (run `VIDEO_TUTORIAL_SETUP.sql`)
- ✅ Storage buckets created (`videos-content`, `video-thumbnails`)
- ✅ Admin user created
- ✅ User logged in as admin

## Quick Setup (5 Minutes)

### Step 1: Database Setup (1 min)

1. Go to Supabase Dashboard → SQL Editor
2. Copy-paste contents of `VIDEO_TUTORIAL_SETUP.sql`
3. Click "Run" to execute
4. Verify: Should see "Query executed successfully"

### Step 2: Storage Buckets (2 min)

1. Go to Supabase Dashboard → Storage
2. Create bucket:
   - Name: `videos-content`
   - Privacy: Private
3. Create bucket:
   - Name: `video-thumbnails`
   - Privacy: Private

### Step 3: Enable Policies (1 min)

For each bucket (`videos-content` and `video-thumbnails`):

1. Click bucket name
2. Go to "Policies" tab
3. Add policy for each action (SELECT, INSERT, UPDATE, DELETE):
   ```
   Allow admins: auth.uid() in (select id from public.users where is_admin = true)
   ```

### Step 4: Start Uploading! (1 min)

1. Go to `/admin` (must be logged in as admin)
2. Scroll to "Video Management" section
3. Click "+ Upload Video"
4. Fill in details:
   - Title (required)
   - Description (optional)
   - Category (required)
   - Video file (required, MP4 or WebM)
   - Thumbnail (optional, JPEG/PNG/WebP)
5. Click "Upload Video"
6. Wait for progress to complete

## Video Upload Requirements

### Video Files
- **Format**: MP4 (H.264) or WebM
- **Size**: Up to 500 MB
- **Resolution**: 1920x1080 (Full HD) recommended
- **Bitrate**: 2-8 Mbps
- **Frame rate**: 24-30 fps

### Thumbnail Images
- **Format**: JPEG, PNG, or WebP
- **Size**: Up to 5 MB
- **Dimensions**: 1280x720 or 1920x1080
- **Aspect ratio**: 16:9

## Available Categories

1. Bot Installation
2. Bot Setup
3. MT4/MT5 Tutorials
4. Account Setup
5. Trading Tutorials
6. Payment Tutorials
7. General Tutorials

## View Uploaded Videos

### Admin View
- Path: `/admin`
- All videos (published and drafts)
- Can edit, delete, publish/unpublish

### Public View
- Path: `/video-tutorials`
- Only published videos
- Organized by category
- Beautiful gallery layout

## Common Tasks

### Upload a Video

1. Go to `/admin`
2. Scroll to "Video Management"
3. Click "+ Upload Video"
4. Fill form and upload
5. Video appears in list

### Publish a Draft Video

1. Go to `/admin`
2. Find video in list
3. Click "Edit"
4. Check "Published" checkbox
5. Click "Update"

### Change Video Details

1. Go to `/admin`
2. Click "Edit" on video
3. Update title/description/category
4. Click "Update"

### Delete a Video

1. Go to `/admin`
2. Click "Delete" on video
3. Confirm deletion
4. Video and files removed

## Troubleshooting

### Video won't upload

**Check:**
- Video format is MP4 or WebM
- File size under 500 MB
- You're logged in as admin
- Browser allows file uploads
- Network connection is stable

**Fix:**
- Try refreshing page
- Try smaller video file
- Check browser console for errors
- Verify admin status in database

### Thumbnail won't upload

**Check:**
- Image format is JPEG, PNG, or WebP
- File size under 5 MB
- Image dimensions correct (1280x720+)

**Fix:**
- Resize image to smaller dimensions
- Convert to JPEG if needed
- Try optional thumbnail upload (not required)

### Video doesn't appear on public page

**Check:**
- Video is set to "Published" status
- Category is selected
- Video table has records
- You're logged in as user (test in incognito)

**Fix:**
- Edit video and check "Published"
- Clear browser cache (Ctrl+Shift+Del)
- Refresh page
- Check database: `SELECT COUNT(*) FROM videos WHERE published = true;`

### Categories not showing in dropdown

**Check:**
- `video_categories` table exists
- Categories have been inserted
- Database connection working

**Fix:**
- Run `VIDEO_TUTORIAL_SETUP.sql` again
- Verify categories: `SELECT * FROM video_categories;`
- Refresh admin page

## Performance Tips

1. **Keep videos under 100 MB** for faster uploads
2. **Compress videos** before uploading
3. **Optimize thumbnails** (1280x720 ideal)
4. **Use MP4 format** (better compatibility)
5. **Update in batches** (don't upload too many at once)

## Video Compression Tools

### Free Online
- ffmpeg (command line)
- Handbrake (desktop app)
- Online-convert.com

### Command Line Example
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac output.mp4
```

## Next Steps

1. ✅ Upload first video
2. ✅ Publish video
3. ✅ View on `/video-tutorials` page
4. ✅ Add more videos
5. ✅ Organize by categories
6. ✅ Monitor user engagement

## Support

Check `ADMIN_PANEL_SETUP.md` for detailed documentation on:
- Database schema
- API endpoints
- Admin features
- Troubleshooting
- Performance optimization

---

**Time to first video**: ~5 minutes  
**Videos supported**: Unlimited (storage dependent)  
**File types**: MP4, WebM (video), JPEG/PNG/WebP (thumbnails)

Good luck uploading! 🎬
