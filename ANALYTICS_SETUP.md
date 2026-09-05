# Google Analytics 4 Setup Guide

This project includes integrated Google Analytics 4 (GA4) tracking for monitoring user behavior, purchase flow, and important business events.

## Features

The analytics implementation tracks the following events:

### User Events
- **Page Views**: Every page navigation is automatically tracked
- **Customer Login**: Tracked when a user successfully logs in
- **Customer Signup**: Tracked when a new user creates an account

### Product Events
- **Bot Page View**: When a user visits a specific bot details page
- **Bot Selected**: When a user selects a bot during checkout
- **Buy Bot Click**: When a user clicks the "Buy Now" button

### Purchase Flow Events
- **Checkout Started**: When a user proceeds to payment (after selecting a bot)
- **Payment Method Selected**: When a user selects a payment method
- **Payment Proof Submitted**: When a user uploads payment proof
- **Order Created**: When an order is successfully created
- **Payment Approved**: When an admin approves a payment (if you enable admin tracking)

## Setup Instructions

### Step 1: Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Click **Admin** (bottom left)
4. In the **Account** column, click **Create Account**
5. Enter your account name (e.g., "PrimeBot Markets")
6. Click **Next**

### Step 2: Create a Web Stream

1. In the **Property** column, click **Create Property**
2. Enter your property name (e.g., "PrimeBot Website")
3. Select your timezone and currency
4. Click **Create**
5. Select **Web** as your data stream type
6. Enter your website URL (e.g., `https://primebot-markets.com`)
7. Enter your stream name (e.g., "PrimeBot Web")
8. Click **Create Stream**

### Step 3: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID** (starts with `G-`)
2. Copy this ID (it looks like: `G-XXXXXXXXXX`)

### Step 4: Configure Environment Variable

1. Open your `.env.local` file
2. Find the line: `NEXT_PUBLIC_GA_MEASUREMENT_ID=`
3. Paste your Measurement ID after the equals sign:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. Save the file

### Step 5: Restart Your Application

```bash
npm run dev
```

Your application will now track Google Analytics events automatically. Check that the GA script is loaded:
1. Open your browser's Developer Tools (F12)
2. Go to the **Network** tab
3. Look for requests to `googletagmanager.com`
4. If you see them, GA is working!

## Verifying Analytics

### In Google Analytics Dashboard

1. Go to **Analytics** → Your property
2. Click **Real-time** in the left sidebar
3. Open your website in a new tab
4. You should see real-time visitor data

### Testing Events

1. **Page View**: Just navigate around the website
2. **Bot Selected**: Go to /payment and select a bot
3. **Payment Method Selected**: Select a payment method
4. **Customer Login**: Go to /auth/login and log in
5. **Customer Signup**: Go to /auth/signup and create an account

Events should appear in Google Analytics within a few seconds.

## Customizing Event Tracking

The analytics implementation uses reusable helper functions in `lib/analytics.ts`. To add custom event tracking:

```typescript
import { trackCustomEvent } from '@/lib/analytics'

// Track a custom event
trackCustomEvent('my_custom_event', {
  custom_field: 'value',
  custom_number: 123,
})
```

## Privacy and GDPR Compliance

This implementation includes privacy-friendly features:

- **IP Anonymization**: Enabled by default (`anonymize_ip: true`)
- **Conditional Loading**: GA only loads if a Measurement ID is configured
- **No User Identification**: Unless you explicitly set user IDs with `setGAUserId()`

### Privacy Policy Updates

When using Google Analytics, you should:

1. Disclose Analytics usage in your Privacy Policy
2. Obtain user consent if required in your jurisdiction (GDPR, CCPA, etc.)
3. Consider adding a consent banner for better compliance

Example Privacy Policy statement:
> "This website uses Google Analytics to understand how visitors use our site. Google Analytics uses cookies to collect data about visitor behavior. You can opt out by using the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout)."

## Disabling Google Analytics

To temporarily disable Google Analytics:

1. Open `.env.local`
2. Set the measurement ID to empty: `NEXT_PUBLIC_GA_MEASUREMENT_ID=`
3. Restart your application

No events will be tracked while this is disabled.

## Advanced Configuration

### Setting User ID (for logged-in users)

After a user logs in, you can track their actions with their unique ID:

```typescript
import { setGAUserId } from '@/lib/analytics'

// After successful login
setGAUserId(user.id)
```

This is already implemented in the login flow.

### Clearing User ID (on logout)

When a user logs out:

```typescript
import { clearGAUserId } from '@/lib/analytics'

clearGAUserId()
```

## Viewing Reports

### Event Reports

1. In Google Analytics, go to **Reports**
2. Click **Engagement** → **Events**
3. Select an event from the list to see details

### User Journey

1. Go to **Reports** → **Engagement** → **Conversion paths**
2. See how users flow through your purchase funnel

### Real-time Dashboard

1. Go to **Reports** → **Real-time**
2. See live visitor activity and events

## Troubleshooting

### GA is not tracking

1. **Check Measurement ID**: Make sure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
2. **Check Network**: Open DevTools → Network tab, look for googletagmanager.com requests
3. **Browser Extensions**: Some ad blockers block GA. Test in incognito mode
4. **Restart Dev Server**: Changes to `.env.local` require a restart

### Events not appearing

1. **Wait**: It can take 24-48 hours for reports to fully populate
2. **Real-time View**: Events should appear in the Real-time dashboard immediately
3. **Check Event Names**: Make sure event names match what you configured

## Resources

- [Google Analytics Documentation](https://support.google.com/analytics)
- [GA4 Event Implementation Guide](https://support.google.com/analytics/answer/9234069)
- [Privacy Best Practices](https://support.google.com/analytics/answer/9019185)

## Support

For questions about Google Analytics setup, refer to the official documentation or contact Google Analytics support.
