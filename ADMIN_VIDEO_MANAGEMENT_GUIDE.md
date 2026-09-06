# Admin Panel & Video Management System Guide

## Overview

This guide explains the new Admin Panel Video Management System added to PrimeBot Markets. The system allows administrators to easily manage video content, including uploading video files and adding external video links from popular platforms.

## Features

### 1. **Admin Panel Dashboard**

The admin panel is located at `/admin` and provides a centralized hub for managing:
- Order and payment verification
- Video content management
- Video category management
- Video statistics and analytics

**Access Control:**
- Only users with `is_admin = true` can access the admin panel
- Non-admins are redirected to the home page
- Authentication is required before accessing any admin features

### 2. **Video Management**

#### Upload Video Files
Admins can upload video files directly to the server:

**Supported Formats:** MP4, WebM
**Max File Size:** 500MB

**Process:**
1. Go to Admin Panel → Click "Video Management" tab
2. Click "+ Upload Video" button
3. Select "Upload File (MP4/WebM)" tab
4. Fill in:
   - Video Title (required)
   - Description (optional)
   - Category (required)
   - Video File (required) - MP4 or WebM
   - Thumbnail Image (optional) - JPEG, PNG, or WebP
5. Check "Publish immediately" if you want the video to be visible to public
6. Click "Upload Video"

**Upload Progress:**
- Real-time progress bar shows upload status
- File is uploaded to Supabase Storage in the `videos` bucket
- Thumbnail is uploaded to `videos/thumbnails` folder

#### Add External Video Links
Admins can add links to videos hosted on external platforms:

**Supported Platforms:**
- YouTube (youtube.com, youtu.be)
- TikTok (tiktok.com)
- Facebook (facebook.com, fb.watch)
- Instagram (instagram.com)
- Vimeo (vimeo.com)
- Any other embeddable video platform

**Process:**
1. Go to Admin Panel → Click "Video Management" tab
2. Click "+ Upload Video" button
3. Select "External Link (YouTube, TikTok, etc.)" tab
4. Fill in:
   - Video Title (required)
   - Description (optional)
   - Category (required)
   - Video URL (required) - Full URL to the video/embed
   - Custom Thumbnail URL (optional) - If not provided, platform default is used
5. Check "Publish immediately" to make it visible to public
6. Click "Add Video Link"

**Platform Detection:**
The system automatically detects which platform the video is from and displays it in the form (e.g., "Detected: YouTube").

#### Edit Videos
To edit an existing video:

1. Go to Admin Panel → Video Management tab
2. Find the video in the list
3. Click "Edit" button
4. Modify:
   - Title
   - Description
   - Category
   - Publish status
5. Click "Update Video"

**Note:** You cannot change the video file/URL itself. If you need a different video, delete and recreate it.

#### Delete Videos
To delete a video:

1. Go to Admin Panel → Video Management tab
2. Find the video in the list
3. Click "Delete" button
4. Confirm the deletion

**Warning:** This action is permanent and cannot be undone.

#### Publish/Unpublish Videos
Videos have a "Published" status that controls visibility:

- **Published = ON**: Video is visible on the public Video Tutorials page
- **Published = OFF**: Video is hidden and only visible in admin panel

You can toggle this when creating or editing a video.

### 3. **Video Categories**

#### What are Categories?
Categories help organize videos and allow visitors to filter videos by type. 

**Default Categories:**
- YouTube Videos
- TikTok Videos
- Facebook Videos
- Instagram Videos
- Trading Tutorials
- Bot Tutorials
- General Tutorials
- Other Videos

#### Create New Category

1. Go to Admin Panel → Click "Video Categories" tab
2. Click "+ Add Category" button
3. Enter:
   - Category Name (required)
   - Description (optional)
4. Click "Create Category"

#### Edit Category

1. Go to Admin Panel → Video Categories tab
2. Find the category
3. Click "Edit" button
4. Modify the name and/or description
5. Click "Update Category"

#### Delete Category

1. Go to Admin Panel → Video Categories tab
2. Find the category
3. Click "Delete" button
4. Confirm deletion

**Note:** Deleting a category does NOT delete videos in that category. Videos remain but become uncategorized.

### 4. **Public Video Tutorials Page**

Visitors can view and filter videos at `/video-tutorials`

**Features:**
- **View All Videos:** Browse all published videos in a grid layout
- **Filter by Category:** Click category buttons to filter videos
- **Search:** Use the search bar to find videos by title or description
- **Watch Videos:**
  - Click any video thumbnail to open it
  - Uploaded videos play in an HTML5 video player
  - External video links open in an iframe viewer
  - Full-screen capability available
- **Video Details:** Title, category, upload date, and description displayed

## Database Schema

