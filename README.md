# AI SEO Chat - Shopify App (Azure OpenAI)

A comprehensive AI-powered SEO and customer chat widget for Shopify stores using Azure OpenAI. This app automatically generates SEO content, structured data, and provides an intelligent chat assistant for customers.

## 🚀 Features

### Core AI SEO Features
- **Automatic SEO Generation**: AI-powered product features, use cases, and FAQs
- **JSON-LD Structured Data**: Complete Product, Offer, AggregateRating, FAQ, and Breadcrumb markup
- **Bulk Image Alt Text**: AI-generated descriptive alt text for product images
- **Related Products**: AI-suggested related products based on features and use cases
- **Search & Discovery**: Synonym generation and search boost terms

### AI Chat Widget
- **Intelligent Q&A**: Answers product questions, sizing, materials, compatibility
- **Cart Integration**: Add products to cart directly from chat (optional)
- **Policy Information**: Instant access to shipping, returns, and warranty info
- **Size Recommendations**: AI-powered size suggestions based on measurements
- **Shadow DOM**: Isolated widget that won't conflict with your theme

### Admin Dashboard
- **Real-time Metrics**: Feed hits, chat messages, product coverage
- **Bulk Operations**: Generate SEO for all products at once
- **Chat Settings**: Configure tone, brand words, and functionality
- **Analytics**: Track performance and usage patterns

## 📋 Requirements

- Node.js 18+ 
- PostgreSQL with pgvector extension
- Azure OpenAI resource with GPT-4 and embedding models
- Redis (for caching and job queues)

## 🛠️ Installation

### 1. **Set Up Azure OpenAI**

First, set up your Azure OpenAI resource:

1. **Create Azure OpenAI Resource**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new "Azure OpenAI" resource
   - Deploy GPT-4 and text-embedding-ada-002 models

2. **Get Configuration Details**:
   - Copy your endpoint URL and API key
   - Note your deployment names

See [AZURE_SETUP.md](./AZURE_SETUP.md) for detailed setup instructions.

### 2. **Clone and Setup**

```bash
git clone <repository-url>
cd ai-seo-chat
npm install
```

### 3. **Environment Variables**

Create a `.env` file in the root directory:

```env
# Database - Use a local PostgreSQL or cloud service like Supabase
DATABASE_URL="postgresql://username:password@localhost:5432/ai_seo_chat"

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-azure-openai-api-key"
AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
AZURE_OPENAI_CHAT_DEPLOYMENT="gpt-4"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-ada-002"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Redis - Use local Redis or cloud service like Upstash
REDIS_URL="redis://localhost:6379"

# Shopify App - These will be provided by Shopify CLI during development
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SHOPIFY_SCOPES="write_products,read_products,read_content,write_content"

# App URLs - Will be set by Shopify CLI
APP_URL=""
```

### 4. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

### 5. **Test AI Functionality**

```bash
# Start the test server
npm run test:server

# In a new terminal, run the demo tests
npm run test:demo
```

### 6. **Start Development Server**

```bash
npm run dev
```

## 🎯 Usage

### 1. **Install on Shopify Store**

1. Go to your Shopify admin
2. Navigate to Apps > Develop apps
3. Create a new app or use the existing one
4. Install the app on your store

### 2. **Configure Settings**

1. **Chat Widget Settings**:
   - Enable/disable cart functionality
   - Set tone and brand words
   - Configure message limits

2. **SEO Generation**:
   - Run bulk SEO generation for existing products
   - Configure automatic generation for new products

3. **Theme Integration**:
   - Add the AI SEO Chat block to your theme
   - Configure widget position and styling

### 3. **Monitor Performance**

- View real-time metrics in the dashboard
- Track chat usage and product coverage
- Monitor feed hits and JSON-LD performance

## 📊 API Endpoints

### AI Feed Endpoints
- `GET /apps/seo/ai-feed.json` - JSON feed with pagination
- `GET /apps/seo/ai-feed.ndjson` - Streaming NDJSON feed

### Chat Endpoint
- `POST /apps/seo/chat` - AI chat with function calling

### Webhooks
- Product create/update/delete
- Metafield changes
- Collection updates

## 🏗️ Architecture

