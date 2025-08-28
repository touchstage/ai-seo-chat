import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  DataTable,
  ProgressBar,
  Stack,
  Box,
  Tabs,
  Icon,
  Banner,
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { DatabaseService } from '../services/database.server';
import { ShopifyService } from '../services/shopify.server';
import { 
  AnalyticsIcon, 
  ChatIcon, 
  SearchIcon, 
  ImageIcon,
  SettingsIcon,
  PlayIcon,
  StopIcon,
} from '@shopify/polaris-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  try {
    // Get app settings
    const settings = await DatabaseService.getAppSettings(session.shop);

    // Get metrics for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const metrics = await DatabaseService.getMetrics(session.shop, startDate, endDate);

    // Get product embeddings count
    const embeddings = await DatabaseService.getAllProductEmbeddings(session.shop);
    
    // Get all products to check coverage
    const products = await ShopifyService.getAllProducts(session.shop, session.accessToken);
    
    // Calculate coverage metrics
    const totalProducts = products.length;
    const productsWithAI = embeddings.length;
    const productsWithAltText = products.filter(product => 
      product.images?.edges?.some((edge: any) => edge.node.altText)
    ).length;
    
    const aiCoverage = totalProducts > 0 ? (productsWithAI / totalProducts) * 100 : 0;
    const altTextCoverage = totalProducts > 0 ? (productsWithAltText / totalProducts) * 100 : 0;

    // Aggregate metrics
    const feedHits = metrics.filter(m => m.metric === 'feed_hits').reduce((sum, m) => sum + m.value, 0);
    const chatMessages = metrics.filter(m => m.metric === 'chat_messages').reduce((sum, m) => sum + m.value, 0);
    const productsProcessed = metrics.filter(m => m.metric === 'products_processed').reduce((sum, m) => sum + m.value, 0);

    return json({
      settings,
      metrics: {
        feedHits,
        chatMessages,
        productsProcessed,
        aiCoverage,
        altTextCoverage,
        totalProducts,
        productsWithAI,
        productsWithAltText,
      },
      recentMetrics: metrics.slice(-10), // Last 10 metric entries
    });
  } catch (error) {
    console.error('Dashboard loader error:', error);
    return json({
      settings: null,
      metrics: {
        feedHits: 0,
        chatMessages: 0,
        productsProcessed: 0,
        aiCoverage: 0,
        altTextCoverage: 0,
        totalProducts: 0,
        productsWithAI: 0,
        productsWithAltText: 0,
      },
      recentMetrics: [],
    });
  }
}

