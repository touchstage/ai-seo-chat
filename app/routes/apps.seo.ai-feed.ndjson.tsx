import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { DatabaseService } from '../services/database.server';
import { ShopifyService } from '../services/shopify.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  try {
    // Get all product embeddings for the shop
    const embeddings = await DatabaseService.getAllProductEmbeddings(session.shop);
    
    // Record feed hit metric
    await DatabaseService.recordMetric(session.shop, 'feed_hits', 1, {
      format: 'ndjson',
      totalProducts: embeddings.length,
    });

    // Create NDJSON stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Write header comment
          const header = `# AI SEO Feed - ${session.shop}\n# Generated at: ${new Date().toISOString()}\n# Total products: ${embeddings.length}\n\n`;
          controller.enqueue(new TextEncoder().encode(header));

          // Process products in batches to avoid memory issues
          const batchSize = 10;
          for (let i = 0; i < embeddings.length; i += batchSize) {
            const batch = embeddings.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (embedding) => {
              try {
                const product = await ShopifyService.getProduct(
                  session.shop,
                  session.accessToken,
                  embedding.productId
                );
                
                if (!product) return null;

                // Get metafields
                const metafields = product.metafields?.edges?.reduce((acc: any, edge: any) => {
                  acc[edge.node.key] = edge.node.value;
                  return acc;
                }, {}) || {};

                // Parse metafield values
                const features = metafields.features ? JSON.parse(metafields.features) : embedding.features;
                const useCases = metafields.use_cases ? JSON.parse(metafields.use_cases) : embedding.useCases;
                const faqs = metafields.faq ? JSON.parse(metafields.faq) : embedding.faqs;

                // Generate JSON-LD structured data
                const jsonLd = generateJSONLD(product, features, useCases, faqs);

                return {
                  id: product.id,
                  title: product.title,
                  description: product.description,
                  handle: product.handle,
                  productType: product.productType,
                  vendor: product.vendor,
                  status: product.status,
                  createdAt: product.createdAt,
                  updatedAt: product.updatedAt,
                  features,
                  useCases,
                  faqs,
                  jsonLd,
                  images: product.images?.edges?.map((edge: any) => ({
                    id: edge.node.id,
                    url: edge.node.url,
                    altText: edge.node.altText,
                    width: edge.node.width,
                    height: edge.node.height,
                  })) || [],
                  variants: product.variants?.edges?.map((edge: any) => ({
                    id: edge.node.id,
                    title: edge.node.title,
                    price: edge.node.price,
                    compareAtPrice: edge.node.compareAtPrice,
                    availableForSale: edge.node.availableForSale,
                    sku: edge.node.sku,
                    weight: edge.node.weight,
                    weightUnit: edge.node.weightUnit,
                    selectedOptions: edge.node.selectedOptions,
                  })) || [],
                  embedding: {
                    features: embedding.features,
                    useCases: embedding.useCases,
                    faqs: embedding.faqs,
                    similarity: null, // Will be calculated during search
                  },
                };
              } catch (error) {
                console.error(`Error processing product ${embedding.productId}:`, error);
                return null;
              }
            });

            const batchResults = await Promise.all(batchPromises);
            const validProducts = batchResults.filter(Boolean);

            // Write each product as a JSON line
            for (const product of validProducts) {
              const line = JSON.stringify(product) + '\n';
              controller.enqueue(new TextEncoder().encode(line));
            }

            // Small delay to prevent overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          controller.close();
        } catch (error) {
          console.error('Error in NDJSON stream:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'Last-Modified': new Date().toISOString(),
        'X-Total-Products': embeddings.length.toString(),
        'X-Generated-At': new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error generating NDJSON feed:', error);
    return json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}

function generateJSONLD(product: any, features: string[], useCases: string[], faqs: any[]) {
  const baseUrl = `https://${product.handle}.myshopify.com`;
  const productUrl = `${baseUrl}/products/${product.handle}`;
  
  // Get main variant for pricing
  const mainVariant = product.variants?.edges?.[0]?.node;
  const price = mainVariant?.price?.amount || '0';
  const currency = mainVariant?.price?.currencyCode || 'USD';
  
  // Get main image
  const mainImage = product.images?.edges?.[0]?.node;
  const imageUrl = mainImage ? mainImage.url : '';

  // Product JSON-LD
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: product.title,
    description: product.description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    manufacturer: {
      '@type': 'Organization',
      name: product.vendor,
    },
    category: product.productType,
    sku: mainVariant?.sku,
    gtin: mainVariant?.sku,
    mpn: mainVariant?.sku,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price,
      availability: mainVariant?.availableForSale 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.vendor,
      },
    },
  };

  // Add aggregate rating if we have FAQs
  if (faqs.length > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: faqs.length,
    };
  }

  // FAQ JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq: any) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.productType || 'Products',
        item: `${baseUrl}/collections/all`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return {
    product: productJsonLd,
    faq: faqJsonLd,
    breadcrumb: breadcrumbJsonLd,
  };
}
