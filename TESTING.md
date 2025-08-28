# 🧪 Testing AI SEO Chat App (Azure OpenAI)

This guide will help you test the AI SEO Chat app functionality using Azure OpenAI.

## 🚀 Quick Start Testing

### 1. **Set Up Azure OpenAI**

First, you need to set up Azure OpenAI:

1. **Create Azure OpenAI Resource**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new "Azure OpenAI" resource
   - Note your resource name and endpoint URL

2. **Deploy Models**:
   - Deploy a GPT-4 model for chat (e.g., "gpt-4")
   - Deploy an embedding model (e.g., "text-embedding-ada-002")

3. **Get API Key**:
   - Go to "Keys and Endpoint" in your Azure OpenAI resource
   - Copy Key 1 or Key 2

### 2. **Configure Environment Variables**

Update your `.env` file with Azure OpenAI settings:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
AZURE_OPENAI_CHAT_DEPLOYMENT="gpt-4"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-ada-002"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
```

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Start the Test Server**

```bash
npm run test:server
```

This will start a test server on `http://localhost:3001` that you can use to test the AI functionality.

### 5. **Check Configuration**

Visit `http://localhost:3001/config` to verify your Azure OpenAI setup.

### 6. **Run the Demo Tests**

In a new terminal:

```bash
npm run test:demo
```

This will run automated tests for:
- ✅ Health check
- ✅ AI SEO generation
- ✅ Chat functionality  
- ✅ Embedding generation

## 🎯 Manual Testing

### **Test AI SEO Generation**

```bash
curl -X POST http://localhost:3001/test/seo \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Premium Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "productType": "Electronics",
      "vendor": "AudioTech Pro"
    }
  }'
```

### **Test Chat Functionality**

```bash
curl -X POST http://localhost:3001/test/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key features of these headphones?"
  }'
```

### **Test Embedding Generation**

```bash
curl -X POST http://localhost:3001/test/embedding \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Premium Wireless Bluetooth Headphones"
  }'
```

## 📊 Expected Results

### **AI SEO Generation**
- ✅ Features array (3-5 items)
- ✅ Use cases array (3-5 items)  
- ✅ FAQs array (5-8 items)
- ✅ JSON-LD structured data

### **Chat Functionality**
- ✅ Helpful, contextual responses
- ✅ Professional tone
- ✅ Product-specific information

### **Embedding Generation**
- ✅ 1536-dimensional vector (text-embedding-ada-002)
- ✅ Numerical values between -1 and 1

## 🔧 Troubleshooting

### **"Azure OpenAI API key not found"**
- Make sure you've set `AZURE_OPENAI_API_KEY` in your `.env` file
- Get your API key from Azure Portal > Azure OpenAI > Keys and Endpoint

### **"Endpoint not found"**
- Verify your `AZURE_OPENAI_ENDPOINT` is correct
- Format should be: `https://your-resource-name.openai.azure.com`

### **"Deployment not found"**
- Make sure you've deployed the required models in Azure OpenAI
- Check that `AZURE_OPENAI_DEPLOYMENT_NAME` matches your deployment name

### **"Server not running"**
- Make sure you ran `npm run test:server` first
- Check that port 3001 is available

### **"Rate limit exceeded"**
- You might have hit Azure OpenAI's rate limits
- Check your Azure OpenAI quota and limits
- Wait a few minutes and try again

## 💰 Azure OpenAI Costs

Azure OpenAI pricing is typically more cost-effective than standard OpenAI:

- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **text-embedding-ada-002**: ~$0.0001 per 1K tokens
- **Free tier**: $200 credit for new Azure accounts

## 🚀 Next Steps After Testing

Once you've confirmed the AI functionality works:

1. **Set up Database**: Configure PostgreSQL for production
2. **Set up Redis**: Configure Redis for caching
3. **Deploy to Shopify**: Use the full Shopify app deployment
4. **Install on Store**: Install the app on your Shopify store

## 💡 Testing Tips

- Start with simple products to test SEO generation
- Try different types of chat questions
- Test with various product categories
- Monitor Azure OpenAI usage and costs
- Use the `/config` endpoint to verify your setup

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your Azure OpenAI configuration at `/config`
3. Ensure all dependencies are installed
4. Check that the test server is running
5. Verify your Azure OpenAI resource and deployments

## 🔗 Useful Links

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
- [Azure Portal](https://portal.azure.com)

---

**Happy Testing with Azure OpenAI! 🎉**
