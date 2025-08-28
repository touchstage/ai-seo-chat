import { authenticate } from '../shopify.server';
import { DatabaseService } from '../../services/database.server';
import { ShopifyService } from '../../services/shopify.server';
import { AIService } from '../../services/ai.server';

export async function action({ request }: any) {
  const { topic, shop, session } = await authenticate.webhook(request);

  if (!topic.startsWith('products/')) {
    return new Response('Invalid topic', { status: 400 });
  }

  try {
    const payload = await request.json();
    const productId = payload.id;

    switch (topic) {
      case 'products/create':
      case 'products/update': {
        // Get the full product data
        const product = await ShopifyService.getProduct(
          shop,
          session.accessToken,
          productId
        );

        if (!product) {
          console.error(`Product not found: ${productId}`);
          return new Response('Product not found', { status: 404 });
        }

        // Check if product has AI SEO metafields
        const metafields = product.metafields?.edges?.reduce((acc: any, edge: any) => {
          acc[edge.node.key] = edge.node.value;
          return acc;
        }, {}) || {};

        const hasFeatures = metafields.features && JSON.parse(metafields.features).length > 0;
        const hasUseCases = metafields.use_cases && JSON.parse(metafields.use_cases).length > 0;
        const hasFaqs = metafields.faq && JSON.parse(metafields.faq).length > 0;

        // If product doesn't have AI SEO data, generate it
        if (!hasFeatures || !hasUseCases || !hasFaqs) {
          console.log(`Generating AI SEO for product: ${product.title}`);
          
          const seoData = await AIService.generateProductSEO(product, shop);
          if (seoData) {
            // Update metafields
            const metafieldUpdates = [
              {
                namespace: 'ai.seo',
                key: 'features',
                value: JSON.stringify(seoData.features || []),
                type: 'list.single_line_text_field',
              },
              {
                namespace: 'ai.seo',
                key: 'use_cases',
                value: JSON.stringify(seoData.use_cases || []),
                type: 'list.single_line_text_field',
              },
              {
                namespace: 'ai.seo',
                key: 'faq',
                value: JSON.stringify(seoData.faqs || []),
                type: 'json',
              },
            ];

            await ShopifyService.updateProductMetafields(
              shop,
              session.accessToken,
              productId,
              metafieldUpdates
            );

            // Create or update embedding
            await DatabaseService.createProductEmbedding(
              shop,
              productId,
              product.title,
              product.description,
              seoData.features || [],
              seoData.use_cases || [],
              seoData.faqs || []
            );

            console.log(`AI SEO generated successfully for product: ${product.title}`);
          }
        } else {
          // Product has AI SEO data, just update the embedding
          const features = JSON.parse(metafields.features);
          const useCases = JSON.parse(metafields.use_cases);
          const faqs = JSON.parse(metafields.faq);

          await DatabaseService.createProductEmbedding(
            shop,
            productId,
            product.title,
            product.description,
            features,
            useCases,
            faqs
          );

          console.log(`Embedding updated for product: ${product.title}`);
        }

        // Generate alt text for images if missing
        const images = product.images?.edges?.map((edge: any) => edge.node) || [];
        const imagesWithoutAlt = images.filter((img: any) => !img.altText);

        if (imagesWithoutAlt.length > 0) {
          console.log(`Generating alt text for ${imagesWithoutAlt.length} images`);
          
          for (const image of imagesWithoutAlt) {
            try {
              const altText = await AIService.generateAltText(image.url, product.title);
              if (altText) {
                await ShopifyService.updateImageAltText(
                  shop,
                  session.accessToken,
                  image.id,
                  altText
                );
              }
            } catch (error) {
              console.error(`Failed to generate alt text for image ${image.id}:`, error);
            }
          }
        }

        // Record metric
        await DatabaseService.recordMetric(shop, 'products_processed', 1, {
          action: topic,
          productId,
          hasAISEO: hasFeatures && hasUseCases && hasFaqs,
        });

        break;
      }

      case 'products/delete': {
        // Remove product embedding
        await DatabaseService.deleteProductEmbedding(shop, productId);
        console.log(`Product embedding deleted: ${productId}`);

        // Record metric
        await DatabaseService.recordMetric(shop, 'products_processed', 1, {
          action: 'delete',
          productId,
        });

        break;
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Product webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
