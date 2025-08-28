# 🧪 AI SEO Chat App - Testing Guide

## 🎯 Quick Start Testing

### 1. Run All Tests
```bash
# Navigate to your app directory
cd ai-seo-chat

# Run the automated deployment script
./deploy.sh
```

### 2. Manual Testing Steps
```bash
# Test individual components
npm run test:database    # Test database connection
npm run test:redis       # Test Redis caching
npm run test:supabase    # Test Supabase connection
npm run test:server      # Test server functionality
npm run test:demo        # Test AI features
```

## 🔍 Detailed Testing Checklist

### ✅ Environment Testing

#### 1. Database Connection Test
```bash
npm run test:database
```
**Expected Output:**
- ✅ Database connection successful
- ✅ Tables created/verified
- ✅ Sample data inserted
- ✅ Query test passed

#### 2. Redis Caching Test
```bash
npm run test:redis
```
**Expected Output:**
- ✅ Redis connection successful
- ✅ Cache set/get operations working
- ✅ Cache expiration working
- ✅ Connection pool healthy

#### 3. Supabase Integration Test
```bash
npm run test:supabase
```
**Expected Output:**
- ✅ Supabase connection successful
- ✅ Database schema verified
- ✅ Row Level Security working
- ✅ Real-time subscriptions working

### ✅ AI Functionality Testing

#### 1. Azure OpenAI Connection
```bash
npm run test:demo
```
**Test Cases:**
- [ ] Basic chat completion
- [ ] Product-specific questions
- [ ] SEO optimization suggestions
- [ ] Content generation
- [ ] Error handling

#### 2. AI Response Quality
**Manual Testing:**
1. Ask about product features
2. Request SEO improvements
3. Ask for content suggestions
4. Test contextual responses
5. Verify response accuracy

### ✅ Shopify Integration Testing

#### 1. App Installation
1. Run `npm run dev`
2. Follow installation prompts
3. Verify app appears in admin
4. Check permissions are granted

#### 2. Webhook Testing
**Test Webhook Deliveries:**
```bash
# Check webhook status
shopify app webhook list

# Monitor webhook logs
shopify app logs
```

**Trigger Test Events:**
1. Create a new product
2. Update product details
3. Delete a product
4. Check webhook delivery status

#### 3. API Integration
**Test Shopify API Calls:**
- [ ] Product listing
- [ ] Product details
- [ ] Metafield operations
- [ ] Content management

### ✅ Chat Widget Testing

#### 1. Widget Installation
1. Add script to theme
2. Verify widget loads
3. Check positioning
4. Test responsive design

#### 2. Widget Functionality
**Test Scenarios:**
- [ ] Widget opens/closes
- [ ] Chat history persists
- [ ] AI responses load
- [ ] Error handling works
- [ ] Mobile responsiveness

#### 3. Customer Experience
**User Journey Testing:**
1. Customer visits store
2. Opens chat widget
3. Asks product question
4. Receives AI response
5. Continues conversation
6. Gets helpful information

### ✅ Performance Testing

#### 1. Response Time Testing
**Benchmarks:**
- AI response: < 3 seconds
- Database queries: < 100ms
- Cache hits: < 10ms
- Widget load: < 1 second

#### 2. Load Testing
```bash
# Test concurrent users
# Use tools like Apache Bench or Artillery
ab -n 100 -c 10 https://your-app-url.com/api/chat
```

#### 3. Memory Usage
- Monitor Node.js memory usage
- Check Redis memory consumption
- Track database connection pool

### ✅ Security Testing

#### 1. Authentication
- [ ] Shopify OAuth working
- [ ] Session management secure
- [ ] API key protection
- [ ] Rate limiting active

#### 2. Data Protection
- [ ] Sensitive data encrypted
- [ ] API keys not exposed
- [ ] SQL injection prevention
- [ ] XSS protection

#### 3. Privacy Compliance
- [ ] GDPR compliance
- [ ] Data retention policies
- [ ] User consent handling
- [ ] Data deletion requests

## 🐛 Troubleshooting Common Issues

### Issue 1: Database Connection Failed
**Symptoms:**
- Error: "Database connection failed"
- App won't start

**Solutions:**
1. Check DATABASE_URL in .env
2. Verify Supabase credentials
3. Check network connectivity
4. Run `npm run test:database`

### Issue 2: AI Not Responding
**Symptoms:**
- Chat widget shows loading
- No AI responses

**Solutions:**
1. Check Azure OpenAI credentials
2. Verify API endpoint
3. Check rate limits
4. Monitor error logs

### Issue 3: Widget Not Loading
**Symptoms:**
- Widget doesn't appear
- JavaScript errors

**Solutions:**
1. Check script tag in theme
2. Verify file path
3. Check browser console
4. Test in different browsers

### Issue 4: Webhooks Not Working
**Symptoms:**
- Product changes not syncing
- Webhook delivery failures

**Solutions:**
1. Check webhook configuration
2. Verify app URL
3. Check webhook permissions
4. Monitor webhook logs

## 📊 Testing Metrics

### Key Performance Indicators
- **Response Time:** < 3 seconds for AI responses
- **Uptime:** > 99.9%
- **Error Rate:** < 1%
- **Cache Hit Rate:** > 80%
- **User Satisfaction:** > 4.5/5

### Monitoring Tools
- Shopify App Analytics
- Supabase Dashboard
- Upstash Redis Dashboard
- Azure OpenAI Usage
- Application Logs

## 🚀 Production Readiness Checklist

### Before Going Live
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Error handling implemented
- [ ] Monitoring configured
- [ ] Backup strategy ready
- [ ] Documentation updated
- [ ] Support plan in place

### Post-Launch Monitoring
- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Monitor API usage
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan improvements

## 📞 Support Resources

### Documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [README.md](./README.md)
- [TESTING.md](./TESTING.md)

### Tools
- Shopify CLI: `shopify app --help`
- Prisma CLI: `npx prisma --help`
- Redis CLI: `redis-cli`

### Logs
- App logs: `shopify app logs`
- Server logs: Check your hosting platform
- Database logs: Supabase dashboard
- Redis logs: Upstash dashboard

---

**Happy Testing! 🧪**

Follow this guide to ensure your AI SEO Chat app is thoroughly tested and ready for production.