export default function Index() {
  const { settings, metrics, recentMetrics } = useLoaderData<typeof loader>();

  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
      icon: AnalyticsIcon,
    },
    {
      id: 'chat',
      content: 'Chat Widget',
      icon: ChatIcon,
    },
    {
      id: 'seo',
      content: 'SEO Tools',
      icon: SearchIcon,
    },
    {
      id: 'images',
      content: 'Image Alt Text',
      icon: ImageIcon,
    },
    {
      id: 'settings',
      content: 'Settings',
      icon: SettingsIcon,
    },
  ];

  const metricRows = recentMetrics.map(metric => [
    new Date(metric.date).toLocaleDateString(),
    metric.metric.replace(/_/g, ' ').toUpperCase(),
    metric.value.toString(),
    metric.metadata ? JSON.stringify(metric.metadata) : '-',
  ]);

  return (
    <Page
      title="AI SEO Chat Dashboard"
      subtitle="Manage your AI-powered SEO and customer chat widget"
    >
      <Layout>
        {/* Status Banner */}
        <Layout.Section>
          <Banner
            title="AI SEO Chat is active"
            tone="success"
            action={{ content: 'View Settings', url: '/app/settings' }}
          >
            <p>
              Your AI chat widget is {settings?.allowAddToCart ? 'enabled with cart functionality' : 'enabled for Q&A only'}. 
              {metrics.aiCoverage < 100 && (
                <span> {Math.round(100 - metrics.aiCoverage)}% of products still need AI SEO generation.</span>
              )}
            </p>
          </Banner>
        </Layout.Section>

        {/* Key Metrics */}
        <Layout.Section>
          <Card>
            <Box padding="4">
              <Stack distribution="fillEvenly">
                <Box>
                  <Text variant="headingMd" as="h3">Feed Hits</Text>
                  <Text variant="headingLg" as="p">{metrics.feedHits}</Text>
                  <Text variant="bodySm" as="p" color="subdued">Last 30 days</Text>
                </Box>
                <Box>
                  <Text variant="headingMd" as="h3">Chat Messages</Text>
                  <Text variant="headingLg" as="p">{metrics.chatMessages}</Text>
                  <Text variant="bodySm" as="p" color="subdued">Last 30 days</Text>
                </Box>
                <Box>
                  <Text variant="headingMd" as="h3">Products Processed</Text>
                  <Text variant="headingLg" as="p">{metrics.productsProcessed}</Text>
                  <Text variant="bodySm" as="p" color="subdued">Last 30 days</Text>
                </Box>
                <Box>
                  <Text variant="headingMd" as="h3">AI Coverage</Text>
                  <Text variant="headingLg" as="p">{Math.round(metrics.aiCoverage)}%</Text>
                  <Text variant="bodySm" as="p" color="subdued">{metrics.productsWithAI}/{metrics.totalProducts} products</Text>
                </Box>
                <Box>
                  <Text variant="headingMd" as="h3">Alt Text Coverage</Text>
                  <Text variant="headingLg" as="p">{Math.round(metrics.altTextCoverage)}%</Text>
                  <Text variant="bodySm" as="p" color="subdued">{metrics.productsWithAltText}/{metrics.totalProducts} products</Text>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Progress Cards */}
        <Layout.Section>
          <Layout>
            <Layout.Section oneHalf>
              <Card title="AI SEO Coverage">
                <Box padding="4">
                  <ProgressBar 
                    progress={metrics.aiCoverage / 100} 
                    size="large"
                    color={metrics.aiCoverage < 50 ? 'critical' : metrics.aiCoverage < 80 ? 'warning' : 'success'}
                  />
                  <Box paddingBlockStart="2">
                    <Text variant="bodySm" as="p">
                      {metrics.productsWithAI} of {metrics.totalProducts} products have AI-generated SEO content
                    </Text>
                  </Box>
                  {metrics.aiCoverage < 100 && (
                    <Box paddingBlockStart="3">
                      <Button 
                        primary 
                        icon={PlayIcon}
                        url="/app/bulk-generate"
                      >
                        Generate Missing SEO
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Layout.Section>

            <Layout.Section oneHalf>
              <Card title="Image Alt Text Coverage">
                <Box padding="4">
                  <ProgressBar 
                    progress={metrics.altTextCoverage / 100} 
                    size="large"
                    color={metrics.altTextCoverage < 50 ? 'critical' : metrics.altTextCoverage < 80 ? 'warning' : 'success'}
                  />
                  <Box paddingBlockStart="2">
                    <Text variant="bodySm" as="p">
                      {metrics.productsWithAltText} of {metrics.totalProducts} products have alt text on images
                    </Text>
                  </Box>
                  {metrics.altTextCoverage < 100 && (
                    <Box paddingBlockStart="3">
                      <Button 
                        primary 
                        icon={ImageIcon}
                        url="/app/bulk-alt-text"
                      >
                        Generate Missing Alt Text
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Layout.Section>
          </Layout>
        </Layout.Section>

        {/* Chat Widget Status */}
        <Layout.Section>
          <Card title="Chat Widget Status">
            <Box padding="4">
              <Stack vertical spacing="loose">
                <Stack distribution="equalSpacing" alignment="center">
                  <Text variant="bodyMd" as="p">Widget Status</Text>
                  <Badge tone="success">Active</Badge>
                </Stack>
                
                <Stack distribution="equalSpacing" alignment="center">
                  <Text variant="bodyMd" as="p">Cart Functionality</Text>
                  <Badge tone={settings?.allowAddToCart ? 'success' : 'info'}>
                    {settings?.allowAddToCart ? 'Enabled' : 'Disabled'}
                  </Badge>
                </Stack>

                <Stack distribution="equalSpacing" alignment="center">
                  <Text variant="bodyMd" as="p">Mode</Text>
                  <Badge tone={settings?.restrictToQA ? 'info' : 'success'}>
                    {settings?.restrictToQA ? 'Q&A Only' : 'Full Features'}
                  </Badge>
                </Stack>

                <Stack distribution="equalSpacing" alignment="center">
                  <Text variant="bodyMd" as="p">Tone</Text>
                  <Badge>{settings?.tonePreset || 'Professional'}</Badge>
                </Stack>

                <Box paddingBlockStart="3">
                  <Button 
                    primary 
                    icon={SettingsIcon}
                    url="/app/chat-settings"
                  >
                    Configure Chat Widget
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Recent Activity */}
        <Layout.Section>
          <Card title="Recent Activity">
            <DataTable
              columnContentTypes={['text', 'text', 'numeric', 'text']}
              headings={['Date', 'Metric', 'Value', 'Details']}
              rows={metricRows}
              emptyState="No recent activity"
            />
          </Card>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section>
          <Card title="Quick Actions">
            <Box padding="4">
              <Stack distribution="fillEvenly">
                <Button 
                  primary 
                  icon={PlayIcon}
                  url="/app/bulk-generate"
                  fullWidth
                >
                  Generate AI SEO
                </Button>
                <Button 
                  icon={ImageIcon}
                  url="/app/bulk-alt-text"
                  fullWidth
                >
                  Generate Alt Text
                </Button>
                <Button 
                  icon={ChatIcon}
                  url="/app/chat-settings"
                  fullWidth
                >
                  Chat Settings
                </Button>
                <Button 
                  icon={AnalyticsIcon}
                  url="/app/metrics"
                  fullWidth
                >
                  View Metrics
                </Button>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
