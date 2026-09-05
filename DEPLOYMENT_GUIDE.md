# PrimeBot Markets - Deployment Guide

Complete guide to deploy PrimeBot Markets to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Email Provider Setup](#email-provider-setup)
5. [Google Analytics Setup](#google-analytics-setup)
6. [Build and Test](#build-and-test)
7. [Deployment Options](#deployment-options)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Custom Domain](#custom-domain)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

Before deployment, ensure you have:

- **Node.js 18+** installed on your system
- **npm** or **yarn** as package manager
- A **Supabase account** (free tier available at https://supabase.com)
- A **Resend account** for email (free tier available at https://resend.com)
- A **Google Analytics 4** property (optional but recommended)
- A **Vercel account** for deployment (recommended) or other hosting provider
- **Git** for version control
- A **custom domain** (optional)

---

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone the project
git clone <your-repo-url>
cd primebot-full-stack

# Install dependencies
npm install

# Verify build
npm run build
```

### Step 2: Create Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use your preferred editor
```

### Step 3: Required Environment Variables

Fill in all variables in `.env.local`:

```env
# SUPABASE (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# EMAIL (required)
RESEND_API_KEY=your-resend-api-key-here
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=chadnan76@gmail.com

# APP CONFIGURATION (required)
NEXT_PUBLIC_APP_URL=https://primebot-markets.com
NEXT_PUBLIC_SITE_NAME=PrimeBot Markets

# ANALYTICS (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Supabase Configuration

### Step 1: Create Supabase Project

1. Sign up at https://supabase.com
2. Create a new project
3. Choose your region (select closest to your users)
4. Wait for project initialization (usually 1-2 minutes)

### Step 2: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon (public)** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Open a new query
3. Copy and paste the SQL from `DATABASE_SETUP.md`
4. Run the SQL
5. Verify tables are created: `users`, `orders`, `bots`, `payment_methods`

### Step 4: Create Storage Bucket

1. In Supabase, go to **Storage**
2. Create a new bucket called `payment-proofs`
3. Set it to **Public** (for easy access)
4. Create allowed file types policy

### Step 5: Configure RLS (Row Level Security)

Supabase uses Row Level Security by default. Our app already includes:

- Users can only see their own data
- Admin users have elevated privileges
- Payment proofs are accessible only to order owners and admins

---

## Email Provider Setup

### Using Resend (Recommended)

1. Sign up at https://resend.com
2. Get your **API Key** → `RESEND_API_KEY`
3. Configure sender email:
   - Go to **Domains**
   - Add your domain (e.g., `noreply@primebot-markets.com`)
   - Verify domain DNS records
   - Set `EMAIL_FROM` to your verified domain

### Email Configuration

Emails are sent for:

- **New Orders**: Customer receives order confirmation
- **Payment Verification**: Admin notified of payment submission
- **Payment Approved**: Customer notified payment verified
- **Payment Rejected**: Customer notified of rejection
- **Order Delivered**: Customer notified of delivery

All email templates are in `lib/email.ts`.

---

## Google Analytics Setup

### Step 1: Create GA4 Property

1. Go to https://analytics.google.com
2. Create a new property for your website
3. Set up a web data stream
4. Get your **Measurement ID** (starts with `G-`)

### Step 2: Configure Environment Variable

Set in `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Verify GA4 Tracking

1. Start your application: `npm run dev`
2. Go to GA4 dashboard → **Real-time**
3. Open your website
4. Check that events appear in real-time

---

## Build and Test

### Local Testing

```bash
# Development
npm run dev
# Open http://localhost:3000

# Production build (local)
npm run build
npm start
# Open http://localhost:3000
```

### Test Checklist

- [ ] Homepage loads without errors
- [ ] Navigation menu works
- [ ] Authentication (login/signup) works
- [ ] Payment flow works
- [ ] Admin dashboard accessible (for test admin)
- [ ] All legal pages load
- [ ] FAQ page loads
- [ ] WhatsApp button visible and functional
- [ ] Footer links correct
- [ ] Mobile responsive
- [ ] Google Analytics tracking events

---

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is the optimal choice for Next.js applications.

#### Step 1: Connect Repository

1. Sign up at https://vercel.com
2. Import your Git repository
3. Select your repository from GitHub/GitLab

#### Step 2: Configure Project

1. **Framework**: Next.js (auto-detected)
2. **Build Command**: `npm run build` (default)
3. **Start Command**: `npm start` (default)
4. **Root Directory**: `./` (default)

#### Step 3: Add Environment Variables

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable from your `.env.local`:
   - Click **Add**
   - Name: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Value: Your value
   - Select environments: **Production**, **Preview**, **Development**
3. Add all 8 required variables

#### Step 4: Deploy

1. Click **Deploy**
2. Wait for deployment to complete (usually 2-5 minutes)
3. Get your deployment URL

### Option 2: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create Heroku app
heroku create your-app-name

# Add environment variables
heroku config:set NEXT_PUBLIC_SUPABASE_URL="..."
heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
# ... repeat for all variables

# Deploy
git push heroku main
```

### Option 3: Deploy to AWS/DigitalOcean/Custom Server

1. Build the project: `npm run build`
2. Copy `.next` folder to server
3. Install dependencies on server
4. Set environment variables
5. Start with: `npm start`
6. Use nginx/Apache as reverse proxy
7. Set up SSL with Let's Encrypt

---

## Post-Deployment Verification

### Verify Deployment

```bash
# Check website is accessible
curl https://your-domain.com

# Check build succeeded
curl https://your-domain.com/api/admin/stats  # Should require auth
```

### Test Critical Flows

1. **Homepage**: https://your-domain.com
   - [ ] Loads without errors
   - [ ] All images load
   - [ ] Analytics tracking works

2. **Signup**: https://your-domain.com/auth/signup
   - [ ] Can create account
   - [ ] Receives email
   - [ ] Email links work

3. **Payment Flow**: https://your-domain.com/payment
   - [ ] Can select bot
   - [ ] Can select payment method
   - [ ] Can submit payment
   - [ ] Admin can see order

4. **Admin Dashboard**: https://your-domain.com/admin
   - [ ] Admin can login
   - [ ] Can see orders
   - [ ] Can approve/reject payments
   - [ ] Can mark as delivered

### Check SEO

```bash
# Verify robots.txt
curl https://your-domain.com/robots.txt

# Verify sitemap
curl https://your-domain.com/sitemap.xml

# Test with SEO tools
# Visit: https://www.seobility.net/
# Or: https://www.seotesteronline.com/
```

### Monitor Performance

1. Google Analytics:
   - [ ] Events tracking
   - [ ] User sessions
   - [ ] Conversion tracking

2. Vercel (if using):
   - [ ] Deployment successful
   - [ ] No build errors
   - [ ] Function runtime acceptable
   - [ ] Edge network working

---

## Custom Domain

### Point Domain to Deployment

#### For Vercel

1. Go to **Project Settings** → **Domains**
2. Click **Add**
3. Enter your domain: `primebot-markets.com`
4. Choose domain configuration:
   - **Recommended**: Use Vercel's nameservers
   - **Alternative**: Add CNAME record to your domain provider
5. Follow instructions to configure DNS

#### For Other Providers

1. Get your hosting provider's DNS details
2. Update domain registrar DNS settings:
   - **A Record** or **CNAME Record** pointing to your server
3. Wait for DNS propagation (up to 48 hours, usually 15 minutes)
4. Verify with: `nslookup your-domain.com`

### Configure HTTPS

- **Vercel**: Automatic SSL (Let's Encrypt)
- **Other Providers**: Use Let's Encrypt (free) or purchase certificate
- Redirect HTTP to HTTPS:
  ```nginx
  server {
    listen 80;
    server_name primebot-markets.com;
    return 301 https://$server_name$request_uri;
  }
  ```

---

## Monitoring and Maintenance

### Regular Checks

**Weekly:**
- Check error logs
- Verify all emails being sent
- Test payment flow
- Check database storage

**Monthly:**
- Review analytics
- Check user growth
- Update bot prices if needed
- Review support tickets

**Quarterly:**
- Security audit
- Performance optimization
- Database cleanup
- Backup verification

### Updates and Patches

```bash
# Check for dependency updates
npm outdated

# Update dependencies
npm update

# Update major versions (caution!)
npm audit fix
npm install --save --legacy-peer-deps
```

### Backup Strategy

Supabase provides automatic daily backups. Additionally:

1. Export database regularly:
   - Supabase Dashboard → Backups
   - Schedule daily backups

2. Backup environment files:
   - Store `.env.local` securely
   - Use secure password manager
   - Never commit to Git

3. Document configurations:
   - DNS settings
   - Email templates
   - Payment methods
   - Admin credentials

### Troubleshooting

**Issue: Build fails**
- Check `npm run build` locally
- Verify all environment variables set
- Check Node version compatibility

**Issue: Emails not sending**
- Verify Resend API key correct
- Check sender email verified in Resend
- Check email logs in Supabase

**Issue: Auth not working**
- Verify Supabase keys correct
- Check Supabase auth settings
- Verify callback URLs

**Issue: Analytics not tracking**
- Check Google Analytics Measurement ID
- Verify GA property created
- Check browser console for errors

---

## Security Checklist

- [ ] Environment variables set on production (not in `.env.local`)
- [ ] Service role key only on backend
- [ ] Database RLS policies enabled
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Admin routes protected
- [ ] Sensitive data not logged
- [ ] Regular security audits
- [ ] Dependency updates scheduled
- [ ] Backup strategy implemented

---

## Production Checklist

- [ ] `.env.example` updated with all variables
- [ ] `NEXT_PUBLIC_APP_URL` points to your domain
- [ ] `EMAIL_FROM` set to verified domain
- [ ] Google Analytics Measurement ID configured
- [ ] Database schema fully created
- [ ] Storage bucket created
- [ ] Admin user created
- [ ] All pages tested
- [ ] Mobile responsiveness verified
- [ ] SEO metadata verified
- [ ] Sitemap and robots.txt accessible
- [ ] Monitoring/logging configured
- [ ] Backup strategy implemented
- [ ] Support contact updated
- [ ] Legal pages reviewed

---

## Support

For deployment issues:

- **Email**: chadnan76@gmail.com
- **WhatsApp**: 03014879047
- **Check Documentation**:
  - FULL_STACK_SETUP.md
  - DATABASE_SETUP.md
  - ANALYTICS_SETUP.md

---

## Summary

With this guide, you should be able to:

1. ✅ Set up all external services (Supabase, Resend, Google Analytics)
2. ✅ Configure environment variables
3. ✅ Build and test locally
4. ✅ Deploy to production
5. ✅ Set up custom domain
6. ✅ Verify everything works
7. ✅ Monitor and maintain

**Good luck with your deployment!**
