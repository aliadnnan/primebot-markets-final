# PrimeBot Markets - Trading Bot Sales Website

A professional, modern, and fully responsive Next.js website for selling automated trading Expert Advisors (EAs).

## 🚀 Features

- **Multi-Page Website** - Home, Bots, Performance, Pricing, Payment, Support, FAQ, and Admin Dashboard
- **Modern Design** - Dark theme with gradient accents, glassmorphism effects, and smooth animations
- **Responsive Layout** - Fully optimized for mobile, tablet, and desktop
- **Payment Integration Ready** - Support for JazzCash, Easypaisa, Binance, and Bybit
- **Order Management System** - Complete payment verification and order tracking
- **Admin Dashboard** - Manage orders, verify payments, and track customer data
- **Video Tutorial System** - Upload, manage, and publish tutorial videos
- **Video Categories** - Organize videos by topic (Installation, Setup, Tutorials, etc.)
- **Storage Management** - Secure Supabase storage for videos and thumbnails
- **Performance Analytics** - Backtest results and trading performance display
- **Risk Disclaimers** - Professional financial risk disclosures throughout
- **Contact Forms** - Customer support and inquiry management
- **TypeScript** - Full type safety and better development experience
- **Tailwind CSS** - Utility-first styling framework
- **SEO Optimized** - Meta tags, structured data, and semantic HTML

## 📋 Project Structure

```
primebot-website/
├── app/
│   ├── layout.tsx              # Root layout with header and footer
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── bots/
│   │   └── page.tsx            # Trading bots listing page
│   ├── pricing/
│   │   └── page.tsx            # Pricing page
│   ├── performance/
│   │   └── page.tsx            # Performance and backtest results
│   ├── payment/
│   │   └── page.tsx            # Payment flow and order form
│   ├── support/
│   │   └── page.tsx            # Support and contact page
│   └── admin/
│       └── page.tsx            # Admin dashboard
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Footer component
│   ├── PricingCard.tsx         # Reusable pricing card
│   └── RiskDisclaimer.tsx      # Risk disclaimer component
├── lib/
│   └── constants.ts            # All product data and constants
├── types/
│   └── index.ts                # TypeScript type definitions
├── package.json                # Dependencies
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind configuration
└── postcss.config.js           # PostCSS configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd primebot-website
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure payment methods**
Edit `lib/constants.ts` and replace placeholders with actual payment details:
```typescript
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    description: 'Mobile payment through JazzCash (Pakistan)',
    placeholder: 'YOUR_JAZZCASH_ACCOUNT_HERE',
  },
  // ... other payment methods
]
```

4. **Update support email**
In `lib/constants.ts`, change:
```typescript
export const SUPPORT_EMAIL = 'chadnan76@gmail.com' // Replace with your email
```

5. **Run development server**
```bash
npm run dev
# or
yarn dev
```

6. **Open in browser**
Navigate to `http://localhost:3000`

## 📦 Customization

### Colors & Branding
Edit `tailwind.config.ts` to customize colors:
```typescript
colors: {
  primary: '#0F172A',      // Main background
  secondary: '#1E293B',    // Secondary background
  accent: '#3B82F6',       // Primary accent
  accentLight: '#60A5FA',  // Light accent
}
```

### Product Information
All product data is in `lib/constants.ts`:
- `BOTS` - Trading bot packages
- `PAYMENT_METHODS` - Payment options
- `PERFORMANCE_DATA` - Monthly performance metrics
- `BACKTEST_RESULTS` - EA backtest results
- `SUPPORT_EMAIL` - Support contact email

### Content
Edit individual page files in the `app/` directory:
- `app/page.tsx` - Home page
- `app/bots/page.tsx` - Bots listing
- `app/pricing/page.tsx` - Pricing page
- `app/performance/page.tsx` - Performance page
- `app/support/page.tsx` - Support page

## 🌐 Pages Overview

### Home Page (`/`)
- Hero section with tagline
- Feature highlights
- Why choose us section
- How it works guide
- Featured products
- Call-to-action sections

### Trading Bots Page (`/bots`)
- Detailed bot descriptions
- Feature comparison table
- How each bot works
- FAQ section
- Strategy explanations

### Performance Page (`/performance`)
- Backtest results
- Monthly performance metrics
- Live trading results
- Key metrics and charts
- Important disclaimers

### Pricing Page (`/pricing`)
- Pricing cards
- Package comparison
- Feature lists
- Payment methods
- Value proposition

### Payment Page (`/payment`)
- 5-step purchase flow
- Bot selection
- Payment method selection
- Payment instructions
- Order form
- Transaction confirmation

### Support Page (`/support`)
- Contact form
- Email support
- Response time info
- FAQ section
- Knowledge base resources

### Admin Dashboard (`/admin`)
- Order management table
- Order filtering and search
- Payment verification
- Status management
- Customer details

## 💳 Payment Integration

### Placeholder Setup
All payment account numbers are currently placeholders. Replace them in `lib/constants.ts`:

```typescript
placeholder: 'JazzCash Account: 03001234567',  // Example
placeholder: 'Easypaisa Account: 03001234567', // Example
placeholder: 'Binance Address: 1A1z7a...', // Example
placeholder: 'Bybit Address: 1A1z7a...', // Example
```

### Manual Verification Process
1. Customer selects payment method and EA
2. Customer sees payment instructions with account details
3. Customer sends payment
4. Customer enters transaction ID and proof (optional)
5. Admin verifies payment manually
6. Admin changes status to "Verified"
7. EA file is sent to customer email

## 🔐 Security Considerations

- All form submissions are simulated (no real API calls)
- Implement backend verification for production
- Add proper authentication for admin dashboard
- Use environment variables for sensitive data
- Implement CSRF protection
- Add rate limiting to forms