### Database Schema
- **ProductEmbedding**: Vector embeddings for semantic search
- **PolicyEmbedding**: Store policy embeddings
- **ChatTranscript**: Chat session history (optional)
- **ChatCache**: Response caching for performance
- **AIMetrics**: Usage and performance metrics
- **JobQueue**: Background job processing
- **AppSettings**: App configuration

### Services
- **AIService**: Azure OpenAI integration and AI operations
- **DatabaseService**: Database operations and vector search
- **ShopifyService**: Shopify API integration
- **JobService**: Background job processing

### Frontend
- **Admin Dashboard**: React/Remix admin interface
- **Chat Widget**: Vanilla JS with shadow DOM
- **Theme Extension**: Liquid blocks for storefront

## 🔧 Configuration

### Azure OpenAI Settings

```javascript
// Example Azure OpenAI configuration
{
  apiKey: "your-azure-openai-api-key",
  endpoint: "https://your-resource.openai.azure.com",
  chatDeployment: "gpt-4",
  embeddingDeployment: "text-embedding-ada-002",
  apiVersion: "2024-02-15-preview"
}
```

### Chat Widget Settings

```javascript
// Example configuration
{
  allowAddToCart: false,
  restrictToQA: false,
  tonePreset: "professional",
  brandWords: ["premium", "quality", "sustainable"],
  blocklist: ["medical", "financial"],
  freeMessageLimit: 100,
  proMessageLimit: 3000,
  overageRate: 0.02
}
```

## 📈 Performance Optimization

### Caching Strategy
- **Chat Responses**: 24-hour cache for common questions
- **Embeddings**: Cached in PostgreSQL with cosine similarity
- **Feed Data**: CDN caching with 1-hour TTL
- **Product Data**: Redis cache for frequently accessed products

### Rate Limiting
- **Chat API**: 100 requests per minute per session
- **Feed API**: 1000 requests per hour per shop
- **Admin API**: 500 requests per minute per shop

### Background Jobs
- **SEO Generation**: Queued with BullMQ
- **Image Processing**: Async alt text generation
- **Data Sync**: Incremental updates via webhooks

## 🔒 Security

### Data Protection
- **Session Isolation**: Each chat session is isolated
- **Input Validation**: All inputs validated with Zod
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Content Filtering**: Profanity and inappropriate content filtering

### Privacy Compliance
- **GDPR Ready**: Data retention controls
- **CCPA Compliant**: Data deletion capabilities
- **Transcript Retention**: Optional with configurable retention period

## 💰 Pricing

### Azure OpenAI Costs
- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **text-embedding-ada-002**: ~$0.0001 per 1K tokens
- **Free tier**: $200 credit for new Azure accounts

### App Pricing Model
- **Free**: 100 messages/month
- **Pro**: ₹999/month + 3k messages
- **Overages**: ₹0.02/message

## 🚀 Deployment

### Production Setup

1. **Database**: Set up PostgreSQL with pgvector
2. **Redis**: Configure Redis for caching and jobs
3. **Azure OpenAI**: Configure production deployments
4. **Environment**: Set production environment variables
5. **SSL**: Ensure HTTPS for all endpoints
6. **Monitoring**: Set up logging and monitoring

### Deployment Commands

```bash
# Build the app
npm run build

# Deploy to Shopify
npm run deploy

# Run database migrations
npm run setup
```

## 📝 Development

### Local Development

```bash
# Start development server
npm run dev

# Test AI functionality
npm run test:server
npm run test:demo

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Code Structure

```
ai-seo-chat/
├── app/
│   ├── routes/           # Remix routes
│   ├── services/         # Business logic
│   └── components/       # React components
├── extensions/
│   └── theme-app-extension/  # Theme blocks
├── prisma/              # Database schema
├── public/              # Static assets
├── AZURE_SETUP.md       # Azure OpenAI setup guide
├── TESTING.md           # Testing instructions
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Changelog

### v1.0.0 (Initial Release)
- Core AI SEO generation with Azure OpenAI
- Chat widget with function calling
- Admin dashboard with metrics
- Theme app extension
- JSON-LD structured data
- Bulk operations
- Webhook integration

---

**Built with ❤️ for Shopify merchants using Azure OpenAI**
