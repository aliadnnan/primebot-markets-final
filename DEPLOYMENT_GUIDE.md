# PrimeBot Markets - Deployment & Setup Guide

## ⚠️ **CRITICAL: Admin Panel and Video System Setup**

This guide explains how to properly deploy the PrimeBot Markets project with the **Admin Panel** and **Video Management System**.

The project code is **complete and functional**, but requires **Supabase database setup** to work correctly.

---

## 🚀 **Quick Start (5 Steps)**

### **STEP 1: Clone/Extract Project**
```bash
# Extract the project (if using ZIP)
unzip primebot-markets-final.zip
cd primebot-markets-final

# Or clone from GitHub
git clone <your-repo-url>
cd primebot-markets
```

### **STEP 2: Install Dependencies**
```bash
npm install --legacy-peer-deps
```

### **STEP 3: Configure Environment Variables**
Create `.env.local` file with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### **STEP 4: Setup Database (MOST IMPORTANT)**
This is the critical step that fixes the Admin Panel and Video System!

1. Go to your Supabase project dashboard
2. Click **SQL Editor** (left sidebar)
3. Create a new query
4. **Copy the ENTIRE content** from `DATABASE_SETUP.md` Section 1 (Create Database Tables)
5. Paste it into the SQL Editor
6. Click **Run** and wait for completion
7. You should see: "✓ Query complete" 

⚠️ **DO NOT SKIP THIS STEP** - The Admin Panel won't work without these tables!

### **STEP 5: Configure Storage & RLS**

**A) Enable RLS Policies:**
1. Go to SQL Editor again
2. Copy **ENTIRE content** from `DATABASE_SETUP.md` Section 3 (Enable Row Level Security)
3. Paste and **Run**
4. You should see: "✓ Query complete"

**B) Create Storage Buckets:**
Follow the **exact steps** in `DATABASE_SETUP.md` Section 4 to create:
- `payment-proofs` bucket (for payment verification)
- `videos-content` bucket (for video files)
- `video-thumbnails` bucket (for thumbnails)

⚠️ **CRITICAL:** Make sure "Public bucket" toggle is **OFF** for all buckets!

**C) Add Storage Policies:**
1. Go to SQL Editor
2. Copy **ENTIRE content** from `DATABASE_SETUP.md` Section 4 "Add Storage Policies"
3. Paste and **Run**

---

## 💻 **Run the Application**

### Development Mode
```bash
npm run dev
```

Then open: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

---

## 🔑 **Access the Admin Panel**

### 1. Create an Admin User

1. Go to http://localhost:3000/auth/signup and create an account
2. Then in Supabase SQL Editor, run:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your@email.com';
   ```

### 2. Login to Admin Panel
1. Go to http://localhost:3000/auth/login
2. Login with your credentials
3. You are automatically redirected to http://localhost:3000/admin

### 3. Admin Dashboard Features
- **Orders & Payments:** Verify and manage customer orders
- **Video Management:** Upload, edit, delete, and publish videos

---

## 🎬 **Video System Features**

### For Admins
**Access:** http://localhost:3000/admin

**Capabilities:**
- ✅ Upload video files (MP4, WebM)
- ✅ Add external video links (YouTube, TikTok, Facebook, Instagram, Vimeo)
- ✅ Set video title, description, category
- ✅ Upload custom thumbnails
- ✅ Publish/unpublish videos
- ✅ Edit and delete videos

### For Visitors
**Access:** http://localhost:3000/video-tutorials

**Features:**
- ✅ View all published videos
- ✅ Filter by category
- ✅ Search videos
- ✅ Watch uploaded videos
- ✅ Open external links
- ✅ No login required

---

## 🐛 **Troubleshooting**

### Admin Panel doesn't work or redirects home
**Solution:** Make sure you completed **STEP 4** and **STEP 5** above to create database tables and policies.

### Can't upload videos
**Solution:** Verify storage buckets exist and policies are created (STEP 5C).

### Videos don't show on public page
**Solution:** Make sure videos have "Published" toggle **ON** in admin panel.

### Can't login to admin account
**Solution:** Make sure user has `is_admin = true`:
```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

---

## ✅ **Deployment Checklist**

- [ ] Dependencies installed: `npm install --legacy-peer-deps`
- [ ] Build succeeds: `npm run build`
- [ ] `.env.local` configured with Supabase credentials
- [ ] Database tables created (DATABASE_SETUP.md Section 1)
- [ ] RLS policies enabled (DATABASE_SETUP.md Section 3)
- [ ] Storage buckets created (DATABASE_SETUP.md Section 4)
- [ ] Storage policies added (DATABASE_SETUP.md Section 4)
- [ ] Admin user created with `is_admin = true`
- [ ] Can access `/admin` successfully
- [ ] Can upload test video
- [ ] Test video appears on `/video-tutorials`

---

## 🚀 **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# In Vercel Dashboard, add environment variables:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
```

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
*Last Updated: September 6, 2026*
