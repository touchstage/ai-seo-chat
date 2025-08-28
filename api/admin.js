export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // For now, return a simple admin interface
    // In a real app, this would be the full Remix app
    const adminHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI SEO Chat - Admin</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  max-width: 1200px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  line-height: 1.6;
                  color: #333;
              }
              .header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .header h1 {
                  color: #333;
                  margin-bottom: 10px;
              }
              .header p {
                  color: #666;
                  font-size: 18px;
                }
              .admin-section {
                  background: white;
                  border: 1px solid #e1e5e9;
                  border-radius: 8px;
                  padding: 30px;
                  margin-bottom: 30px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .admin-section h2 {
                  color: #333;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #667eea;
                  padding-bottom: 10px;
              }
              .form-group {
                  margin-bottom: 20px;
              }
              .form-group label {
                  display: block;
                  margin-bottom: 5px;
                  font-weight: 600;
                  color: #333;
              }
              .form-group input, .form-group select, .form-group textarea {
                  width: 100%;
                  padding: 12px;
                  border: 1px solid #e1e5e9;
                  border-radius: 6px;
                  font-size: 14px;
                  font-family: inherit;
              }
              .form-group textarea {
                  min-height: 100px;
                  resize: vertical;
              }
              .btn {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 16px;
                  font-weight: 600;
                  transition: all 0.3s ease;
              }
              .btn:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              }
              .preview {
                  background: #f8f9fa;
                  border: 1px solid #e1e5e9;
                  border-radius: 8px;
                  padding: 20px;
                  margin-top: 20px;
                  position: relative;
                  min-height: 200px;
              }
              .chat-button-preview {
                  position: absolute;
                  bottom: 20px;
                  right: 20px;
                  width: 60px;
                  height: 60px;
                  border-radius: 50%;
                  background: #667eea;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 24px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              }
              .status {
                  background: #f0f8ff;
                  border: 1px solid #b3d9ff;
                  border-radius: 6px;
                  padding: 15px;
                  margin-bottom: 20px;
              }
              .status.success {
                  background: #f0fff0;
                  border-color: #9be6a4;
              }
              .grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                  gap: 20px;
                  margin-bottom: 30px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>🤖 AI SEO Chat - Admin Dashboard</h1>
              <p>Configure your AI chat widget settings</p>
          </div>

          <div class="status success">
              <strong>✅ App Status:</strong> AI SEO Chat is running successfully on Vercel!
          </div>

          <div class="grid">
              <div class="admin-section">
                  <h2>🎨 Widget Configuration</h2>
                  <div class="form-group">
                      <label>Enable Chat Widget</label>
                      <select id="enabled">
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Button Label</label>
                      <input type="text" id="buttonLabel" value="Chat with AI" placeholder="Enter button text">
                  </div>
                  <div class="form-group">
                      <label>Position</label>
                      <select id="position">
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Button Color</label>
                      <input type="color" id="buttonColor" value="#667eea">
                  </div>
              </div>

              <div class="admin-section">
                  <h2>🤖 AI Personality</h2>
                  <div class="form-group">
                      <label>Tone</label>
                      <select id="tone">
                          <option value="Professional">Professional</option>
                          <option value="Friendly">Friendly</option>
                          <option value="Casual">Casual</option>
                          <option value="Enthusiastic">Enthusiastic</option>
                      </select>
                  </div>
                  <div class="form-group">
                      <label>Welcome Message</label>
                      <textarea id="welcomeMessage" placeholder="Enter welcome message">Hi! I'm your AI assistant. How can I help you today?</textarea>
                  </div>
                  <div class="form-group">
                      <label>Personality Prompt</label>
                      <textarea id="personality" placeholder="Define AI personality">You are a helpful AI assistant for this store. Be friendly, knowledgeable, and conversational. Help customers with product questions, orders, and general inquiries.</textarea>
                  </div>
              </div>
          </div>

          <div class="admin-section">
              <h2>👀 Live Preview</h2>
              <p>This is how your chat widget will appear on your store:</p>
              <div class="preview">
                  <div style="margin-bottom: 20px;">
                      <div style="width: 100%; height: 60px; background: #e1e5e9; border-radius: 4px; margin-bottom: 10px;"></div>
                      <div style="width: 80%; height: 20px; background: #e1e5e9; border-radius: 4px; margin-bottom: 8px;"></div>
                      <div style="width: 60%; height: 20px; background: #e1e5e9; border-radius: 4px;"></div>
                  </div>
                  <div class="chat-button-preview" id="chatButtonPreview">💬</div>
              </div>
          </div>

          <div class="admin-section">
              <h2>💾 Save Settings</h2>
              <p>Click the button below to save your configuration:</p>
              <button class="btn" onclick="saveSettings()">Save Settings</button>
              <div id="saveStatus" style="margin-top: 15px;"></div>
          </div>

          <script>
              // Update preview when settings change
              function updatePreview() {
                  const buttonColor = document.getElementById('buttonColor').value;
                  const buttonLabel = document.getElementById('buttonLabel').value;
                  const position = document.getElementById('position').value;
                  
                  const preview = document.getElementById('chatButtonPreview');
                  preview.style.background = buttonColor;
                  preview.textContent = buttonLabel || '💬';
                  
                  // Update position
                  preview.style.position = 'absolute';
                  preview.style.bottom = '20px';
                  if (position === 'bottom-left') {
                      preview.style.left = '20px';
                      preview.style.right = 'auto';
                  } else if (position === 'bottom-center') {
                      preview.style.left = '50%';
                      preview.style.right = 'auto';
                      preview.style.transform = 'translateX(-50%)';
                  } else {
                      preview.style.right = '20px';
                      preview.style.left = 'auto';
                      preview.style.transform = 'none';
                  }
              }

              // Save settings
              async function saveSettings() {
                  const statusDiv = document.getElementById('saveStatus');
                  statusDiv.innerHTML = '<div style="color: #667eea;">Saving settings...</div>';
                  
                  const settings = {
                      enabled: document.getElementById('enabled').value === 'true',
                      buttonLabel: document.getElementById('buttonLabel').value,
                      buttonColor: document.getElementById('buttonColor').value,
                      position: document.getElementById('position').value,
                      tone: document.getElementById('tone').value,
                      welcomeMessage: document.getElementById('welcomeMessage').value,
                      personality: document.getElementById('personality').value
                  };

                  try {
                      // In a real app, this would save to your database
                      localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
                      
                      // Simulate API call
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      statusDiv.innerHTML = '<div style="color: #28a745;">✅ Settings saved successfully!</div>';
                      setTimeout(() => {
                          statusDiv.innerHTML = '';
                      }, 3000);
                  } catch (error) {
                      statusDiv.innerHTML = '<div style="color: #dc3545;">❌ Error saving settings. Please try again.</div>';
                  }
              }

              // Add event listeners
              document.getElementById('buttonColor').addEventListener('input', updatePreview);
              document.getElementById('buttonLabel').addEventListener('input', updatePreview);
              document.getElementById('position').addEventListener('change', updatePreview);

              // Load saved settings
              window.addEventListener('load', () => {
                  const saved = localStorage.getItem('ai-chat-settings');
                  if (saved) {
                      const settings = JSON.parse(saved);
                      document.getElementById('enabled').value = settings.enabled ? 'true' : 'false';
                      document.getElementById('buttonLabel').value = settings.buttonLabel || '';
                      document.getElementById('buttonColor').value = settings.buttonColor || '#667eea';
                      document.getElementById('position').value = settings.position || 'bottom-right';
                      document.getElementById('tone').value = settings.tone || 'Professional';
                      document.getElementById('welcomeMessage').value = settings.welcomeMessage || '';
                      document.getElementById('personality').value = settings.personality || '';
                      updatePreview();
                  }
              });
          </script>
      </body>
      </html>
    `;

    res.status(200).send(adminHTML);
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Failed to load admin interface' });
  }
}
