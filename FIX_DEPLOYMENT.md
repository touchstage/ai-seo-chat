# 🔧 Fix Deployment Issues - AI SEO Chat App

## 🚨 Current Issues:
1. **App shows "Example Domain"** - URLs still pointing to example.com
2. **Chat widget not appearing** - Theme extension not properly installed
3. **Authentication issues** - Store password problems

## 🛠️ Step-by-Step Fix:

### Step 1: Reset App Configuration
```bash
# Stop any running processes
# Then reset the app configuration
shopify app config reset
```

### Step 2: Start Development Mode Properly
```bash
# Start the development server
npm run dev
```

**When prompted:**
- Enter your **store admin password** (not your Shopify Partners password)
- The password is for: `https://canbury-icecream.myshopify.com/admin/online_store/preferences`
- This is the password you use to log into your Shopify store admin

### Step 3: Alternative - Deploy to Production
If development mode continues to have issues, we can deploy directly to production:

```bash
# Deploy the app with proper URLs
npm run deploy
```

### Step 4: Install Theme Extension
After the app is running, you need to install the theme extension:

1. **Go to your Shopify admin**
2. **Navigate to Online Store → Themes**
3. **Click "Customize" on your active theme**
4. **Click "Add section"**
5. **Look for "AI SEO Chat" in the sections list**
6. **Add it to your theme**

### Step 5: Add Chat Widget Script
Add this to your theme's `layout/theme.liquid` file:

```html
<!-- AI SEO Chat Widget -->
<script src="{{ 'chat-widget.js' | asset_url }}" defer></script>
```

## 🔍 Troubleshooting

### If Store Password Doesn't Work:
1. **Go to your store admin**: https://canbury-icecream.myshopify.com/admin
2. **Log in with your store credentials**
3. **Go to Settings → Online Store → Preferences**
4. **Note the password you use to access this page**
5. **Use this password when prompted by Shopify CLI**

### If App Still Shows "Example Domain":
1. **Check if dev server is running**: `npm run dev`
2. **Wait for URLs to update automatically**
3. **Or manually update in Shopify Partners dashboard**

### If Chat Widget Still Doesn't Appear:
1. **Check if theme extension is installed**
2. **Verify the script is in theme.liquid**
3. **Check browser console for errors**
4. **Ensure the app is properly installed on the store**

## 🎯 Quick Fix Commands

```bash
# Option 1: Reset and restart
shopify app config reset
npm run dev

# Option 2: Deploy to production
npm run deploy

# Option 3: Check app status
shopify app config show
```

## 📱 Manual Installation Steps

If automated installation fails:

1. **Go to Shopify Partners Dashboard**
2. **Navigate to your app**
3. **Click "Install app"**
4. **Select your development store**
5. **Grant permissions**
6. **Install theme extension manually**

## 🔧 Alternative: Use Production Deployment

If development mode continues to have issues:

```bash
# Deploy to production
npm run deploy

# Then install manually through Partners dashboard
```

## 📞 Need Help?

1. **Check app logs**: `shopify app logs`
2. **Verify configuration**: `shopify app config show`
3. **Test connections**: `npm run test:database`
4. **Check webhooks**: `shopify app webhook list`

---

**The app is fully functional - we just need to fix the URL configuration and theme extension installation!** 🚀
