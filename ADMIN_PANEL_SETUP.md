# Admin Panel & Video Upload System - Complete Setup Guide

This guide covers the complete setup and usage of the Admin Panel and Video Upload System in PrimeBot Markets.

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Supabase Storage Buckets](#supabase-storage-buckets)
5. [Admin Panel Features](#admin-panel-features)
6. [Video Upload System](#video-upload-system)
7. [API Endpoints](#api-endpoints)
8. [Admin User Management](#admin-user-management)
9. [Troubleshooting](#troubleshooting)

## Overview

The Admin Panel provides comprehensive management tools for:

- **Order Management**: Review, approve, reject, and mark orders as delivered
- **Video Management**: Upload, edit, publish, and delete tutorial videos
- **Category Management**: Organize videos by categories
- **User Management**: View user profiles and manage admin roles
- **Statistics Dashboard**: View order statistics and revenue tracking

The Video Upload System includes:

- **Video Upload**: Upload MP4/WebM videos up to 500MB
- **Thumbnail Management**: Upload custom thumbnails (JPEG/PNG/WebP up to 5MB)
- **Video Categories**: Organize videos by predefined categories
- **Publishing Control**: Save as draft or publish immediately
- **Video Editing**: Update video metadata and publication status
- **Bulk Management**: List, search, edit, and delete videos

## Database Setup

### Step 1: Create Database Tables

Navigate to **Supabase Dashboard → SQL Editor** and run the database setup from `DATABASE_SETUP.md` (Section 1).

This creates:
- `users` table (extends Supabase Auth)
- `orders` table (tracks bot purchases)
- `bots` table (available products)
- `payment_methods` table (payment options)

### Step 2: Create Video Tables

Run the SQL from `VIDEO_TUTORIAL_SETUP.sql`:

```sql
-- Creates video_categories and videos tables
-- Sets up RLS policies
-- Inserts default categories
```

This creates:
- `video_categories` table
- `videos` table (with foreign key to categories)
- Default categories: Bot Installation, Bot Setup, MT4/MT5 Tutorials, Account Setup, Trading Tutorials, Payment Tutorials, General Tutorials

### Step 3: Enable RLS

Enable Row Level Security on all tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
```

## Environment Configuration

Create a `.env.local` file in the project root with your Supabase credentials:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

**Important Security Notes:**

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose (used in browser)
- `SUPABASE_SERVICE_ROLE_KEY` must be kept **server-side only** (never in browser code)
- Never commit `.env.local` to version control

## Supabase Storage Buckets

### Step 1: Create Storage Buckets

In **Supabase Dashboard → Storage**:

1. Create bucket: `videos-content`
   - Privacy: **Private** (not public)
   - Size limit: 500 MB per file (recommended)

2. Create bucket: `video-thumbnails`
   - Privacy: **Private** (not public)
   - Size limit: 5 MB per file (recommended)

3. Create bucket: `payment-proofs`
   - Privacy: **Private** (not public)
   - Size limit: 10 MB per file

### Step 2: Configure Storage Policies

**For `videos-content` bucket:**

1. Add **SELECT** policy:
   ```
   Name: Admin can view videos
   Target roles: authenticated
   Policy: auth.uid() in (select id from public.users where is_admin = true)
   ```

2. Add **INSERT** policy:
   ```
   Name: Admin can upload videos
   Target roles: authenticated
   Policy: auth.uid() in (select id from public.users where is_admin = true)
   ```

3. Add **UPDATE** policy:
   ```
   Name: Admin can update videos
   Target roles: authenticated
   Policy: auth.uid() in (select id from public.users where is_admin = true)
   ```

4. Add **DELETE** policy:
   ```
   Name: Admin can delete videos
   Target roles: authenticated
   Policy: auth.uid() in (select id from public.users where is_admin = true)
   ```

**Repeat similar policies for `video-thumbnails` bucket.**

**For `payment-proofs` bucket:**

Follow the same pattern for admin-only access to payment proof files.

## Admin Panel Features

### Accessing the Admin Panel

1. Log in with an admin account
2. Navigate to `/admin`
3. If not admin, you'll be redirected to the home page

### Order Management Section

**Features:**

- **View All Orders**: See pending, verified, rejected, and delivered orders
- **Order Details**: Click any order to view full details including:
  - User email and information
  - Bot purchased
  - Payment method and transaction ID
  - Payment proof (if uploaded)
  - Order status and timestamps

- **Actions**:
  - **Approve**: Mark order as verified (payment confirmed)
  - **Reject**: Decline order (must provide rejection reason)
  - **Deliver**: Mark order as delivered (customer received bot)

- **Filtering**:
  - Filter by status (all, pending, verified, rejected, delivered)
  - Search by transaction ID or user email
  - Sort by date

**Order Statuses:**

- `pending_verification`: Payment received, awaiting approval
- `verified`: Payment verified, ready for delivery
- `rejected`: Payment rejected (reason provided)
- `delivered`: Bot delivered to customer

### Video Management Section

**Features:**

- **Upload Video**: Click "+ Upload Video" button
- **Video List**: Browse all uploaded videos with:
  - Thumbnail preview
  - Title and category
  - Publication status (Published/Draft)
  - Upload date
  - Edit and delete options

- **Upload Form Fields**:
  - **Title** (required): Video name
  - **Description** (optional): Video summary
  - **Category** (required): Select from predefined categories
  - **Video File** (required): MP4 or WebM, max 500MB
  - **Thumbnail** (optional): JPEG/PNG/WebP, max 5MB
  - **Publish** (checkbox): Publish immediately or save as draft

- **Edit Video**: 
  - Update title, description, category
  - Change publication status
  - Cannot change video file (delete and re-upload instead)

- **Delete Video**:
  - Removes video and thumbnail files from storage
  - Deletes video record from database
  - Action is permanent (confirmation required)

## Video Upload System

### Upload Process

1. **Click "+ Upload Video"** in Video Management section
2. **Fill in video details**:
   - Title (required)
   - Description (optional but recommended)
   - Category (required)
   - Video file (required)
   - Thumbnail (optional)
   - Publication status (default: Draft)
3. **Click "Upload Video"**
4. **Monitor progress**:
   - Video upload: 0-25%
   - Thumbnail upload: 25-50%
   - Database save: 50-75%
   - Finalization: 75-100%
5. **Success notification** appears when complete

### File Format Requirements

**Video Files:**
- Format: MP4 (H.264 codec) or WebM
- Maximum size: 500 MB
- Recommended resolution: 1920x1080 (Full HD)
- Frame rate: 24-30 fps
- Bitrate: 2-8 Mbps

**Thumbnail Images:**
- Format: JPEG, PNG, or WebP
- Maximum size: 5 MB
- Recommended size: 1280x720 or 1920x1080
- Aspect ratio: 16:9

### Video Categories

Default categories (can be extended via database):

1. **Bot Installation**: How to install and set up trading bots
2. **Bot Setup**: Configuring bot parameters and settings
3. **MT4/MT5 Tutorials**: MetaTrader platform tutorials
4. **Account Setup**: Setting up trading account
5. **Trading Tutorials**: Trading strategies and techniques
6. **Payment Tutorials**: Payment methods and processing
7. **General Tutorials**: Platform features and tips

### Publishing Videos

- **Draft Mode**: Video saved but not visible to public
- **Published**: Video visible to all users in video tutorials section
- **Edit Status**: Change publication status anytime without re-uploading

### Viewing Uploaded Videos

Users can view published videos at:
- `/video-tutorials` - Public video listing page
- Videos filtered by category
- Only published videos are visible to non-admin users

## API Endpoints

### Video Management Endpoints

#### GET `/api/videos`
**Description**: Fetch videos (public or admin)

**Query Parameters:**
- `published` (optional): Filter by publication status
- `category` (optional): Filter by category ID
- `admin=true` (optional): Admin-only, shows all videos

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "category_id": "uuid",
      "video_url": "string",
      "thumbnail_url": "string",
      "published": boolean,
      "created_by": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### GET `/api/videos/categories`
**Description**: Fetch all video categories

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### GET `/api/admin/videos`
**Description**: Fetch all videos (admin only)

**Headers:**
- `Authorization`: Bearer token

**Response:**
```json
{
  "success": true,
  "videos": [...]
}
```

#### POST `/api/admin/videos`
**Description**: Create a new video (admin only)

**Headers:**
- `Authorization`: Bearer token
- `Content-Type`: application/json

**Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "category_id": "uuid",
  "video_url": "string (storage path)",
  "thumbnail_url": "string (optional)",
  "published": boolean
}
```

#### POST `/api/admin/upload-video`
**Description**: Upload video file to storage

**Headers:**
- `Authorization`: Bearer token
- `Content-Type`: multipart/form-data

**Form Data:**
- `file`: Video file (MP4/WebM)

**Response:**
```json
{
  "success": true,
  "path": "string",
  "filename": "string"
}
```

#### POST `/api/admin/upload-thumbnail`
**Description**: Upload thumbnail to storage

**Headers:**
- `Authorization`: Bearer token
- `Content-Type`: multipart/form-data

**Form Data:**
- `file`: Thumbnail image (JPEG/PNG/WebP)

**Response:**
```json
{
  "success": true,
  "path": "string",
  "filename": "string"
}
```

#### PUT `/api/admin/videos/[id]`
**Description**: Update video metadata

**Headers:**
- `Authorization`: Bearer token
- `Content-Type`: application/json

**Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "category_id": "uuid (optional)",
  "published": boolean (optional)
}
```

#### DELETE `/api/admin/videos/[id]`
**Description**: Delete video (admin only)

**Headers:**
- `Authorization`: Bearer token

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### Order Management Endpoints

#### GET `/api/admin/orders`
**Description**: Fetch all orders (admin only)

**Response:**
```json
{
  "success": true,
  "orders": [...]
}
```

#### POST `/api/admin/approve`
**Description**: Approve an order

**Body:**
```json
{
  "orderId": "uuid"
}
```

#### POST `/api/admin/reject`
**Description**: Reject an order

**Body:**
```json
{
  "orderId": "uuid",
  "rejectionReason": "string"
}
```

#### POST `/api/admin/mark-delivered`
**Description**: Mark order as delivered

**Body:**
```json
{
  "orderId": "uuid"
}
```

#### GET `/api/admin/stats`
**Description**: Fetch admin dashboard statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": number,
    "pending": number,
    "verified": number,
    "rejected": number,
    "delivered": number,
    "totalRevenue": number
  }
}
```

## Admin User Management

### Making a User Admin

Admin users can only be created via direct database modification:

1. **Via Supabase Dashboard**:
   - Go to SQL Editor
   - Run:
     ```sql
     UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
     ```

2. **Verify**:
   - User must log out and log back in
   - Admin status checked via `/api/auth/check-admin` endpoint
   - User gains access to `/admin` page

### Security Measures

- **is_admin** flag set server-side only via SECURITY DEFINER function
- Customers cannot escalate privileges
- Admin check uses `is_admin_user()` function to prevent RLS recursion
- All admin API endpoints verify admin status before processing

### Revoking Admin Access

```sql
UPDATE users SET is_admin = false WHERE email = 'admin@example.com';
```

User must log out and log back in for changes to take effect.

## Troubleshooting

### Common Issues

#### 1. "Admin access required" error on Admin Panel

**Causes:**
- User is not marked as admin in database
- User hasn't logged out/in after admin promotion
- Authorization header missing from API calls

**Solutions:**
- Verify user is admin: `SELECT is_admin FROM users WHERE email = 'user@example.com';`
- Make user admin: `UPDATE users SET is_admin = true WHERE email = 'user@example.com';`
- Have user log out and log back in
- Check browser DevTools → Network → look for Authorization header

#### 2. Video upload fails with "Server configuration error"

**Causes:**
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` missing
- Environment variables not loaded

**Solutions:**
- Check `.env.local` file exists in project root
- Verify all environment variables are set
- Restart development server: `npm run dev`

#### 3. Video upload shows "Unauthorized"

**Causes:**
- User not logged in
- Authorization token expired
- User not admin

**Solutions:**
- Ensure user is logged in
- User must be admin
- Refresh page and try again
- Check admin status in database

#### 4. Thumbnail upload fails

**Causes:**
- File type not supported (only JPEG/PNG/WebP allowed)
- File size exceeds 5MB limit
- Storage policy not configured

**Solutions:**
- Use supported image formats
- Reduce image size
- Check Supabase storage policies are configured

#### 5. Categories not loading in dropdown

**Causes:**
- Video categories table not created
- No default categories inserted
- Database not initialized

**Solutions:**
- Run `VIDEO_TUTORIAL_SETUP.sql` in Supabase SQL Editor
- Verify categories exist: `SELECT COUNT(*) FROM video_categories;`
- Check RLS policies allow reading categories

#### 6. Videos not appearing on video tutorials page

**Causes:**
- Videos not published (`published = false`)
- User viewing before videos created
- `video_categories` table missing or empty

**Solutions:**
- Edit video and change status to "Published"
- Create videos via admin panel
- Ensure categories are created (7 default categories)
- Refresh browser cache

#### 7. Storage bucket not found error

**Causes:**
- Buckets not created in Supabase
- Bucket names misspelled
- Storage not enabled in Supabase

**Solutions:**
- Create buckets: `videos-content` and `video-thumbnails`
- Verify bucket names exactly
- Check Supabase project has Storage enabled
- Set buckets to Private (not public)

### Debug Steps

1. **Check environment variables**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

2. **Check admin status**:
   - Open browser DevTools → Console
   - User should be logged in
   - Check `isAdmin` in auth context

3. **Verify database**:
   - Go to Supabase Dashboard → SQL Editor
   - Check table existence:
     ```sql
     SELECT COUNT(*) FROM videos;
     SELECT COUNT(*) FROM video_categories;
     ```

4. **Check storage buckets**:
   - Go to Supabase Dashboard → Storage
   - Verify `videos-content` and `video-thumbnails` exist
   - Check policies are configured

5. **View API responses**:
   - Open browser DevTools → Network tab
   - Make API request
   - Check response JSON for error details

### Performance Optimization

**For Large Video Libraries:**

- Add pagination to video listings (currently loads all)
- Implement lazy-loading for video thumbnails
- Cache category list client-side
- Use CDN for video files

**Implementation:**
```typescript
// Add pagination to /api/admin/videos
const limit = 50
const offset = (page - 1) * limit
const { data, count } = await supabase
  .from('videos')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1)
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/access-control)

## Support

For issues or questions:

1. Check this documentation thoroughly
2. Review browser console for error messages
3. Check Supabase Dashboard for API errors
4. Review git logs for recent changes
5. Test with Supabase dashboard directly

---

**Last Updated**: September 2026  
**Version**: 1.0.0  
**Status**: Production Ready
