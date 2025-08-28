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
  Heading
} from '@shopify/polaris';

export default function Index() {
  const [settings, setSettings] = useState({
    personality: "You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational. Help customers with product questions, orders, and general inquiries.",
    position: 'bottom-right',
    buttonLabel: 'Chat with AI',
    buttonColor: '#667eea',
    enabled: true,
    welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
    maxTokens: 300,
    temperature: 0.7
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, this would load from your database
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem('ai-chat-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // In a real app, this would save to your database
      localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const positionOptions = [
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Center', value: 'bottom-center' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Page
      title="AI SEO Chat Settings"
      subtitle="Customize your AI chat widget"
      primaryAction={{
        content: 'Save Settings',
        onAction: saveSettings,
        loading: isSaving
      }}
    >
      <Layout>
        {saveStatus === 'success' && (
          <Layout.Section>
            <Banner status="success">
              Settings saved successfully!
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
          <Card sectioned>
            <Stack vertical spacing="loose">
              <Heading>Widget Configuration</Heading>
              
              <FormLayout>
                <Checkbox
                  label="Enable AI Chat Widget"
                  checked={settings.enabled}
                  onChange={(checked) => handleSettingChange('enabled', checked)}
                  helpText="Turn the chat widget on or off for your store"
                />

                <TextField
                  label="Button Label"
                  value={settings.buttonLabel}
                  onChange={(value) => handleSettingChange('buttonLabel', value)}
                  helpText="Text displayed on the chat button"
                  placeholder="Chat with AI"
                />

                <Select
                  label="Position"
                  options={positionOptions}
                  value={settings.position}
                  onChange={(value) => handleSettingChange('position', value)}
                  helpText="Where the chat button appears on your store"
                />

                <div>
                  <TextStyle variation="strong">Button Color</TextStyle>
                  <div style={{ marginTop: '8px' }}>
                    <ColorPicker
                      onChange={(color) => handleSettingChange('buttonColor', color.hex)}
                      color={settings.buttonColor}
                    />
                  </div>
                </div>
              </FormLayout>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned>
            <Stack vertical spacing="loose">
              <Heading>AI Personality</Heading>
              
              <FormLayout>
                <TextField
                  label="Personality Prompt"
                  value={settings.personality}
                  onChange={(value) => handleSettingChange('personality', value)}
                  multiline={4}
                  helpText="Define how your AI assistant should behave and respond"
                  placeholder="You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational..."
                />

                <TextField
                  label="Welcome Message"
                  value={settings.welcomeMessage}
                  onChange={(value) => handleSettingChange('welcomeMessage', value)}
                  helpText="First message customers see when they open the chat"
                  placeholder="Hi! I'm your AI assistant. How can I help you today?"
                />

                <RangeSlider
                  label="Response Length"
                  value={settings.maxTokens}
                  onChange={(value) => handleSettingChange('maxTokens', value)}
                  min={100}
                  max={500}
                  step={50}
                  helpText="Maximum length of AI responses"
                />

                <RangeSlider
                  label="Creativity Level"
                  value={settings.temperature}
                  onChange={(value) => handleSettingChange('temperature', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  helpText="How creative vs focused the AI responses should be"
                />
              </FormLayout>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned>
            <Stack vertical spacing="loose">
              <Heading>Preview</Heading>
              
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
                  bottom: '20px',
                  right: settings.position === 'bottom-right' ? '20px' : 
                         settings.position === 'bottom-left' ? '20px' : '50%',
                  left: settings.position === 'bottom-center' ? '50%' : 'auto',
                  transform: settings.position === 'bottom-center' ? 'translateX(-50%)' : 'none',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: settings.buttonColor,
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
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned>
            <Stack vertical spacing="loose">
              <Heading>Usage Statistics</Heading>
              
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
                  <TextStyle variation="strong" size="large">0</TextStyle>
                  <p>Total Conversations</p>
                </div>
                
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f0fff0',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <TextStyle variation="strong" size="large">0</TextStyle>
                  <p>Messages Today</p>
                </div>
                
                <div style={{
                  padding: '20px',
                  backgroundColor: '#fff8f0',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <TextStyle variation="strong" size="large">0%</TextStyle>
                  <p>Customer Satisfaction</p>
                </div>
              </div>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
