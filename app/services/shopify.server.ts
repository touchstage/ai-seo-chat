import { adminApiClient } from '@shopify/admin-api-client';
import { storefrontApiClient } from '@shopify/storefront-api-client';
import { DatabaseService } from './database.server';
import { AIService } from './ai.server';

export class ShopifyService {
  static async getAdminClient(shop: string, accessToken: string) {
    return adminApiClient({
      storeDomain: shop,
      accessToken,
    });
  }

  static async getStorefrontClient(shop: string, accessToken: string) {
    return storefrontApiClient({
      storeDomain: shop,
      accessToken,
    });
  }

  static async getProduct(shop: string, accessToken: string, productId: string) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.query({
      data: `
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            description
            productType
            vendor
            handle
            status
            createdAt
            updatedAt
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  availableForSale
                  sku
                  weight
                  weightUnit
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            metafields(first: 10, namespace: "ai.seo") {
              edges {
                node {
                  key
                  value
                  type
                }
              }
            }
          }
        }
      `,
      variables: { id: productId },
    });

    return response.data?.product;
  }

  static async searchProducts(shop: string, accessToken: string, query: string, limit: number = 10) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.query({
      data: `
        query searchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                description
                productType
                vendor
                handle
                status
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { query, first: limit },
    });

    return response.data?.products?.edges?.map((edge: any) => edge.node) || [];
  }

  static async getAllProducts(shop: string, accessToken: string, limit: number = 250) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.query({
      data: `
        query getAllProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                productType
                vendor
                handle
                status
                createdAt
                updatedAt
                images(first: 5) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      availableForSale
                      sku
                    }
                  }
                }
                metafields(first: 10, namespace: "ai.seo") {
                  edges {
                    node {
                      key
                      value
                      type
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { first: limit },
    });

    return response.data?.products?.edges?.map((edge: any) => edge.node) || [];
  }

  static async updateProductMetafields(
    shop: string,
    accessToken: string,
    productId: string,
    metafields: Array<{
      namespace: string;
      key: string;
      value: string;
      type: string;
    }>
  ) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const metafieldInputs = metafields.map(metafield => ({
      namespace: metafield.namespace,
      key: metafield.key,
      value: metafield.value,
      type: metafield.type,
    }));

    const response = await client.mutation({
      data: `
        mutation updateProductMetafields($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
              metafields(first: 10, namespace: "ai.seo") {
                edges {
                  node {
                    key
                    value
                    type
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          id: productId,
          metafields: metafieldInputs,
        },
      },
    });

    return response.data?.productUpdate;
  }

  static async getPolicies(shop: string, accessToken: string) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.query({
      data: `
        query getPolicies {
          shop {
            privacyPolicy {
              id
              title
              body
              handle
            }
            refundPolicy {
              id
              title
              body
              handle
            }
            shippingPolicy {
              id
              title
              body
              handle
            }
            termsOfService {
              id
              title
              body
              handle
            }
          }
        }
      `,
    });

    const policies = [];
    const shopData = response.data?.shop;
    
    if (shopData?.privacyPolicy) {
      policies.push({
        id: shopData.privacyPolicy.id,
        title: shopData.privacyPolicy.title,
        content: shopData.privacyPolicy.body,
        type: 'privacy',
        handle: shopData.privacyPolicy.handle,
      });
    }
    
    if (shopData?.refundPolicy) {
      policies.push({
        id: shopData.refundPolicy.id,
        title: shopData.refundPolicy.title,
        content: shopData.refundPolicy.body,
        type: 'refund',
        handle: shopData.refundPolicy.handle,
      });
    }
    
    if (shopData?.shippingPolicy) {
      policies.push({
        id: shopData.shippingPolicy.id,
        title: shopData.shippingPolicy.title,
        content: shopData.shippingPolicy.body,
        type: 'shipping',
        handle: shopData.shippingPolicy.handle,
      });
    }
    
    if (shopData?.termsOfService) {
      policies.push({
        id: shopData.termsOfService.id,
        title: shopData.termsOfService.title,
        content: shopData.termsOfService.body,
        type: 'terms',
        handle: shopData.termsOfService.handle,
      });
    }

    return policies;
  }

  static async getCollections(shop: string, accessToken: string) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.query({
      data: `
        query getCollections($first: Int!) {
          collections(first: $first) {
            edges {
              node {
                id
                title
                description
                handle
                productsCount
                products(first: 10) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { first: 50 },
    });

    return response.data?.collections?.edges?.map((edge: any) => edge.node) || [];
  }

  static async updateImageAltText(
    shop: string,
    accessToken: string,
    imageId: string,
    altText: string
  ) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.mutation({
      data: `
        mutation updateImageAltText($input: ProductImageInput!) {
          productImageUpdate(input: $input) {
            image {
              id
              altText
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          id: imageId,
          altText,
        },
      },
    });

    return response.data?.productImageUpdate;
  }

  static async getProductImages(shop: string, accessToken: string, productId: string) {
    const client = await this.getAdminClient(shop, accessToken);
    
    const response = await client.query({
      data: `
        query getProductImages($id: ID!) {
          product(id: $id) {
            images(first: 50) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      `,
      variables: { id: productId },
    });

    return response.data?.product?.images?.edges?.map((edge: any) => edge.node) || [];
  }

  static async generateProductSEO(shop: string, accessToken: string, productId: string) {
    const product = await this.getProduct(shop, accessToken, productId);
    if (!product) return null;

    const seoData = await AIService.generateProductSEO(product, shop);
    if (!seoData) return null;

    // Update metafields
    const metafields = [
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

    await this.updateProductMetafields(shop, accessToken, productId, metafields);

    // Create embedding
    await DatabaseService.createProductEmbedding(
      shop,
      productId,
      product.title,
      product.description,
      seoData.features || [],
      seoData.use_cases || [],
      seoData.faqs || []
    );

    return {
      product,
      seoData,
      metafields,
    };
  }

  static async generateAltTextForProduct(shop: string, accessToken: string, productId: string) {
    const product = await this.getProduct(shop, accessToken, productId);
    if (!product) return [];

    const images = product.images?.edges?.map((edge: any) => edge.node) || [];
    const results = [];

    for (const image of images) {
      if (!image.altText) {
        const altText = await AIService.generateAltText(image.url, product.title);
        if (altText) {
          await this.updateImageAltText(shop, accessToken, image.id, altText);
          results.push({
            imageId: image.id,
            altText,
            success: true,
          });
        }
      }
    }

    return results;
  }
}
