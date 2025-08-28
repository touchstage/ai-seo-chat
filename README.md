# 🤖 AI SEO Chat - Shopify App

A powerful AI-powered chat widget for Shopify stores that provides intelligent customer support, product recommendations, and SEO optimization.

## 🚀 Features

### AI-Powered Chat
- **Product Questions**: Customers can ask questions about products
- **Smart Recommendations**: AI suggests related products
- **SEO Optimization**: AI provides SEO improvement suggestions
- **Content Generation**: Generate product descriptions and marketing copy

### Technical Features
- **Real-time Chat**: Instant AI responses
- **Product Sync**: Automatic product data updates
- **Caching**: Redis-powered caching for fast responses
- **Scalable**: Production-ready infrastructure

## 🛠️ Tech Stack

- **Frontend**: React, Remix, Shopify Polaris
- **Backend**: Node.js, Remix
- **AI**: Azure OpenAI (GPT-4o)
- **Database**: Supabase PostgreSQL
- **Caching**: Upstash Redis
- **Hosting**: Vercel
- **Platform**: Shopify App Framework

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Shopify Partners account
- Azure OpenAI account
- Supabase account
- Upstash Redis account

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/touchstage/ai-seo-chat.git
cd ai-seo-chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Deploy to Vercel**
```bash
vercel --prod
```

5. **Deploy to Shopify**
```bash
npm run deploy
```

## 🔧 Configuration

### Environment Variables

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_CHAT_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-3-large"
AZURE_OPENAI_API_VERSION="2024-12-01-preview"

# Redis - Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Shopify App (set by Shopify CLI)
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SHOPIFY_SCOPES="write_products,read_products,read_content,write_content"
APP_URL=""
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
```bash
vercel
```

2. **Set environment variables in Vercel dashboard**

3. **Deploy**
```bash
vercel --prod
```

### Shopify Deployment

1. **Deploy app**
```bash
npm run deploy
```

2. **Install on development store**
- Go to Shopify Partners dashboard
- Click "Install app"
- Select your development store

3. **Add theme extension**
- Go to your store's theme customization
- Add "AI SEO Chat" section
- Save theme

## 📱 Usage

### For Store Owners
1. Install the app from Shopify Partners
2. Configure AI settings in the app admin
3. Add the chat widget to your theme
4. Monitor chat interactions and AI performance

### For Customers
1. Visit your store
2. Click the chat widget (usually bottom-right)
3. Ask questions about products
4. Get AI-powered responses and recommendations

## 🧪 Testing

```bash
# Test database connection
npm run test:database

# Test Redis connection
npm run test:redis

# Test Supabase connection
npm run test:supabase

# Test AI functionality
npm run test:demo
```

## 📊 Monitoring

- **Vercel Dashboard**: Monitor app performance
- **Supabase Dashboard**: Database analytics
- **Upstash Dashboard**: Redis performance
- **Azure OpenAI**: API usage and costs
- **Shopify App Analytics**: Store usage metrics

## 🔒 Security

- Environment variables for sensitive data
- Shopify OAuth for authentication
- Rate limiting on API endpoints
- Secure database connections
- HTTPS enforced

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the guides in the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Shopify Partners**: Contact through Partners dashboard

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom AI training
- [ ] Integration with more Shopify features
- [ ] Mobile app companion

---

**Built with ❤️ for Shopify store owners**

