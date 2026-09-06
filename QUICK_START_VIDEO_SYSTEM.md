# Quick Start: Video Tutorial System Setup

## ⚡ 5-Minute Setup

### Prerequisites
- Supabase project created
- Admin user with `is_admin = true` flag

---

## Step 1: Create Database Tables (2 minutes)

1. **Open Supabase Dashboard**
   - Navigate to: SQL Editor

2. **Run the SQL Setup**
   - Open: `VIDEO_TUTORIAL_SETUP.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"
   - Wait for completion ✅

3. **Verify Tables Created**
   ```sql
   SELECT COUNT(*) FROM public.video_categories;
   -- Expected result: 7
   ```

---

## Step 2: Create Storage Buckets (2 minutes)

1. **Go to Storage Section**
   - Navigate to: Supabase → Storage

2. **Create First Bucket**
   - Click "+ New Bucket"
   - Name: `videos-content`
   - Public: OFF (keep private)
   - Click "Create"

3. **Create Second Bucket**
   - Click "+ New Bucket"
   - Name: `video-thumbnails`
   - Public: OFF (keep private)
   - Click "Create"

✅ Both buckets are now private and admin-only

---

## Step 3: Build and Deploy (1 minute)

```bash
# Install if first time
npm install

# Build the project
npm run build

# Expected: "✓ Compiled successfully"
```

---

## ✅ Verification

### Admin Features Available
- [ ] Navigate to `/admin`
- [ ] See "Video Tutorials" tab next to "Orders & Payments"
- [ ] Click tab and see upload interface
- [ ] Upload test video (MP4 file)

### Public Features Available
- [ ] Navigate to `/video-tutorials`
- [ ] See published videos
- [ ] Search and filter work
- [ ] Video player works
- [ ] Navigation link visible

---

## 🎯 What You Can Do Now

### As Admin:
1. **Upload Videos**
   - Click "+ Upload Video" button
   - Fill: Title, Description, Category
   - Select: Video file (MP4/WebM, max 500MB)
   - Select: Thumbnail (JPEG/PNG, max 5MB)
   - Choose: Publish now or later

2. **Manage Videos**
   - Edit: Click "Edit" to change details
   - Publish: Toggle published status
   - Delete: Click "Delete" to remove video

3. **Organize**
   - Use 7 default categories
   - Add more categories (via SQL if needed)

### As Public User:
1. **Browse Videos**
   - See all published tutorials
   - Organized in responsive grid

2. **Find Videos**
   - Search by title or description
   - Filter by category

3. **Watch Videos**
   - Click to open player
   - Full controls and fullscreen

---

## 📝 Default Categories

Pre-created and ready to use:
- Bot Installation
- Bot Setup
- MT4/MT5 Tutorials
- Account Setup
- Trading Tutorials
- Payment Tutorials
- General Tutorials

---

## 🔒 Security (Already Configured)

✅ **What's Protected:**
- Only admins can upload videos
- Only admins can edit/delete videos
- Only published videos are public
- File uploads are validated
- Storage buckets are private

✅ **How It Works:**
- Admin verification on every API call
- Database RLS policies enforce permissions
- File type and size validation
- Service key is server-side only

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Admin access required" error | Verify user has `is_admin = true` in users table |
| Upload fails | Check file format (MP4/WebM) and size (<500MB) |
| Videos not appearing | Verify video is published (check in admin) |
| Storage buckets don't exist | Re-run Step 2 - Create Storage Buckets |
| Build fails | Run `npm install` first, then `npm run build` |

---

## 📚 Full Documentation

For detailed information, see:
- **`VIDEO_TUTORIAL_IMPLEMENTATION_GUIDE.md`** - Complete setup and features
- **`VIDEO_SYSTEM_FILES.md`** - File inventory and structure
- **`VIDEO_TUTORIAL_SETUP.sql`** - Database schema

---

## 🚀 You're Ready!

The video tutorial system is now:
- ✅ Installed
- ✅ Configured
- ✅ Secured
- ✅ Live

Start by uploading your first tutorial video!

---

**Time to Complete:** ~10 minutes  
**Difficulty:** Easy  
**Support:** Check documentation or troubleshooting section
