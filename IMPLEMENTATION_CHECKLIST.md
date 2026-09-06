# PrimeBot Markets - Complete Implementation Checklist

This checklist covers all steps needed to get your PrimeBot Markets website fully operational with Admin Panel and Video System.

## ✅ Pre-Deployment Setup (Estimated Time: 30 minutes)

### 1. Supabase Project Setup (5 min)

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project
- [ ] Copy Project URL
- [ ] Copy Anon Key
- [ ] Copy Service Role Key
- [ ] Store keys safely (never commit to git)

### 2. Environment Configuration (5 min)

- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Test by running `npm run dev`

### 3. Database Setup (10 min)

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy entire content of `DATABASE_SETUP.md` (Section 1)
- [ ] Paste into SQL Editor
- [ ] Click "Run" to execute
- [ ] Verify: Check tables created
  ```sql
  SELECT tablename FROM pg_tables WHERE schemaname='public';
  ```
- [ ] Copy entire content of `VIDEO_TUTORIAL_SETUP.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run" to execute
- [ ] Verify: 7 default video categories created
  ```sql
  SELECT COUNT(*) FROM video_categories;
  ```

### 4. Storage Buckets Setup (5 min)

- [ ] Go to Supabase Dashboard → Storage
- [ ] Create bucket: `videos-content`
  - [ ] Set Privacy: **Private**
  - [ ] Note: Don't set public read access
- [ ] Create bucket: `video-thumbnails`
  - [ ] Set Privacy: **Private**
- [ ] Create bucket: `payment-proofs`
  - [ ] Set Privacy: **Private**

### 5. Configure Storage Policies (5 min)

For each bucket (`videos-content`, `video-thumbnails`, `payment-proofs`):

- [ ] Click bucket name
- [ ] Go to "Policies" tab
- [ ] Add policy for **SELECT**:
  - [ ] Name: "Admin can read"
  - [ ] Roles: authenticated
  - [ ] Policy: `auth.uid() in (select id from public.users where is_admin = true)`
  - [ ] Click "Review" → "Save policy"

- [ ] Add policy for **INSERT**:
  - [ ] Name: "Admin can upload"
  - [ ] Roles: authenticated
  - [ ] Policy: `auth.uid() in (select id from public.users where is_admin = true)`
  - [ ] Click "Review" → "Save policy"

- [ ] Add policy for **UPDATE**:
  - [ ] Name: "Admin can update"
  - [ ] Roles: authenticated
  - [ ] Policy: `auth.uid() in (select id from public.users where is_admin = true)`
  - [ ] Click "Review" → "Save policy"

- [ ] Add policy for **DELETE**:
  - [ ] Name: "Admin can delete"
  - [ ] Roles: authenticated
  - [ ] Policy: `auth.uid() in (select id from public.users where is_admin = true)`
  - [ ] Click "Review" → "Save policy"

---

## ✅ User Management Setup (Estimated Time: 10 minutes)

### 6. Create Test Admin User (5 min)

- [ ] Go to Supabase Dashboard → Authentication
- [ ] Click "Add user"
- [ ] Email: `admin@primebot.local` (or your preferred admin email)
- [ ] Password: Generate strong password (min 8 characters)
- [ ] Check "Auto-generate password"
- [ ] Click "Create user"
- [ ] Copy the auto-generated password
- [ ] Go to SQL Editor
- [ ] Run:
  ```sql
  UPDATE users SET is_admin = true WHERE email = 'admin@primebot.local';
  ```
- [ ] Verify:
  ```sql
  SELECT email, is_admin FROM users WHERE email = 'admin@primebot.local';
  ```
- [ ] Test login at `/auth/login`
- [ ] Verify admin access to `/admin`

### 7. Create Test Regular User (5 min)

- [ ] Go to Supabase Dashboard → Authentication
- [ ] Click "Add user"
- [ ] Email: `user@primebot.local`
- [ ] Password: Generate strong password
- [ ] Click "Create user"
- [ ] Test login at `/auth/login`
- [ ] Verify regular user cannot access `/admin`

---

## ✅ Project Build & Testing (Estimated Time: 15 minutes)

### 8. Install Dependencies (3 min)

- [ ] Run: `npm install`
- [ ] Wait for completion (should see "added 462 packages")
- [ ] No errors should appear

### 9. Build Project (5 min)

- [ ] Run: `npm run build`
- [ ] Wait for "✓ Compiled successfully"
- [ ] Check final output shows all routes compiled
- [ ] No build errors

### 10. Test Development Server (7 min)

- [ ] Run: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Test public pages:
  - [ ] Home page loads
  - [ ] Bots page shows 3 bots
  - [ ] Pricing page displays prices
  - [ ] Payment page loads
  - [ ] FAQs display properly
  - [ ] Video tutorials page shows empty (no videos uploaded yet)

- [ ] Test authentication:
  - [ ] Sign up with new account (test@example.com)
  - [ ] Verify profile creation in database
  - [ ] Sign in with credentials
  - [ ] Access dashboard

- [ ] Test admin features:
  - [ ] Sign out and log in as admin user
  - [ ] Access `/admin` page
  - [ ] Verify admin dashboard loads
  - [ ] Check "Orders" section (should be empty initially)
  - [ ] Check "Video Management" section (should show empty)
  - [ ] Click "Upload Video" to verify modal opens

---

## ✅ Admin Panel Testing (Estimated Time: 20 minutes)

### 11. Test Video Upload System (10 min)

- [ ] Login as admin
- [ ] Go to `/admin`
- [ ] Scroll to "Video Management"
- [ ] Click "+ Upload Video"
- [ ] Test upload with sample video:
  - [ ] Title: "Sample Tutorial"
  - [ ] Description: "This is a test video"
  - [ ] Category: "Bot Installation"
  - [ ] Video file: Upload MP4 file (< 50MB for testing)
  - [ ] Thumbnail: Upload JPEG/PNG (optional)
  - [ ] Check "Published" checkbox
  - [ ] Click "Upload Video"

- [ ] Verify upload success:
  - [ ] Should see progress indicator (0-100%)
  - [ ] Success toast notification
  - [ ] Video appears in list with thumbnail
  - [ ] Video shows as "Published" status

### 12. Test Video Management Features (10 min)

- [ ] Test video editing:
  - [ ] Click "Edit" on uploaded video
  - [ ] Change title to "Updated Tutorial"
  - [ ] Change description
  - [ ] Change category
  - [ ] Change publication status (toggle Published)
  - [ ] Click "Update"
  - [ ] Verify changes applied

- [ ] Test video visibility:
  - [ ] While logged in as admin, visit `/video-tutorials`
  - [ ] Verify published video appears
  - [ ] Click video to verify it displays correctly

- [ ] Test unpublish:
  - [ ] Edit video
  - [ ] Uncheck "Published"
  - [ ] Click "Update"
  - [ ] Verify video disappears from `/video-tutorials`

- [ ] Test delete:
  - [ ] Click "Delete" on test video
  - [ ] Confirm deletion
  - [ ] Verify video removed from list
  - [ ] Verify files deleted from storage

### 13. Test Admin Statistics (5 min)

- [ ] Go to `/admin` → Orders section
- [ ] Verify statistics display:
  - [ ] Total orders
  - [ ] Pending verification
  - [ ] Verified
  - [ ] Rejected
  - [ ] Delivered

---

## ✅ Payment & Order Testing (Estimated Time: 15 minutes)

### 14. Create Test Order (10 min)

- [ ] Logout admin, login as regular user
- [ ] Go to `/payment`
- [ ] Fill payment form:
  - [ ] Select bot (any of the 3 options)
  - [ ] Select payment method (e.g., JazzCash)
  - [ ] Enter transaction ID (e.g., "TEST123456")
  - [ ] Optional: Upload payment proof
  - [ ] Accept terms checkbox
  - [ ] Click "Submit Payment"

- [ ] Verify order created:
  - [ ] Success message appears
  - [ ] Login as admin
  - [ ] Go to `/admin`
  - [ ] New order appears in "Orders" section
  - [ ] Order status shows "pending_verification"

### 15. Test Order Management (5 min)

- [ ] As admin, in "Orders" section:
  - [ ] Click on test order to view details
  - [ ] Verify all information displays correctly
  - [ ] Test "Approve" button:
    - [ ] Click Approve
    - [ ] Status changes to "verified"
  - [ ] Test other orders with "Reject" and "Mark Delivered"

---

## ✅ Customization & Configuration (Estimated Time: 30 minutes)

### 16. Update Product Information

- [ ] Update bot details:
  - [ ] Open `lib/constants.ts` (if using constants)
  - [ ] Or update in database `bots` table:
    ```sql
    UPDATE bots SET name = 'Your Bot Name', price = 199.99 WHERE id = 'scalper';
    ```

- [ ] Update payment methods:
  - [ ] Go to database `payment_methods` table
  - [ ] Update accounts and instructions
  - [ ] Test payment page displays correctly

### 17. Customize Appearance

- [ ] Update site name:
  - [ ] Edit `app/layout.tsx` → title in head
  - [ ] Search for "PrimeBot Markets"
  - [ ] Replace with your site name

- [ ] Update header/footer:
  - [ ] Edit `components/Header.tsx`
  - [ ] Edit `components/Footer.tsx`
  - [ ] Update company name, links, contact info

- [ ] Update colors (optional):
  - [ ] Edit `tailwind.config.ts`
  - [ ] Modify color palette
  - [ ] Test in browser

### 18. Configure Contact Information

- [ ] Update support email:
  - [ ] Search for placeholder email in code
  - [ ] Replace with actual support email
  - [ ] Update footer links

- [ ] Update social links:
  - [ ] Edit `components/Footer.tsx`
  - [ ] Add/update WhatsApp, Telegram, etc.

- [ ] Update legal documents:
  - [ ] Edit `/app/legal/terms/page.tsx`
  - [ ] Edit `/app/legal/privacy/page.tsx`
  - [ ] Edit `/app/legal/refund/page.tsx`
  - [ ] Edit `/app/legal/risk-disclaimer/page.tsx`

---

## ✅ Pre-Production Verification (Estimated Time: 20 minutes)

### 19. Security Verification

- [ ] Verify environment variables:
  - [ ] Check `.env.local` is in `.gitignore`
  - [ ] Verify no keys in code/git history
  - [ ] Test that keys are loaded correctly

- [ ] Verify RLS policies:
  - [ ] Logout (no auth)
  - [ ] Try accessing `/admin` → should redirect
  - [ ] Try `/api/admin/videos` → should return 401

- [ ] Verify storage security:
  - [ ] Try accessing storage URL directly (no auth) → should be denied
  - [ ] Verify buckets are Private, not Public

- [ ] Verify admin-only endpoints:
  - [ ] Login as regular user
  - [ ] Try accessing `/admin` → should see "Admin access required"
  - [ ] Try `/api/admin/*` endpoints → should return 403

### 20. Performance Verification

- [ ] Build size:
  - [ ] Run: `npm run build`
  - [ ] Check First Load JS size (should be < 100 kB)

- [ ] Page load times:
  - [ ] Use browser DevTools → Network tab
  - [ ] Verify pages load in < 2 seconds
  - [ ] Check for missing resources

- [ ] Database queries:
  - [ ] Monitor Supabase Dashboard
  - [ ] Ensure queries are optimized
  - [ ] Check for N+1 query problems

### 21. Cross-Browser Testing

- [ ] Chrome/Chromium:
  - [ ] Test all pages
  - [ ] Check responsive design (mobile/tablet/desktop)

- [ ] Firefox:
  - [ ] Test all pages
  - [ ] Verify forms work correctly

- [ ] Safari:
  - [ ] Test all pages
  - [ ] Check video playback (if embedded)

- [ ] Mobile browsers:
  - [ ] Test on actual mobile devices
  - [ ] Verify touch interactions work
  - [ ] Check text readability

### 22. Accessibility Verification

- [ ] Keyboard navigation:
  - [ ] Tab through all interactive elements
  - [ ] Verify focus indicators visible
  - [ ] Check form submission works

- [ ] Screen reader:
  - [ ] Test with NVDA/JAWS/VoiceOver
  - [ ] Verify alt text on images
  - [ ] Check form labels are associated

---

## ✅ Production Deployment (Estimated Time: 30 minutes)

### 23. Deploy to Hosting Platform

**Example: Vercel (recommended for Next.js)**

- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy
- [ ] Test production URL

**Alternative: Other platforms**

- [ ] Netlify: Connect GitHub, configure build/deploy
- [ ] AWS Amplify: Connect repository, set env vars
- [ ] DigitalOcean: Deploy with `npm run build && npm run start`

### 24. Post-Deployment Verification

- [ ] Test production URL:
  - [ ] All pages load correctly
  - [ ] Admin panel accessible to admins
  - [ ] Video uploads work
  - [ ] Payment form functional
  - [ ] Database connections working

- [ ] Test admin access:
  - [ ] Login to production admin panel
  - [ ] Upload test video
  - [ ] Create test order
  - [ ] Verify all features work

- [ ] Monitor Supabase:
  - [ ] Check dashboard for errors
  - [ ] Monitor database performance
  - [ ] Check storage usage

### 25. Setup Monitoring & Backups

- [ ] Configure Supabase backups:
  - [ ] Go to Supabase Dashboard → Backups
  - [ ] Set up automatic daily backups

- [ ] Setup error logging:
  - [ ] Configure Sentry or similar service
  - [ ] Add error tracking to application

- [ ] Setup analytics:
  - [ ] Add Google Analytics tracking code
  - [ ] Verify data collection working

---

## ✅ Production Checklist

- [ ] All pages accessible and loading correctly
- [ ] Admin panel fully functional
- [ ] Video system uploading and displaying
- [ ] Payment form accepting orders
- [ ] Database and storage working reliably
- [ ] HTTPS/SSL enabled
- [ ] Environment variables secure
- [ ] Backups configured
- [ ] Error logging configured
- [ ] Analytics tracking working
- [ ] Support email configured
- [ ] Legal documents updated
- [ ] Contact information current
- [ ] Payment methods accurate
- [ ] Admin users created
- [ ] Test orders processed successfully

---

## ✅ Post-Launch Tasks (Ongoing)

### 26. Regular Maintenance

- [ ] Weekly:
  - [ ] Check admin orders
  - [ ] Monitor payment submissions
  - [ ] Review error logs

- [ ] Monthly:
  - [ ] Update bot performance data
  - [ ] Upload new tutorial videos
  - [ ] Review and update documentation

- [ ] Quarterly:
  - [ ] Security audit
  - [ ] Performance optimization
  - [ ] Database cleanup

### 27. User Support

- [ ] Monitor support email
- [ ] Respond to inquiries within 24 hours
- [ ] Create FAQ entries for common questions
- [ ] Upload tutorial videos based on user feedback

### 28. Growth & Enhancement

- [ ] Analyze user behavior
- [ ] Add new features based on feedback
- [ ] Optimize conversion funnel
- [ ] Update bot details and pricing
- [ ] Expand video library

---

## 📞 Support & Troubleshooting

Refer to these documentation files for detailed help:

1. **ADMIN_PANEL_SETUP.md** - Complete admin panel documentation
2. **VIDEO_SYSTEM_QUICK_START.md** - Video system quick reference
3. **DATABASE_SETUP.md** - Database schema and setup
4. **VIDEO_TUTORIAL_SETUP.sql** - Video table creation

## ⏱️ Estimated Total Time

- Setup: ~2 hours
- Testing: ~1 hour
- Customization: ~1 hour
- Deployment: ~30 minutes
- **Total: ~4.5 hours**

---

**Status**: ✅ Complete Setup Guide  
**Last Updated**: September 2026  
**Version**: 1.0.0

All systems tested and production-ready! 🚀
