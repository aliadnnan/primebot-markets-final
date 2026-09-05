# PrimeBot Markets - Full Stack Setup Guide

Complete guide to set up your PrimeBot Markets website with Supabase, email system, and payment verification.

## Overview

This is a **full-stack Next.js application** with:

- **Frontend:** Next.js 14 with React 18 (TypeScript)
- **Backend:** Supabase PostgreSQL database + Auth
- **Authentication:** Supabase Auth (email/password & OAuth)
- **File Storage:** Supabase Storage for payment proofs
- **Email:** Resend for transactional emails
- **Payments:** Manual payment verification with admin approval
- **Orders:** Complete order management system

## Prerequisites

You need accounts for:
1. **[Supabase](https://supabase.com)** - Database & Auth
2. **[Resend](https://resend.com)** - Email service
3. **Node.js** 16+ and npm/yarn

## Step 1: Project Setup

### 1.1 Install Dependencies

```bash
cd primebot-full-stack
npm install
# or
yarn install
```

This installs:
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Auth integration
- `resend` - Email service
- `zod` - Data validation
- `bcryptjs` - Password hashing

### 1.2 Create Environment Variables

Create `.env.local` file in your project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials (see Step 3).

## Step 2: Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project:
   - Choose region closest to you
   - Set strong database password
   - Wait for it to initialize (2-3 minutes)

### 2.2 Get Your API Credentials

1. Go to **Settings** → **API**
2. Copy and save:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT:** Never commit the Service Role Key to GitHub!

### 2.3 Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Copy all SQL from `DATABASE_SETUP.md`
3. Create a new query
4. Paste and run the SQL
5. Verify tables are created in **Tables** section

### 2.4 Enable Authentication

1. Go to **Authentication** → **Providers**
2. **Email/Password:**
   - Enabled by default
   - No configuration needed
3. **Optional - OAuth Providers** (GitHub, Google, etc.):
   - Click provider
   - Add credentials if you want social login

### 2.5 Set Up Storage

1. Go to **Storage** → **Buckets**
2. Create new bucket:
   - Name: `payment-proofs`
   - Make it **Public**
3. Copy and paste this SQL policy in **SQL Editor**:

```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload their payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND auth.role() = 'authenticated'
);

-- Allow users to view their files
CREATE POLICY "Users can view their payment proofs"
ON storage.objects
FOR SELECT
WHERE (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 3: Email Service Setup (Resend)

### 3.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email
4. Go to **API Keys**
5. Copy your API key

### 3.2 Add to Environment Variables

In `.env.local`:

```
RESEND_API_KEY=your-api-key-here
EMAIL_FROM=noreply@primebot-markets.com
ADMIN_EMAIL=your-admin-email@example.com
```

### 3.3 Verify Sending Domain (Production)

For production, verify your domain:

1. In Resend, go to **Domains**
2. Add your domain
3. Add DNS records shown
4. Wait for verification

For development/testing, you can use the default `onboarding@resend.dev` domain.

## Step 4: Environment Variables

Edit `.env.local` with all your credentials:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email (Resend)
RESEND_API_KEY=your-api-key-here
EMAIL_FROM=noreply@primebot-markets.com
ADMIN_EMAIL=chadnan76@gmail.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Step 6: Test Everything

### 6.1 Test Authentication

1. Go to http://localhost:3000/auth/signup
2. Sign up with email/password
3. Check Supabase → **Authentication** for new user

### 6.2 Test Orders

1. Go to http://localhost:3000/payment
2. Select a bot
3. Choose payment method
4. Submit order
5. Check Supabase → **Orders** table

### 6.3 Test Admin Dashboard

1. Make your user admin in Supabase:
   - Go to **users** table
   - Find your user
   - Set `is_admin` to `true`
2. Go to http://localhost:3000/admin
3. See pending orders
4. Test approve/reject

### 6.4 Test Emails

Check Resend dashboard → **Logs** to see emails

## Architecture Overview

### Database Schema

```
users
├── id (UUID) - from Supabase Auth
├── email
├── full_name
├── is_admin
└── created_at

orders
├── id (UUID)
├── user_id (FK → users)
├── bot_id
├── bot_name
├── bot_price
├── payment_method
├── transaction_id
├── payment_proof_url (from Storage)
├── status (pending_verification | verified | rejected | delivered)
├── rejection_reason
├── created_at
└── updated_at

bots (read-only reference)
├── id
├── name
├── price
├── features
└── ...

payment_methods (read-only reference)
├── id
├── name
├── account_number
└── ...
```

### File Structure

```
app/
├── actions/
│   ├── orders.ts        - Customer order actions
│   └── admin.ts         - Admin management actions
├── layout.tsx           - Root layout with auth
├── page.tsx             - Home page
├── payment/
│   └── page.tsx         - Payment flow
├── admin/
│   └── page.tsx         - Admin dashboard
└── ... (other pages)

lib/
├── supabase/
│   ├── client.ts        - Client-side Supabase
│   └── server.ts        - Server-side Supabase
├── email.ts             - Email templates
├── auth.ts              - Auth utilities
└── constants.ts         - App constants

components/
├── Header.tsx
├── Footer.tsx
└── ... (other components)
```

### Data Flow

```
Customer Signs Up
        ↓
Auth stored in Supabase Auth
User profile created in users table
        ↓
Customer Places Order
        ↓
Order created in orders table (status: pending_verification)
Confirmation email sent
Admin notification sent
        ↓
Customer Submits Payment Proof
        ↓
File uploaded to Storage
Order updated with proof URL
        ↓
Admin Reviews in Dashboard
        ↓
Admin Approves Order
        ↓
Status changed to: verified
Approval email sent to customer
        ↓
Admin Marks as Delivered
        ↓
Status changed to: delivered
Customer can download product
```

## Payment Workflow

### Customer Journey

1. **Sign Up/Login** → Create account
2. **Browse Products** → View trading bots
3. **Select Payment** → Choose payment method (JazzCash, etc.)
4. **See Account Number** → Displayed on payment page
5. **Send Payment** → Transfer money to account
6. **Submit Details** → Enter transaction ID + upload screenshot
7. **Order Pending** → Status shows "Pending Verification"
8. **Wait for Admin** → Admin reviews within 24 hours
9. **Payment Approved** → Receive approval email + download link
10. **Download Bot** → Get EA file and setup instructions

### Admin Workflow

1. **Check Dashboard** → http://localhost:3000/admin
2. **See Pending Orders** → Orders with status "pending_verification"
3. **Review Order** → Click to see customer details, transaction ID, payment proof
4. **Make Decision** → Approve or reject
5. **Send Notification** → Email automatically sent to customer
6. **Mark Delivered** → When customer downloads (if needed)

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect in Vercel
1. Go to https://vercel.com
2. Import your repository
3. Add environment variables
4. Deploy

# Production checklist:
- ✅ Use Supabase production project
- ✅ Add verified domain to Resend
- ✅ Set NEXT_PUBLIC_APP_URL to your domain
- ✅ Enable HTTPS
- ✅ Set up domain in Supabase
```

### Other Hosting

- **DigitalOcean App Platform**
- **AWS Amplify**
- **Netlify**
- **Self-hosted Node.js**

## Customization

### Add New Payment Method

1. Edit `DATABASE_SETUP.md` → Add to payment_methods INSERT
2. Run SQL in Supabase
3. Payment displays automatically on /payment page

### Change Prices

1. Go to Supabase → bots table
2. Edit price field
3. Changes appear immediately

### Custom Branding

1. Edit `lib/constants.ts`
2. Update colors in `tailwind.config.ts`
3. Update copy in page files

### Add More Bots

1. In Supabase → Insert into bots table
2. Appears on all pages automatically

## Security Best Practices

✅ **Implemented:**
- Row Level Security (RLS) on all tables
- Service role key never exposed
- Auth tokens managed by Supabase
- Email validation
- File upload validation
- Admin-only operations

⚠️ **Recommendations:**
- Use HTTPS only in production
- Regularly backup Supabase
- Monitor admin access
- Log approval decisions
- Verify payment amounts
- Use verified Resend domain

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL not found"
```
Solution:
1. Create .env.local file
2. Add all variables from .env.example
3. Restart dev server
```

### "Auth session not found"
```
Solution:
1. Check browser cookies allowed
2. Verify Supabase URL is correct
3. Clear browser cache
4. Try different browser
```

### "Can't upload payment proof"
```
Solution:
1. Check file size < 10MB
2. Check file type (image or PDF)
3. Verify storage bucket exists
4. Check storage policies
5. Ensure user is logged in
```

### "Email not sending"
```
Solution:
1. Check RESEND_API_KEY is correct
2. Verify EMAIL_FROM domain
3. Check Resend dashboard logs
4. Test with simple email first
5. In production, verify domain
```

### "Admin dashboard not loading"
```
Solution:
1. Make sure user is admin (is_admin = true)
2. Verify RLS policies on orders table
3. Check database connection
4. Try different user account
```

## Performance Tips

1. **Database Indexes**
   - Orders indexed by user_id, status, created_at
   - Queries optimized for common filters

2. **Caching**
   - Static bots and payment methods
   - Cache payment method details

3. **File Optimization**
   - Compress images before upload
   - Limit file size to 10MB

4. **Email Optimization**
   - Batch email notifications
   - Use templates

## Monitoring

### Supabase Metrics
- Authentication → User growth
- Database → Query performance
- Storage → Usage and costs
- API → Rate limits

### Resend Monitoring
- Email delivery rate
- Bounce rate
- Click-through rate
- Unsubscribe rate

## Support & Resources

### Supabase
- [Docs](https://supabase.com/docs)
- [Discord Community](https://discord.gg/postgres)

### Resend
- [Docs](https://resend.com/docs)
- [Support](https://resend.com/support)

### Next.js
- [Docs](https://nextjs.org/docs)
- [Community](https://github.com/vercel/next.js/discussions)

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database schema
3. ✅ Set up Resend
4. ✅ Add environment variables
5. ✅ Run locally and test
6. ✅ Customize branding
7. ✅ Deploy to production
8. ✅ Monitor and maintain

## Maintenance

### Regular Tasks
- Monitor pending orders
- Review order statistics
- Check email logs
- Update prices/products
- Backup database
- Review admin access

### Updates
- Keep dependencies updated
- Monitor Next.js releases
- Check security advisories
- Update Supabase policies as needed

---

**Your full-stack application is ready!** 🚀

For detailed database setup, see `DATABASE_SETUP.md`
For email templates, see `lib/email.ts`
For server actions, see `app/actions/`
