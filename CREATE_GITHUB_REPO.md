# 🚀 Create GitHub Repository - Step by Step

## 📋 **Step 1: Create GitHub Repository**

### **Go to GitHub:**
1. **Open your browser** and go to: https://github.com
2. **Sign in** to your GitHub account (username: `touchstage`)

### **Create New Repository:**
1. **Click the "+" icon** in the top-right corner
2. **Select "New repository"**

### **Repository Settings:**
1. **Repository name**: `ai-seo-chat`
2. **Description**: `AI-powered chat widget for Shopify stores`
3. **Visibility**: ✅ **Public** (required for Vercel integration)
4. **Initialize**: ❌ **Don't initialize** (we already have code)
5. **Click "Create repository"**

## 📋 **Step 2: Push Your Code**

### **After creating the repository, run these commands:**

```bash
# Make sure you're in the ai-seo-chat directory
cd "/Users/muhammed/Documents/iat/Shopify Apps/ai-seo-chat"

# Add the remote (if not already added)
git remote add origin https://github.com/touchstage/ai-seo-chat.git

# Push your code
git branch -M main
git push -u origin main
```

## 📋 **Step 3: Connect to Vercel**

### **Go to Vercel Dashboard:**
1. **Visit**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import Git Repository**
4. **Select your `ai-seo-chat` repository**

### **Configure Project:**
1. **Framework Preset**: Other
2. **Root Directory**: `./`
3. **Build Command**: `npm run vercel-build`
4. **Output Directory**: `dist`
5. **Click "Deploy"**

## 📋 **Step 4: Set Environment Variables**

### **In Vercel Project Settings:**
Add these environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:8bfMs2J9M.UPZk*@db.upsakgdykdiyeyiomvlr.supabase.co:5432/postgres"

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

## 🎯 **Quick Commands to Run:**

```bash
# Navigate to your project
cd "/Users/muhammed/Documents/iat/Shopify Apps/ai-seo-chat"

# Add remote (if not already added)
git remote add origin https://github.com/touchstage/ai-seo-chat.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🎉 **After Setup:**

### **Your Repository:**
- **URL**: https://github.com/touchstage/ai-seo-chat
- **Public**: ✅ Yes (for Vercel integration)
- **Ready for**: Automatic deployments

### **Benefits:**
- ✅ **Automatic deployments** on every push
- ✅ **Version control** for all changes
- ✅ **Professional workflow**
- ✅ **Easy collaboration**

---

**Follow these steps and your app will be on GitHub with automatic Vercel deployments!** 🚀
