# 🔧 Azure OpenAI Setup Guide

This guide will walk you through setting up Azure OpenAI for the AI SEO Chat app.

## 🚀 Step-by-Step Setup

### 1. **Create Azure Account**
- Go to [Azure Portal](https://portal.azure.com)
- Sign up for a free account (includes $200 credit)
- Complete the registration process

### 2. **Create Azure OpenAI Resource**

1. **Navigate to Azure OpenAI**:
   - In Azure Portal, search for "Azure OpenAI"
   - Click "Create"

2. **Fill in the Basics**:
   - **Subscription**: Choose your subscription
   - **Resource group**: Create new or use existing
   - **Region**: Choose a region close to you (e.g., East US, West Europe)
   - **Name**: Give your resource a name (e.g., "ai-seo-chat-openai")
   - **Pricing tier**: Choose "Standard S0" (pay-as-you-go)

3. **Review and Create**:
   - Review the settings
   - Click "Create"
   - Wait for deployment (5-10 minutes)

### 3. **Get Your Configuration Details**

1. **Go to your Azure OpenAI resource**
2. **Copy the Endpoint URL**:
   - Go to "Keys and Endpoint"
   - Copy the "Endpoint" URL
   - Format: `https://your-resource-name.openai.azure.com`

3. **Get API Key**:
   - In "Keys and Endpoint", copy "Key 1" or "Key 2"
   - Keep this secure!

### 4. **Deploy Required Models**

1. **Go to "Model deployments"**:
   - In your Azure OpenAI resource
   - Click "Model deployments"

2. **Deploy GPT-4 for Chat**:
   - Click "Create"
   - **Deployment name**: `gpt-4`
   - **Model**: `gpt-4` (or `gpt-4o` if available)
   - **Version**: Latest
   - Click "Create"

3. **Deploy Embedding Model**:
   - Click "Create" again
   - **Deployment name**: `text-embedding-ada-002`
   - **Model**: `text-embedding-ada-002`
   - **Version**: Latest
   - Click "Create"

### 5. **Configure Your App**

Update your `.env` file with the Azure OpenAI details:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-api-key-from-step-3"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
AZURE_OPENAI_CHAT_DEPLOYMENT="gpt-4"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-ada-002"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
```

### 6. **Test Your Setup**

1. **Start the test server**:
   ```bash
   npm run test:server
   ```

2. **Check configuration**:
   - Visit `http://localhost:3001/config`
   - Verify all settings are correct

3. **Run tests**:
   ```bash
   npm run test:demo
   ```

## 🔍 Troubleshooting

### **"Resource not found"**
- Check your endpoint URL is correct
- Ensure the resource is fully deployed

### **"Deployment not found"**
- Make sure you've deployed the models
- Check deployment names match your .env file

### **"Access denied"**
- Verify your API key is correct
- Check if you have access to the models in your region

### **"Quota exceeded"**
- Check your Azure OpenAI quota
- Consider upgrading your pricing tier

## 💰 Cost Optimization

### **Free Tier Benefits**
- $200 credit for new Azure accounts
- No upfront costs
- Pay only for what you use

### **Cost Estimates**
- **GPT-4**: ~$0.03 per 1K input tokens
- **Embeddings**: ~$0.0001 per 1K tokens
- **Typical usage**: $5-20/month for small stores

### **Cost Monitoring**
- Set up spending limits in Azure
- Monitor usage in Azure Portal
- Use Azure Cost Management

## 🔒 Security Best Practices

1. **Secure API Keys**:
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Network Security**:
   - Use private endpoints if needed
   - Configure IP restrictions if required

3. **Access Control**:
   - Use Azure RBAC for team access
   - Monitor usage and access logs

## 📊 Monitoring

### **Azure Portal Monitoring**
- Go to your Azure OpenAI resource
- Check "Metrics" for usage
- Monitor "Logs" for errors

### **App-Level Monitoring**
- Use the `/config` endpoint to check status
- Monitor response times and errors
- Track token usage

## 🚀 Production Deployment

### **Environment Variables**
```env
# Production Azure OpenAI
AZURE_OPENAI_API_KEY="prod-api-key"
AZURE_OPENAI_ENDPOINT="https://prod-resource.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4-prod"
AZURE_OPENAI_CHAT_DEPLOYMENT="gpt-4-prod"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-ada-002-prod"
```

### **Scaling Considerations**
- Use multiple deployments for high availability
- Consider regional deployments for global users
- Monitor and adjust capacity as needed

## 📞 Support

### **Azure Support**
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure Support](https://azure.microsoft.com/en-us/support/)

### **App Support**
- Check the `/config` endpoint for configuration issues
- Review console logs for detailed error messages
- Test individual endpoints for specific problems

---

**Your Azure OpenAI setup is ready! 🎉**
