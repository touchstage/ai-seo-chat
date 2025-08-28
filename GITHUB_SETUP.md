# 🚀 GitHub + Vercel Setup Guide

## 📋 **Step-by-Step Setup:**

### **Step 1: Create GitHub Repository**

1. **Go to GitHub**: https://github.com
2. **Click "New repository"**
3. **Repository name**: `ai-seo-chat`
4. **Description**: `AI-powered chat widget for Shopify stores`
5. **Make it Public** (for Vercel integration)
6. **Don't initialize** (we already have code)
7. **Click "Create repository"**

### **Step 2: Connect Local Repository to GitHub**

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/ai-seo-chat.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

### **Step 3: Connect Vercel to GitHub**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import Git Repository**
4. **Select your `ai-seo-chat` repository**
5. **Configure project settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
6. **Click "Deploy"**

### **Step 4: Configure Environment Variables in Vercel**

In your Vercel project settings, add these environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Azure OpenAI
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_CHAT_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-3-large"
AZURE_OPENAI_API_VERSION="2024-12-01-preview"

# Redis
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Shopify (will be set by Shopify CLI)
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SHOPIFY_SCOPES="write_products,read_products,read_content,write_content"
APP_URL=""
```

### **Step 5: Update Shopify App Configuration**

After Vercel deployment, update your `shopify.app.toml` with the new Vercel URL:

```toml
application_url = "https://your-vercel-url.vercel.app/"
```

### **Step 6: Deploy to Shopify**

```bash
npm run deploy
```

## 🎯 **Benefits of This Setup:**

### **Automatic Deployments**
- ✅ **Push to GitHub** → **Automatic Vercel deployment**
- ✅ **No manual deployment** needed
- ✅ **Version control** for all changes
- ✅ **Rollback capability** if needed

### **Better Development Workflow**
- ✅ **Git version control** for all code changes
- ✅ **Branch deployments** for testing
- ✅ **Pull request previews** before merging
- ✅ **Collaboration** with other developers

### **Production Reliability**
- ✅ **Always online** - No localhost issues
- ✅ **Global CDN** - Fast worldwide access
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **SSL certificates** - Secure by default

## 🔧 **Quick Commands:**

```bash
# After setting up GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/ai-seo-chat.git
git branch -M main
git push -u origin main

# For future updates
git add .
git commit -m "Your commit message"
git push

# Deploy to Shopify after Vercel updates
npm run deploy
```

## 📱 **After Setup:**

### **1. Install Your App**
- Go to: https://partners.shopify.com/4469417/apps/276981317633/test
- Install on your development store

### **2. Add Chat Widget**
- Go to your theme customization
- Add "AI SEO Chat" section
- Save theme

### **3. Test Everything**
- Visit your storefront
- Test the chat widget
- Verify AI responses

## 🎉 **You're All Set!**

With GitHub + Vercel integration:
- ✅ **Automatic deployments** on every push
- ✅ **Version control** for all changes
- ✅ **Reliable hosting** with Vercel
- ✅ **Professional development workflow**

---

**Follow these steps and you'll have a production-ready AI chat app with automatic deployments!** 🚀
