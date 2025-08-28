import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { DatabaseService } from '../../services/database.server';
import { ShopifyService } from '../../services/shopify.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  try {
    // Get all product embeddings for the shop
    const embeddings = await DatabaseService.getAllProductEmbeddings(session.shop);
    
    // Apply pagination
    const paginatedEmbeddings = embeddings.slice(offset, offset + limit);
    
    // Get full product data for each embedding
    const products = await Promise.all(
      paginatedEmbeddings.map(async (embedding) => {
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
        };
      })
    );

    const validProducts = products.filter(Boolean);

    // Record feed hit metric
    await DatabaseService.recordMetric(session.shop, 'feed_hits', 1, {
      format: 'json',
      page,
      limit,
      productsReturned: validProducts.length,
    });

    return json({
      products: validProducts,
      pagination: {
        page,
        limit,
        total: embeddings.length,
        totalPages: Math.ceil(embeddings.length / limit),
        hasNext: page * limit < embeddings.length,
        hasPrev: page > 1,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        shop: session.shop,
        format: 'json',
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Last-Modified': new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error generating AI feed:', error);
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
    gtin: mainVariant?.sku, // Using SKU as GTIN if no barcode
    mpn: mainVariant?.sku, // Using SKU as MPN
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

  // Add aggregate rating if we have reviews (placeholder)
  if (faqs.length > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.5', // Placeholder
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
