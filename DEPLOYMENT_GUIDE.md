# 🚀 AI SEO Chat App - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [x] Azure OpenAI configured
- [x] Supabase PostgreSQL database ready
- [x] Upstash Redis caching configured
- [x] All environment variables set

### ✅ App Configuration
- [x] Shopify app manifest configured
- [x] Webhooks configured
- [x] Access scopes defined
- [x] App proxy settings ready

## 🎯 Deployment Options

### Option 1: Deploy to Shopify Partners (Recommended for Production)

#### Step 1: Prepare for Production
```bash
# Navigate to your app directory
cd ai-seo-chat

# Install dependencies
npm install

# Build the app
npm run build
```

#### Step 2: Deploy to Shopify Partners
```bash
# Deploy your app
npm run deploy
```

This will:
- Build your app for production
- Deploy to Shopify's infrastructure
- Update your app URLs automatically
- Configure webhooks

#### Step 3: Configure Production Environment
After deployment, update your `.env` file with production URLs:

```env
# These will be automatically set by Shopify CLI
SHOPIFY_API_KEY="your-production-api-key"
SHOPIFY_API_SECRET="your-production-api-secret"
APP_URL="https://your-app-url.shopify.com"
```

### Option 2: Deploy to External Hosting (Vercel, Netlify, etc.)

#### Step 1: Prepare for External Deployment
```bash
# Build the app
npm run build

# The build output will be in the dist/ directory
```

#### Step 2: Deploy to Your Preferred Platform
- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Upload the dist/ folder or connect GitHub
- **Railway**: Deploy directly from GitHub
- **Heroku**: Use the Procfile and deploy

#### Step 3: Update Shopify App Configuration
Update your `shopify.app.toml` with your external URL:

```toml
application_url = "https://your-external-domain.com"
```

## 🧪 Testing Your Deployed App

### 1. Install on Development Store
```bash
# Start development mode
npm run dev

# This will open your app in the browser
# Follow the prompts to install on a development store
```

### 2. Test Core Features

#### Test AI Chat Functionality
1. Go to your app in the Shopify admin
2. Navigate to the chat interface
3. Ask questions about your products
4. Verify AI responses are working

#### Test Product Integration
1. Create or update a product in your store
2. Check if the webhook triggers
3. Verify product data is stored in your database
4. Test AI responses about the product

#### Test Chat Widget
1. Add the chat widget to your storefront
2. Test customer interactions
3. Verify responses are contextual

### 3. Test Database and Caching
```bash
# Test database connection
npm run test:database

# Test Redis caching
npm run test:redis

# Test Supabase connection
npm run test:supabase
```

### 4. Monitor Performance
- Check response times
- Monitor API usage
- Verify caching is working
- Check error logs

## 📱 Setting Up the Chat Widget

### 1. Add to Your Storefront
Add this script to your theme's `layout/theme.liquid`:

```html
<script src="{{ 'chat-widget.js' | asset_url }}" defer></script>
```

### 2. Configure Widget Settings
In your app admin, configure:
- Widget position
- Welcome message
- Chat hours
- Custom styling

### 3. Test Widget Functionality
- Test on desktop and mobile
- Verify chat history
- Test AI responses
- Check for any styling issues

## ⚙️ App Configuration

### 1. Access Scopes
Your app currently has these scopes:
- `write_products` - Update product SEO
- `read_products` - Read product data
- `read_content` - Read blog posts, pages
- `write_content` - Update content SEO

### 2. Webhooks
Configured webhooks:
- `app/uninstalled` - Clean up when app is removed
- `app/scopes_update` - Handle permission changes
- `products/*` - Sync product changes
- `metafields/*` - Track SEO metadata
- `collections/*` - Sync collection changes

### 3. App Proxy
Your app proxy is configured at:
- URL: `https://your-app.com/apps/seo`
- Prefix: `seo`
- Subpath: `apps/seo`

## 📊 Monitoring and Analytics

### 1. Set Up Monitoring
```bash
# Check app logs
shopify app logs

# Monitor webhook deliveries
shopify app webhook list
```

### 2. Database Monitoring
- Monitor Supabase dashboard
- Check query performance
- Monitor connection limits

### 3. Redis Monitoring
- Check Upstash dashboard
- Monitor cache hit rates
- Track memory usage

### 4. Azure OpenAI Monitoring
- Monitor API usage
- Check response times
- Track token consumption

## 🔧 Troubleshooting

### Common Issues

#### 1. App Not Loading
- Check environment variables
- Verify API keys are correct
- Check network connectivity

#### 2. AI Not Responding
- Verify Azure OpenAI configuration
- Check API rate limits
- Monitor error logs

#### 3. Database Connection Issues
- Check Supabase connection string
- Verify database is accessible
- Check Prisma migrations

#### 4. Redis Connection Issues
- Verify Upstash credentials
- Check network connectivity
- Monitor Redis logs

### Debug Commands
```bash
# Test server functionality
npm run test:server

# Test specific components
npm run test:demo

# Check app configuration
shopify app config show
```

## 🚀 Going Live

### 1. Submit for Review (if needed)
- Prepare app description
- Create demo videos
- Document features
- Submit to Shopify App Store

### 2. Production Checklist
- [ ] All tests passing
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Security measures in place
- [ ] Monitoring set up
- [ ] Backup strategy ready

### 3. Launch Strategy
- Soft launch with limited stores
- Monitor performance
- Gather feedback
- Iterate and improve
- Full launch

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error logs
3. Test individual components
4. Contact support if needed

---

**Your app is ready to ship! 🚀**

Follow this guide step by step, and you'll have a fully functional AI SEO Chat app running in production.