## 📱 Responsive Design

The website is fully responsive:
- **Mobile** - Optimized for screens < 640px
- **Tablet** - Optimized for screens 640px - 1024px
- **Desktop** - Optimized for screens > 1024px

## 🎨 Design Features

- **Dark Theme** - Eye-friendly dark color scheme
- **Glassmorphism** - Modern frosted glass effects
- **Gradients** - Smooth color transitions
- **Animations** - Fade-in and slide-up effects
- **Typography** - Professional font hierarchy
- **Icons** - Emoji and SVG icons throughout
- **Forms** - Styled input fields and buttons

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

The project is built with Next.js and can be deployed to:
- Netlify
- AWS Amplify
- Heroku
- DigitalOcean
- Any Node.js hosting

## 🔄 Production Checklist

- [ ] Update all placeholder payment accounts
- [ ] Change support email address
- [ ] Update product descriptions and pricing
- [ ] Implement backend API for order processing
- [ ] Add proper authentication for admin panel
- [ ] Enable HTTPS/SSL
- [ ] Set up email notifications
- [ ] Add payment gateway integration
- [ ] Implement user database
- [ ] Set up analytics tracking
- [ ] Add cookie consent
- [ ] Test all forms and flows
- [ ] Test mobile responsiveness
- [ ] Set up error logging
- [ ] Configure backup system

## 🎬 Admin Panel & Video System

### Overview

The Admin Panel provides complete management tools for orders and video tutorials:

- **Order Management**: Review, approve, reject, and deliver orders
- **Video Tutorials**: Upload, organize, edit, and publish tutorial videos
- **Storage Management**: Secure Supabase storage for video files and thumbnails
- **User Management**: View profiles and manage admin roles
- **Dashboard Statistics**: Order metrics and revenue tracking

### Quick Start

1. **Setup Database** (5 min):
   - Run `VIDEO_TUTORIAL_SETUP.sql` in Supabase SQL Editor
   - Run database setup from `DATABASE_SETUP.md`

2. **Create Storage Buckets** (2 min):
   - Create `videos-content` bucket (Private)
   - Create `video-thumbnails` bucket (Private)
   - Configure storage policies for admin access

3. **Make User Admin** (1 min):
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
   ```

4. **Access Admin Panel**:
   - Login as admin user
   - Navigate to `/admin`
   - Start managing orders and videos

### Video Upload

**Requirements:**
- **Video Format**: MP4 (H.264) or WebM
- **Max Size**: 500 MB
- **Recommended**: 1920x1080, 24-30 fps, 2-8 Mbps

**Thumbnail:**
- **Format**: JPEG, PNG, or WebP
- **Max Size**: 5 MB
- **Recommended**: 1280x720 or 1920x1080

### Video Categories

Default categories (extensible):
1. Bot Installation
2. Bot Setup
3. MT4/MT5 Tutorials
4. Account Setup
5. Trading Tutorials
6. Payment Tutorials
7. General Tutorials

### Admin Features

- **Order Dashboard**: View all orders with filtering and search
- **Order Approvals**: Verify payments and approve orders
- **Order Rejection**: Reject payments with custom reasons
- **Order Delivery**: Mark orders as delivered
- **Video Upload**: Upload MP4/WebM videos with automatic progress tracking
- **Video Management**: Edit, publish/unpublish, and delete videos
- **Statistics**: View order counts by status and total revenue

### API Endpoints

**Video Management:**
- `GET /api/videos` - Fetch published videos
- `GET /api/videos/categories` - Fetch all categories
- `GET /api/admin/videos` - Fetch all videos (admin)
- `POST /api/admin/videos` - Create video (admin)
- `POST /api/admin/upload-video` - Upload video file
- `POST /api/admin/upload-thumbnail` - Upload thumbnail
- `PUT /api/admin/videos/[id]` - Update video (admin)
- `DELETE /api/admin/videos/[id]` - Delete video (admin)

**Order Management:**
- `GET /api/admin/orders` - Fetch all orders (admin)
- `GET /api/admin/stats` - Fetch dashboard stats (admin)
- `POST /api/admin/approve` - Approve order (admin)
- `POST /api/admin/reject` - Reject order (admin)
- `POST /api/admin/mark-delivered` - Mark delivered (admin)

### Documentation Files

- **ADMIN_PANEL_SETUP.md** - Complete setup guide with database schema and API reference
- **VIDEO_SYSTEM_QUICK_START.md** - Quick start guide for video system
- **DATABASE_SETUP.md** - Full database setup instructions
- **VIDEO_TUTORIAL_SETUP.sql** - SQL script for video tables and RLS policies

### Security Features

- **RLS Policies**: Row-level security on all tables
- **Admin-Only Access**: All admin endpoints verify admin role
- **SECURITY DEFINER Functions**: Prevent privilege escalation
- **Private Storage**: Videos and thumbnails not publicly accessible
- **Server-Side is_admin**: Admin flag set server-side only

## 📊 Analytics Integration

To add analytics, update `app/layout.tsx`:

```typescript
// Google Analytics
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🔗 External Links

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MetaTrader Documentation](https://www.metatrader4.com/)

## 📝 License

This project is proprietary software for PrimeBot Markets.

## 👥 Support

For technical issues or questions:
- Email: chadnan76@gmail.com
- Website: https://primebot.example.com

## 🤝 Contributing

This is a commercial project. For modifications or custom features, contact the development team.

## 📈 Future Enhancements

- [ ] User accounts and dashboard
- [ ] License key system
- [ ] Automated email notifications
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Multi-language support
- [ ] Advanced admin analytics
- [ ] Customer review system
- [ ] Affiliate program
- [ ] Blog/Knowledge base
- [ ] Video tutorials

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Production Ready