### Video Categories Table
```sql
CREATE TABLE video_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES video_categories(id),
  video_url TEXT NOT NULL,          -- File path or external URL
  thumbnail_url TEXT,                -- Thumbnail image URL
  published BOOLEAN DEFAULT FALSE,   -- Visibility flag
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Video Management Endpoints

#### Create Video (POST)
```
POST /api/admin/videos
Headers: Authorization: Bearer {token}
Body: {
  "title": "string",
  "description": "string",
  "category_id": "uuid",
  "video_url": "string",              // File path or URL
  "thumbnail_url": "string|null",
  "published": boolean
}
```

#### Get All Videos (GET)
```
GET /api/admin/videos
Headers: Authorization: Bearer {token}
Response: { success: true, videos: [...] }
```

#### Update Video (PUT)
```
PUT /api/admin/videos/{id}
Headers: Authorization: Bearer {token}
Body: {
  "title": "string",
  "description": "string",
  "category_id": "uuid",
  "published": boolean
}
```

#### Delete Video (DELETE)
```
DELETE /api/admin/videos/{id}
Headers: Authorization: Bearer {token}
```

#### Get Public Videos (GET)
```
GET /api/videos?published=true&category={category_id}
Response: { success: true, videos: [...] }
```

### Upload Endpoints

#### Upload Video File (POST)
```
POST /api/admin/upload-video
Headers: Content-Type: multipart/form-data
Body: FormData with file
Response: { success: true, path: "storage-path" }
```

#### Upload Thumbnail (POST)
```
POST /api/admin/upload-thumbnail
Headers: Content-Type: multipart/form-data
Body: FormData with file
Response: { success: true, path: "storage-path" }
```

### Category Management Endpoints

#### Create Category (POST)
```
POST /api/admin/categories
Headers: Authorization: Bearer {token}
Body: {
  "name": "string",
  "description": "string|null"
}
```

#### Get All Categories (GET)
```
GET /api/videos/categories
Response: { success: true, categories: [...] }
```

#### Update Category (PUT)
```
PUT /api/admin/categories/{id}
Headers: Authorization: Bearer {token}
Body: {
  "name": "string",
  "description": "string|null"
}
```

#### Delete Category (DELETE)
```
DELETE /api/admin/categories/{id}
Headers: Authorization: Bearer {token}
```

## File Structure

### New Files Added

```
app/admin/
├── CategoryManagement.tsx          [NEW] Category management UI
├── page.tsx                        [MODIFIED] Added categories tab
└── VideoManagement.tsx             [MODIFIED] Enhanced with external links

app/api/admin/
├── categories/
│   ├── route.ts                    [NEW] Create categories
│   └── [id]/route.ts               [NEW] Update/delete categories
└── videos/
    ├── route.ts                    [MODIFIED] Enhanced
    └── [id]/route.ts               [MODIFIED] Enhanced
```

### Modified Files

- `app/admin/page.tsx` - Added "Video Categories" tab and imported CategoryManagement
- `app/admin/VideoManagement.tsx` - Added external video link support with platform detection

## Security Features

### Admin Access Control
- All admin endpoints verify user has `is_admin = true`
- SECURITY DEFINER functions prevent privilege escalation
- Session tokens are required for all write operations

### Data Validation
- Title and category are required for all videos
- Video URLs are validated as proper URLs
- File uploads are validated by file type and size

### Storage Security
- Video files are stored in private Supabase bucket
- Thumbnails are stored in private bucket
- Public access is explicitly controlled via RLS policies

## Troubleshooting

### Video Upload Fails
**Error:** "Failed to upload video"
- Check file size (max 500MB)
- Check file format (MP4 or WebM only)
- Verify Supabase credentials in .env
- Check Supabase storage bucket exists and is writable

### External Link Not Playing
**Issue:** Video won't play in public page
- Verify URL is correct and accessible
- Some platforms may require special embed URLs
- Try copying the embed URL from the platform's share menu
- Check browser console for CORS errors

### Categories Not Loading
**Error:** "Error fetching categories"
- Verify database connection
- Check that video_categories table exists in Supabase
- Verify RLS policies allow public read access

### Permission Denied on Admin Page
**Issue:** "You do not have admin access"
- Verify your user account has `is_admin = true` in database
- Check that you're logged in with the correct account
- Contact database administrator to update permissions

## Best Practices

### Thumbnails
- Use high-quality JPEG or PNG images
- Recommended size: 1280x720 pixels
- Keep file size under 5MB
- For external videos, platform usually provides default thumbnail

### Descriptions
- Write clear, concise descriptions
- Include relevant keywords for search
- Mention if video requires subscription/premium
- Add timestamps in description if video is long

### Categories
- Keep category names short and descriptive
- Don't create duplicate categories
- Delete unused categories to keep list clean
- Use consistent naming conventions

### Publishing Strategy
- Test videos by publishing them first
- Review on public page before major announcements
- Unpublish videos temporarily for editing
- Schedule important releases during peak hours

## Limitations & Notes

1. **File Size Limits:** Videos capped at 500MB per upload
2. **Concurrent Uploads:** Upload one video at a time (sequential uploads)
3. **Storage Quota:** Subject to Supabase storage plan limits
4. **External URLs:** Requires that external platform allows embedding
5. **Bandwidth:** Supabase bandwidth limits apply to downloads
6. **Video Formats:** Only MP4 and WebM for file uploads

## Support

For technical issues or questions:
1. Check this guide's Troubleshooting section
2. Review server logs in Supabase dashboard
3. Verify database schema is correctly set up
4. Check environment variables are properly configured

## Future Enhancements

Potential features for future versions:
- Video analytics and view counts
- Comments and ratings on videos
- Playlist/series functionality
- Video encoding/compression on upload
- Advanced search and filtering
- Video recommendation engine
- Automatic thumbnail extraction
- Multi-language video support

---

**Version:** 1.0
**Last Updated:** 2026-09-06
**Status:** Production Ready
