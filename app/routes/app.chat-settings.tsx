import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Stack,
  TextStyle,
  ColorPicker,
  RangeSlider,
  Checkbox,
  TextContainer,
  Heading,
  Box,
  Text,
  Badge,
  Divider,
  Icon,
  ButtonGroup,
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { DatabaseService } from '../services/database.server';
import { 
  SettingsIcon, 
  ChatIcon, 
  PreviewIcon,
  AnalyticsIcon,
  SaveIcon,
  CancelIcon,
} from '@shopify/polaris-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  try {
    // Get current chat settings
    const settings = await DatabaseService.getAppSettings(session.shop);
    
    return json({
      settings: settings || {
        chatEnabled: true,
        buttonLabel: 'Chat with AI',
        buttonColor: '#667eea',
        position: 'bottom-right',
        personality: "You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational. Help customers with product questions, orders, and general inquiries.",
        welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
        maxTokens: 300,
        temperature: 0.7,
        allowAddToCart: false,
        restrictToQA: true,
        tonePreset: 'Professional'
      },
      shop: session.shop
    });
  } catch (error) {
    console.error('Chat settings loader error:', error);
    return json({
      settings: {
        chatEnabled: true,
        buttonLabel: 'Chat with AI',
        buttonColor: '#667eea',
        position: 'bottom-right',
        personality: "You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational. Help customers with product questions, orders, and general inquiries.",
        welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
        maxTokens: 300,
        temperature: 0.7,
        allowAddToCart: false,
        restrictToQA: true,
        tonePreset: 'Professional'
      },
      shop: session.shop
    });
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  try {
    const settings = {
      chatEnabled: formData.get('chatEnabled') === 'true',
      buttonLabel: formData.get('buttonLabel') as string,
      buttonColor: formData.get('buttonColor') as string,
      position: formData.get('position') as string,
      personality: formData.get('personality') as string,
      welcomeMessage: formData.get('welcomeMessage') as string,
      maxTokens: parseInt(formData.get('maxTokens') as string),
      temperature: parseFloat(formData.get('temperature') as string),
      allowAddToCart: formData.get('allowAddToCart') === 'true',
      restrictToQA: formData.get('restrictToQA') === 'true',
      tonePreset: formData.get('tonePreset') as string,
    };

    // Save settings to database
    await DatabaseService.updateAppSettings(session.shop, settings);

    return json({ success: true, settings });
  } catch (error) {
    console.error('Error saving chat settings:', error);
    return json({ success: false, error: error.message });
  }
}

