(function() {
  'use strict';

  // Chat Widget Configuration
  const CONFIG = {
    apiEndpoint: 'https://ai-seo-chat-at1rh8ah6-touchstage-e448053b.vercel.app/apps/seo/chat',
    settingsEndpoint: 'https://ai-seo-chat-at1rh8ah6-touchstage-e448053b.vercel.app/apps/seo/settings',
    widgetId: 'ai-seo-chat-widget',
    sessionId: null,
    isOpen: false,
    isMinimized: false,
    currentProductId: null,
    settings: {
      position: 'bottom-right',
      buttonLabel: 'Chat with AI',
      buttonColor: '#667eea',
      welcomeMessage: "Hi! I'm your AI assistant. How can I help you today?",
      enabled: true
    }
  };

  // Generate session ID safely
  try {
    CONFIG.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  } catch (error) {
    CONFIG.sessionId = 'session_' + Date.now();
  }

  // Get current product ID from page
  function getCurrentProductId() {
    try {
      // Try to get from meta tag
      const productMeta = document.querySelector('meta[property="og:url"]');
      if (productMeta) {
        const url = productMeta.getAttribute('content');
        const match = url.match(/\/products\/([^\/\?]+)/);
        if (match) {
          return match[1];
        }
      }

      // Try to get from product form
      const productForm = document.querySelector('form[action*="/cart/add"]');
      if (productForm) {
        const productInput = productForm.querySelector('input[name="id"]');
        if (productInput) {
          return productInput.value;
        }
      }
    } catch (error) {
      console.warn('Error getting product ID:', error);
    }
    return null;
  }

  // Get store settings from API
  async function getStoreSettings() {
    try {
      const shop = window.Shopify?.shop || window.location.hostname;
      
      // Fetch settings from API
      const response = await fetch(`${CONFIG.settingsEndpoint}?shop=${encodeURIComponent(shop)}`);
      if (response.ok) {
        const settings = await response.json();
        CONFIG.settings = { ...CONFIG.settings, ...settings };
      } else {
        console.warn('Failed to load store settings, using defaults');
      }
    } catch (error) {
      console.warn('Error loading store settings:', error);
    }
  }

  // Get position styles based on settings
  function getPositionStyles() {
    const position = CONFIG.settings.position || 'bottom-right';
    
    switch (position) {
      case 'bottom-left':
        return 'bottom: 20px; left: 20px; right: auto;';
      case 'bottom-center':
        return 'bottom: 20px; left: 50%; right: auto; transform: translateX(-50%);';
      case 'bottom-right':
      default:
        return 'bottom: 20px; right: 20px; left: auto;';
    }
  }

  // Create widget HTML
  function createWidgetHTML() {
    const positionStyles = getPositionStyles();
    
    return `
      <div id="${CONFIG.widgetId}" class="ai-chat-widget">
        <style>
          .ai-chat-widget {
            position: fixed;
            ${positionStyles}
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
          }

          .ai-chat-widget * {
            box-sizing: border-box;
          }

          .ai-chat-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${CONFIG.settings.buttonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
          }

          .ai-chat-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          }

          .ai-chat-container {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
          }

          .ai-chat-container.open {
            opacity: 1;
            transform: translateY(0);
          }

          .ai-chat-header {
            background: ${CONFIG.settings.buttonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .ai-chat-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .ai-chat-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .ai-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            background: #f8f9fa;
          }

          .ai-chat-message {
            margin-bottom: 1rem;
            display: flex;
            align-items: flex-start;
          }

          .ai-chat-message.user {
            justify-content: flex-end;
          }

          .ai-chat-message-content {
            max-width: 80%;
            padding: 0.75rem 1rem;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
          }

          .ai-chat-message.user .ai-chat-message-content {
            background: ${CONFIG.settings.buttonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            border-bottom-right-radius: 4px;
          }

          .ai-chat-message.ai .ai-chat-message-content {
            background: white;
            color: #333;
            border: 1px solid #e1e5e9;
            border-bottom-left-radius: 4px;
          }

          .ai-chat-input {
            padding: 1rem;
            background: white;
            border-top: 1px solid #e1e5e9;
            display: flex;
            gap: 0.5rem;
          }

          .ai-chat-input input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #e1e5e9;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
          }

          .ai-chat-input input:focus {
            border-color: ${CONFIG.settings.buttonColor || '#667eea'};
          }

          .ai-chat-send {
            background: ${CONFIG.settings.buttonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
          }

          .ai-chat-loading {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
            font-size: 14px;
          }

          .ai-chat-loading-dots {
            display: flex;
            gap: 2px;
          }

          .ai-chat-loading-dots span {
            width: 6px;
            height: 6px;
            background: ${CONFIG.settings.buttonColor || '#667eea'};
            border-radius: 50%;
            animation: loading 1.4s infinite ease-in-out;
          }

          .ai-chat-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
          .ai-chat-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

          @keyframes loading {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }

          .ai-chat-welcome {
            text-align: center;
            padding: 2rem 1rem;
            color: #666;
          }

          .ai-chat-welcome h4 {
            margin: 0 0 0.5rem 0;
            color: #333;
          }

          .ai-chat-welcome p {
            margin: 0;
            font-size: 14px;
          }
        </style>

        <div class="ai-chat-toggle" onclick="window.AIChatWidget.toggle()">
          💬
        </div>

        <div class="ai-chat-container">
          <div class="ai-chat-header">
            <h3>${CONFIG.settings.buttonLabel || 'AI Assistant'}</h3>
            <button class="ai-chat-close" onclick="window.AIChatWidget.close()">×</button>
          </div>
          
          <div class="ai-chat-messages">
            <div class="ai-chat-welcome">
              <h4>👋 Hello!</h4>
              <p>${CONFIG.settings.welcomeMessage || "I'm your AI assistant. Ask me anything about our products, shipping, returns, or any other questions!"}</p>
            </div>
          </div>
          
          <div class="ai-chat-input">
            <input type="text" placeholder="Type your message..." onkeypress="if(event.key==='Enter') window.AIChatWidget.sendMessage(this.value)">
            <button class="ai-chat-send" onclick="window.AIChatWidget.sendMessage(document.querySelector('.ai-chat-input input').value)">→</button>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize widget
  async function initWidget() {
    try {
      // Check if widget already exists
      if (document.getElementById(CONFIG.widgetId)) {
        return;
      }

      // Load store settings
      await getStoreSettings();

      // Check if widget is enabled
      if (!CONFIG.settings.enabled) {
        return;
      }

      // Create and append widget
      const widgetHTML = createWidgetHTML();
      document.body.insertAdjacentHTML('beforeend', widgetHTML);

      // Get current product ID
      CONFIG.currentProductId = getCurrentProductId();

      console.log('AI SEO Chat widget initialized successfully');
    } catch (error) {
      console.error('Error initializing AI SEO Chat widget:', error);
    }
  }

  // Toggle widget
  function toggleWidget() {
    try {
      const container = document.querySelector(`#${CONFIG.widgetId} .ai-chat-container`);
      if (container) {
        CONFIG.isOpen = !CONFIG.isOpen;
        container.classList.toggle('open', CONFIG.isOpen);
        
        if (CONFIG.isOpen) {
          document.querySelector(`#${CONFIG.widgetId} .ai-chat-input input`).focus();
        }
      }
    } catch (error) {
      console.error('Error toggling widget:', error);
    }
  }

  // Open widget
  function openWidget() {
    try {
      const container = document.querySelector(`#${CONFIG.widgetId} .ai-chat-container`);
      if (container && !CONFIG.isOpen) {
        CONFIG.isOpen = true;
        container.classList.add('open');
        document.querySelector(`#${CONFIG.widgetId} .ai-chat-input input`).focus();
      }
    } catch (error) {
      console.error('Error opening widget:', error);
    }
  }

  // Close widget
  function closeWidget() {
    try {
      const container = document.querySelector(`#${CONFIG.widgetId} .ai-chat-container`);
      if (container && CONFIG.isOpen) {
        CONFIG.isOpen = false;
        container.classList.remove('open');
      }
    } catch (error) {
      console.error('Error closing widget:', error);
    }
  }

  // Send message
  function sendMessage(message) {
    try {
      if (!message || !message.trim()) return;

      const input = document.querySelector(`#${CONFIG.widgetId} .ai-chat-input input`);
      const messagesContainer = document.querySelector(`#${CONFIG.widgetId} .ai-chat-messages`);
      
      // Clear input
      input.value = '';

      // Add user message
      addMessage(message, 'user');

      // Show loading
      showLoading();

      // Send to API
      fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: CONFIG.sessionId,
          productId: CONFIG.currentProductId,
          shop: window.Shopify?.shop || window.location.hostname
        })
      })
      .then(response => response.json())
      .then(data => {
        hideLoading();
        if (data.response) {
          addMessage(data.response, 'ai');
        } else {
          addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
        hideLoading();
        addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'ai');
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      hideLoading();
      addMessage('Sorry, something went wrong. Please try again.', 'ai');
    }
  }

  // Add message to chat
  function addMessage(message, type) {
    try {
      const messagesContainer = document.querySelector(`#${CONFIG.widgetId} .ai-chat-messages`);
      const messageDiv = document.createElement('div');
      messageDiv.className = `ai-chat-message ${type}`;
      messageDiv.innerHTML = `<div class="ai-chat-message-content">${message}</div>`;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  // Show loading indicator
  function showLoading() {
    try {
      const messagesContainer = document.querySelector(`#${CONFIG.widgetId} .ai-chat-messages`);
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'ai-chat-message ai';
      loadingDiv.id = 'ai-chat-loading';
      loadingDiv.innerHTML = `
        <div class="ai-chat-message-content">
          <div class="ai-chat-loading">
            <span>AI is thinking</span>
            <div class="ai-chat-loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;
      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Error showing loading:', error);
    }
  }

  // Hide loading indicator
  function hideLoading() {
    try {
      const loadingDiv = document.getElementById('ai-chat-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }
    } catch (error) {
      console.error('Error hiding loading:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Expose widget API globally
  window.AIChatWidget = {
    toggle: toggleWidget,
    open: openWidget,
    close: closeWidget,
    sendMessage: sendMessage,
    init: initWidget
  };

})();
