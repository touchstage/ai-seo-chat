import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { DatabaseService } from '../../services/database.server';
import { AIService, chatFunctions } from '../../services/ai.server';
import { ShopifyService } from '../../services/shopify.server';
import { z } from 'zod';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  productId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { message, sessionId, productId, context } = chatRequestSchema.parse(body);

    // Get app settings
    const settings = await DatabaseService.getAppSettings(session.shop);

    // Check for cached response
    const cacheKey = `${message.toLowerCase().trim()}_${productId || 'general'}`;
    const cachedResponse = await DatabaseService.getChatCache(session.shop, cacheKey);
    
    if (cachedResponse) {
      return json({
        message: cachedResponse.answer,
        actions: cachedResponse.actions,
        cached: true,
      });
    }

    // Build conversation context
    const messages = [];
    
    // Add system context if we have a product
    if (productId) {
      const productEmbedding = await DatabaseService.getProductEmbedding(session.shop, productId);
      if (productEmbedding) {
        const productContext = `Current product: ${productEmbedding.title}
Features: ${productEmbedding.features.join(', ')}
Use cases: ${productEmbedding.useCases.join(', ')}
FAQs: ${productEmbedding.faqs.map((faq: any) => `${faq.q}: ${faq.a}`).join('\n')}`;
        
        messages.push({
          role: 'system',
          content: productContext,
        });
      }
    }

    // Add user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Determine available functions based on settings
    const availableFunctions = [];
    
    if (!settings.restrictToQA) {
      availableFunctions.push(
        {
          name: 'get_product',
          description: 'Get product information by ID or search query',
          parameters: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'Product ID' },
              query: { type: 'string', description: 'Search query' },
            },
          },
        },
        {
          name: 'get_related',
          description: 'Get related products based on features and use cases',
          parameters: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'Product ID' },
            },
            required: ['productId'],
          },
        },
        {
          name: 'get_policy',
          description: 'Get store policy information (shipping, returns, warranty)',
          parameters: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: 'Policy slug (shipping, returns, warranty, privacy)' },
            },
            required: ['slug'],
          },
        }
      );

      if (settings.allowAddToCart) {
        availableFunctions.push({
          name: 'add_to_cart',
          description: 'Add a product variant to the cart',
          parameters: {
            type: 'object',
            properties: {
              variantId: { type: 'string', description: 'Variant ID' },
              quantity: { type: 'number', description: 'Quantity to add', minimum: 1 },
            },
            required: ['variantId', 'quantity'],
          },
        });
      }

      availableFunctions.push({
        name: 'find_size',
        description: 'Find the right size for a product based on measurements',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product ID' },
            bodyMeasurements: { 
              type: 'object', 
              description: 'Body measurements (chest, waist, hips, etc.)',
              additionalProperties: { type: 'number' },
            },
          },
          required: ['productId'],
        },
      });
    }

    // Get AI response
    const aiResponse = await AIService.chatCompletion(
      messages,
      session.shop,
      settings,
      availableFunctions
    );

    let responseMessage = aiResponse.message?.content || 'I apologize, but I couldn\'t process your request.';
    let actions = null;

    // Handle function calls
    if (aiResponse.message?.function_call) {
      const functionCall = aiResponse.message.function_call;
      const functionName = functionCall.name;
      const functionArgs = JSON.parse(functionCall.arguments || '{}');

      try {
        switch (functionName) {
          case 'get_product': {
            let product;
            if (functionArgs.productId) {
              product = await ShopifyService.getProduct(
                session.shop,
                session.accessToken,
                functionArgs.productId
              );
            } else if (functionArgs.query) {
              const products = await ShopifyService.searchProducts(
                session.shop,
                session.accessToken,
                functionArgs.query,
                5
              );
              product = products[0];
            }

            if (product) {
              actions = {
                type: 'product_info',
                product: {
                  id: product.id,
                  title: product.title,
                  description: product.description,
                  handle: product.handle,
                  images: product.images?.edges?.map((edge: any) => ({
                    url: edge.node.url,
                    altText: edge.node.altText,
                  })) || [],
                  variants: product.variants?.edges?.map((edge: any) => ({
                    id: edge.node.id,
                    title: edge.node.title,
                    price: edge.node.price,
                    availableForSale: edge.node.availableForSale,
                  })) || [],
                },
              };
            }
            break;
          }

          case 'get_related': {
            const productEmbedding = await DatabaseService.getProductEmbedding(
              session.shop,
              functionArgs.productId
            );
            
            if (productEmbedding) {
              const relatedSuggestions = await AIService.generateRelatedProducts(
                functionArgs.productId,
                productEmbedding.features,
                productEmbedding.useCases
              );

              actions = {
                type: 'related_products',
                suggestions: relatedSuggestions,
              };
            }
            break;
          }

          case 'get_policy': {
            const policies = await ShopifyService.getPolicies(session.shop, session.accessToken);
            const policy = policies.find(p => p.type === functionArgs.slug);
            
            if (policy) {
              actions = {
                type: 'policy_info',
                policy: {
                  title: policy.title,
                  content: policy.content,
                  type: policy.type,
                  handle: policy.handle,
                },
              };
            }
            break;
          }

          case 'add_to_cart': {
            if (settings.allowAddToCart) {
              actions = {
                type: 'add_to_cart',
                variantId: functionArgs.variantId,
                quantity: functionArgs.quantity,
              };
            }
            break;
          }

          case 'find_size': {
            // This would integrate with size chart data
            actions = {
              type: 'size_recommendation',
              productId: functionArgs.productId,
              measurements: functionArgs.bodyMeasurements,
              recommendation: 'Based on your measurements, we recommend size M.',
            };
            break;
          }
        }
      } catch (error) {
        console.error('Function call error:', error);
        responseMessage = 'I encountered an error while processing your request. Please try again.';
      }
    }

    // Save to cache
    await DatabaseService.saveChatCache(session.shop, cacheKey, responseMessage, actions);

    // Save transcript if enabled
    if (settings.transcriptRetention && sessionId) {
      const transcriptMessages = [
        ...messages,
        {
          role: 'assistant',
          content: responseMessage,
          timestamp: new Date(),
        },
      ];

      await DatabaseService.saveChatTranscript(
        session.shop,
        sessionId,
        transcriptMessages,
        {
          productId,
          context,
          actions,
        }
      );
    }

    // Record chat metric
    await DatabaseService.recordMetric(session.shop, 'chat_messages', 1, {
      hasActions: !!actions,
      productId,
    });

    return json({
      message: responseMessage,
      actions,
      sessionId: sessionId || `session_${Date.now()}`,
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof z.ZodError) {
      return json({ error: 'Invalid request format' }, { status: 400 });
    }

    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
