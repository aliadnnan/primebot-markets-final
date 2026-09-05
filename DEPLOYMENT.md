# PrimeBot Markets - Deployment Guide

Complete guide for deploying the website to production.

## Quick Start (Vercel)

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub, GitLab, or Bitbucket

### 2. Connect Repository
```bash
npm install -g vercel
vercel
```

### 3. Set Environment Variables
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.example`
3. Update with actual payment account details

### 4. Deploy
```bash
vercel --prod
```

Your site will be live at `primebot-website.vercel.app`

## Advanced Deployment Options

### Option 1: Self-Hosted (VPS/Dedicated Server)

#### Requirements
- Linux server (Ubuntu 20.04+)
- Node.js 16+
- npm or yarn
- nginx or Apache
- SSL certificate (Let's Encrypt)

#### Steps

1. **SSH into your server**
```bash
ssh user@your-server-ip
```

2. **Install dependencies**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone repository**
```bash
git clone <your-repo-url>
cd primebot-website
```

4. **Install and build**
```bash
npm install
npm run build
```

5. **Create PM2 startup script**
```bash
sudo npm install -g pm2
pm2 start npm --name "primebot" -- start
pm2 startup
pm2 save
```

6. **Configure nginx**
```bash
sudo nano /etc/nginx/sites-available/primebot
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable and restart nginx**
```bash
sudo ln -s /etc/nginx/sites-available/primebot /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

8. **Install SSL (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: DigitalOcean App Platform

1. **Push to GitHub**
```bash
git push origin main
```

2. **Go to DigitalOcean Dashboard**
   - Click "Apps"
   - Click "Create App"
   - Select your GitHub repository

3. **Configure**
   - Set build command: `npm run build`
   - Set start command: `npm start`
   - Add environment variables

4. **Deploy**
   - Click "Deploy"

### Option 3: AWS Amplify

1. **Sign in to AWS Console**
2. **Go to Amplify** → Connect App
3. **Select GitHub repository**
4. **Configure build settings**:
   - Build command: `npm run build`
   - Start command: `npm start`
5. **Add environment variables**
6. **Deploy**

### Option 4: Netlify

1. **Connect your Git repository**
2. **Set build command**: `npm run build`
3. **Set publish directory**: `.next`
4. **Add environment variables**
5. **Deploy**

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test responsive design on mobile
- [ ] Test all forms (contact, payment, order)
- [ ] Verify payment instructions display correctly
- [ ] Check that support email is correct
- [ ] Test admin dashboard
- [ ] Verify links work (internal and external)
- [ ] Test browser compatibility
- [ ] Check page load speed
- [ ] Verify SEO meta tags
- [ ] Set up SSL/HTTPS
- [ ] Test on different devices
- [ ] Verify analytics setup
- [ ] Set up email notifications
- [ ] Configure backups
- [ ] Set up monitoring/alerts

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# On VPS
sudo certbot certonly --standalone -d yourdomain.com
```

### Auto-renewal
```bash
sudo certbot renew --dry-run
```

## Database Setup (Optional)

If using customer database:

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb primebot_db

# Create user
sudo -u postgres createuser primebot_user
```

## Email Configuration

### Using Gmail SMTP

1. Enable 2-factor authentication
2. Create App Password
3. Set environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password
```

### Using SendGrid

1. Create SendGrid account
2. Create API key
3. Set environment variable:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

## Monitoring & Maintenance

### Set Up Monitoring
- Use Uptime Robot for uptime monitoring
- Set up error tracking with Sentry
- Monitor with New Relic or Datadog

### Regular Maintenance
- Update Node.js dependencies monthly
- Review security vulnerabilities
- Check analytics reports
- Backup customer data
- Review server logs

## Performance Optimization

### Enable Caching
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' }
      ]
    }
  ]
}
```

### Image Optimization
- Use Next.js Image component
- Optimize all images before upload
- Use WebP format where possible

### CDN Setup
- Use Vercel CDN (automatic with Vercel)
- Or set up Cloudflare for any hosting

## Troubleshooting

### Build Fails
```bash
# Clear cache
npm cache clean --force
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Change port
PORT=3001 npm start
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## Backup Strategy

### Automated Backups
```bash
# Cron job for daily backups
0 2 * * * /path/to/backup-script.sh
```

### Manual Backup
```bash
# Backup database
pg_dump primebot_db > backup.sql

# Backup files
tar -czf backup.tar.gz app/ components/ lib/ public/
```

## Security Best Practices

1. **Update regularly**
   - Keep Node.js updated
   - Update npm packages monthly

2. **Environment Variables**
   - Never commit `.env.local`
   - Use strong secrets
   - Rotate keys periodically

3. **HTTPS/SSL**
   - Always use SSL in production
   - Redirect HTTP to HTTPS

4. **Admin Dashboard**
   - Add authentication
   - Use strong passwords
   - Log admin actions

5. **Forms**
   - Validate inputs server-side
   - Implement rate limiting
   - Add CSRF protection

6. **Database**
   - Use parameterized queries
   - Encrypt sensitive data
   - Regular backups

## Support

For deployment issues:
- Check logs: `pm2 logs primebot`
- Email support: chadnan76@gmail.com
- Refer to Next.js docs: https://nextjs.org/docs/deployment

---

**Last Updated:** January 2025