export default function ChatSettings() {
  const { settings, shop } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  
  const [formSettings, setFormSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const positionOptions = [
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Center', value: 'bottom-center' }
  ];

  const toneOptions = [
    { label: 'Professional', value: 'Professional' },
    { label: 'Friendly', value: 'Friendly' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Enthusiastic', value: 'Enthusiastic' },
    { label: 'Formal', value: 'Formal' }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setFormSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');

    const formData = new FormData();
    Object.entries(formSettings).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    submit(formData, { method: 'post' });
  };

  const handleCancel = () => {
    setFormSettings(settings);
    setSaveStatus('');
  };

  const getPositionStyles = () => {
    const position = formSettings.position || 'bottom-right';
    
    switch (position) {
      case 'bottom-left':
        return 'bottom: 20px; left: 20px; right: auto;';
      case 'bottom-center':
        return 'bottom: 20px; left: 50%; right: auto; transform: translateX(-50%);';
      case 'bottom-right':
      default:
        return 'bottom: 20px; right: 20px; left: auto;';
    }
  };

  return (
    <Page
      title="Chat Widget Settings"
      subtitle="Customize your AI chat widget appearance and behavior"
      backAction={{ content: 'Dashboard', url: '/app' }}
      primaryAction={{
        content: 'Save Settings',
        onAction: handleSave,
        loading: isSaving,
        icon: SaveIcon
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleCancel,
          icon: CancelIcon
        }
      ]}
    >
      <Layout>
        {saveStatus === 'success' && (
          <Layout.Section>
            <Banner status="success">
              Chat widget settings saved successfully!
            </Banner>
          </Layout.Section>
        )}

        {saveStatus === 'error' && (
          <Layout.Section>
            <Banner status="critical">
              Error saving settings. Please try again.
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <Box padding="4">
              <Stack vertical spacing="loose">
                <Stack alignment="center" distribution="equalSpacing">
                  <Heading>Widget Configuration</Heading>
                  <Badge tone={formSettings.chatEnabled ? 'success' : 'critical'}>
                    {formSettings.chatEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </Stack>
                
                <FormLayout>
                  <Checkbox
                    label="Enable AI Chat Widget"
                    checked={formSettings.chatEnabled}
                    onChange={(checked) => handleSettingChange('chatEnabled', checked)}
                    helpText="Turn the chat widget on or off for your store"
                  />

                  <TextField
                    label="Button Label"
                    value={formSettings.buttonLabel}
                    onChange={(value) => handleSettingChange('buttonLabel', value)}
                    helpText="Text displayed on the chat button"
                    placeholder="Chat with AI"
                  />

                  <Select
                    label="Position"
                    options={positionOptions}
                    value={formSettings.position}
                    onChange={(value) => handleSettingChange('position', value)}
                    helpText="Where the chat button appears on your store"
                  />

                  <div>
                    <TextStyle variation="strong">Button Color</TextStyle>
                    <div style={{ marginTop: '8px' }}>
                      <ColorPicker
                        onChange={(color) => handleSettingChange('buttonColor', color.hex)}
                        color={formSettings.buttonColor}
                      />
                    </div>
                  </div>
                </FormLayout>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Box padding="4">
              <Stack vertical spacing="loose">
                <Heading>AI Personality</Heading>
                
                <FormLayout>
                  <Select
                    label="Tone Preset"
                    options={toneOptions}
                    value={formSettings.tonePreset}
                    onChange={(value) => handleSettingChange('tonePreset', value)}
                    helpText="Choose a predefined tone for your AI assistant"
                  />

                  <TextField
                    label="Personality Prompt"
                    value={formSettings.personality}
                    onChange={(value) => handleSettingChange('personality', value)}
                    multiline={4}
                    helpText="Define how your AI assistant should behave and respond"
                    placeholder="You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational..."
                  />

                  <TextField
                    label="Welcome Message"
                    value={formSettings.welcomeMessage}
                    onChange={(value) => handleSettingChange('welcomeMessage', value)}
                    helpText="First message customers see when they open the chat"
                    placeholder="Hi! I'm your AI assistant. How can I help you today?"
                  />

                  <RangeSlider
                    label="Response Length"
                    value={formSettings.maxTokens}
                    onChange={(value) => handleSettingChange('maxTokens', value)}
                    min={100}
                    max={500}
                    step={50}
                    helpText="Maximum length of AI responses"
                  />

                  <RangeSlider
                    label="Creativity Level"
                    value={formSettings.temperature}
                    onChange={(value) => handleSettingChange('temperature', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    helpText="How creative vs focused the AI responses should be"
                  />
                </FormLayout>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Box padding="4">
              <Stack vertical spacing="loose">
                <Heading>Advanced Settings</Heading>
                
                <FormLayout>
                  <Checkbox
                    label="Allow Add to Cart"
                    checked={formSettings.allowAddToCart}
                    onChange={(checked) => handleSettingChange('allowAddToCart', checked)}
                    helpText="Allow customers to add products to cart through the chat"
                  />

                  <Checkbox
                    label="Restrict to Q&A Only"
                    checked={formSettings.restrictToQA}
                    onChange={(checked) => handleSettingChange('restrictToQA', checked)}
                    helpText="Limit chat to questions and answers only"
                  />
                </FormLayout>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Box padding="4">
              <Stack vertical spacing="loose">
                <Stack alignment="center" distribution="equalSpacing">
                  <Heading>Live Preview</Heading>
                  <Icon source={PreviewIcon} />
                </Stack>
                
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  position: 'relative',
                  minHeight: '200px'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      width: '100%',
                      height: '60px',
                      backgroundColor: '#e1e5e9',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}></div>
                    <div style={{
                      width: '80%',
                      height: '20px',
                      backgroundColor: '#e1e5e9',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}></div>
                    <div style={{
                      width: '60%',
                      height: '20px',
                      backgroundColor: '#e1e5e9',
                      borderRadius: '4px'
                    }}></div>
                  </div>

                  {/* Chat Button Preview */}
                  <div style={{
                    position: 'absolute',
                    ...getPositionStyles(),
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: formSettings.buttonColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer'
                  }}>
                    💬
                  </div>
                </div>

                <TextContainer>
                  <p>This is how your chat widget will appear on your store. The button will be positioned as selected above.</p>
                </TextContainer>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Box padding="4">
              <Stack vertical spacing="loose">
                <Stack alignment="center" distribution="equalSpacing">
                  <Heading>Widget Status</Heading>
                  <Icon source={AnalyticsIcon} />
                </Stack>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <TextStyle variation="strong" size="large">Active</TextStyle>
                    <p>Widget Status</p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f0fff0',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <TextStyle variation="strong" size="large">{formSettings.position}</TextStyle>
                    <p>Position</p>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fff8f0',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <TextStyle variation="strong" size="large">{formSettings.tonePreset}</TextStyle>
                    <p>Tone</p>
                  </div>
                </div>
              </Stack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
