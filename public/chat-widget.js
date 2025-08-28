(function() {
  'use strict';

  // Chat Widget Configuration
  const CONFIG = {
    apiEndpoint: '/apps/seo/chat',
    widgetId: 'ai-seo-chat-widget',
    sessionId: null,
    isOpen: false,
    isMinimized: false,
    currentProductId: null,
  };

  // Generate session ID
  CONFIG.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Get current product ID from page
  function getCurrentProductId() {
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

    return null;
  }

  // Create widget HTML
  function createWidgetHTML() {
    return `
      <div id="${CONFIG.widgetId}" class="ai-chat-widget">
        <style>
          .ai-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
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
            padding: 16px;
            overflow-y: auto;
            background: #f8f9fa;
          }

          .ai-chat-message {
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
          }

          .ai-chat-message.user {
            align-items: flex-end;
          }

          .ai-chat-message.assistant {
            align-items: flex-start;
          }

          .ai-chat-message-content {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
          }

          .ai-chat-message.user .ai-chat-message-content {
            background: #667eea;
            color: white;
            border-bottom-right-radius: 4px;
          }

          .ai-chat-message.assistant .ai-chat-message-content {
            background: white;
            color: #333;
            border: 1px solid #e1e5e9;
            border-bottom-left-radius: 4px;
          }

          .ai-chat-actions {
            padding: 12px 16px;
            border-top: 1px solid #e1e5e9;
            background: white;
          }

          .ai-chat-action-button {
            display: inline-block;
            margin: 4px 8px 4px 0;
            padding: 8px 12px;
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 16px;
            color: #333;
            text-decoration: none;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .ai-chat-action-button:hover {
            background: #e9ecef;
            border-color: #adb5bd;
          }

          .ai-chat-input {
            padding: 16px;
            border-top: 1px solid #e1e5e9;
            background: white;
            display: flex;
            gap: 8px;
          }

          .ai-chat-input input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e1e5e9;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
          }

          .ai-chat-input input:focus {
            border-color: #667eea;
          }

          .ai-chat-send {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #667eea;
            border: none;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.2s ease;
          }

          .ai-chat-send:hover {
            background: #5a6fd8;
            transform: scale(1.05);
          }

          .ai-chat-send:disabled {
            background: #adb5bd;
            cursor: not-allowed;
            transform: none;
          }

          .ai-chat-loading {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6c757d;
            font-size: 12px;
          }

          .ai-chat-loading-dots {
            display: flex;
            gap: 4px;
          }

          .ai-chat-loading-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #6c757d;
            animation: loading-dots 1.4s infinite ease-in-out;
          }

          .ai-chat-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
          .ai-chat-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

          @keyframes loading-dots {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }

          .ai-chat-welcome {
            text-align: center;
            padding: 20px;
            color: #6c757d;
          }

          .ai-chat-welcome h4 {
            margin: 0 0 8px 0;
            color: #333;
          }

          .ai-chat-welcome p {
            margin: 0 0 16px 0;
            font-size: 13px;
          }

          .ai-chat-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
          }

          .ai-chat-suggestion {
            padding: 8px 12px;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 16px;
            color: #333;
            text-decoration: none;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .ai-chat-suggestion:hover {
            background: #f8f9fa;
            border-color: #667eea;
          }

          @media (max-width: 480px) {
            .ai-chat-container {
              width: calc(100vw - 40px);
              right: -10px;
            }
          }
        </style>

        <button class="ai-chat-toggle" onclick="window.AIChatWidget.toggle()">
          💬
        </button>

        <div class="ai-chat-container">
          <div class="ai-chat-header">
            <h3>AI Shopping Assistant</h3>
            <button class="ai-chat-close" onclick="window.AIChatWidget.close()">×</button>
          </div>

          <div class="ai-chat-messages">
            <div class="ai-chat-welcome">
              <h4>👋 Hi there!</h4>
              <p>I'm here to help you find the perfect product and answer any questions you might have.</p>
              <div class="ai-chat-suggestions">
                <div class="ai-chat-suggestion" onclick="window.AIChatWidget.sendMessage('What are your shipping options?')">
                  Shipping info
                </div>
                <div class="ai-chat-suggestion" onclick="window.AIChatWidget.sendMessage('What is your return policy?')">
                  Returns
                </div>
                <div class="ai-chat-suggestion" onclick="window.AIChatWidget.sendMessage('Can you help me find the right size?')">
                  Size help
                </div>
              </div>
            </div>
          </div>

          <div class="ai-chat-input">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              onkeypress="if(event.key==='Enter') window.AIChatWidget.sendMessage(this.value)"
            >
            <button class="ai-chat-send" onclick="window.AIChatWidget.sendMessage(document.querySelector('.ai-chat-input input').value)">
              →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Chat Widget Class
  class AIChatWidget {
    constructor() {
      this.messages = [];
      this.isLoading = false;
      this.init();
    }

    init() {
      // Create shadow DOM
      const host = document.createElement('div');
      host.id = 'ai-chat-widget-host';
      document.body.appendChild(host);

      const shadow = host.attachShadow({ mode: 'closed' });
      shadow.innerHTML = createWidgetHTML();

      // Get current product ID
      CONFIG.currentProductId = getCurrentProductId();

      // Add welcome message
      this.addMessage('assistant', 'Hi! I\'m your AI shopping assistant. How can I help you today?');
    }

    toggle() {
      const container = this.getContainer();
      if (CONFIG.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      const container = this.getContainer();
      container.classList.add('open');
      CONFIG.isOpen = true;
      
      // Focus input
      setTimeout(() => {
        const input = this.getInput();
        if (input) input.focus();
      }, 300);
    }

    close() {
      const container = this.getContainer();
      container.classList.remove('open');
      CONFIG.isOpen = false;
    }

    async sendMessage(text) {
      if (!text.trim() || this.isLoading) return;

      const input = this.getInput();
      if (input) {
        input.value = '';
        input.disabled = true;
      }

      const sendButton = this.getSendButton();
      if (sendButton) {
        sendButton.disabled = true;
      }

      // Add user message
      this.addMessage('user', text);

      // Show loading
      this.showLoading();

      try {
        const response = await fetch(CONFIG.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            sessionId: CONFIG.sessionId,
            productId: CONFIG.currentProductId,
            context: {
              url: window.location.href,
              referrer: document.referrer,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Remove loading
        this.hideLoading();

        // Add assistant response
        this.addMessage('assistant', data.message);

        // Handle actions
        if (data.actions) {
          this.handleActions(data.actions);
        }

      } catch (error) {
        console.error('Chat error:', error);
        this.hideLoading();
        this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      } finally {
        // Re-enable input
        const input = this.getInput();
        if (input) {
          input.disabled = false;
          input.focus();
        }

        const sendButton = this.getSendButton();
        if (sendButton) {
          sendButton.disabled = false;
        }
      }
    }

    addMessage(role, content) {
      this.messages.push({ role, content, timestamp: new Date() });

      const messagesContainer = this.getMessagesContainer();
      if (!messagesContainer) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `ai-chat-message ${role}`;

      const contentDiv = document.createElement('div');
      contentDiv.className = 'ai-chat-message-content';
      contentDiv.textContent = content;

      messageDiv.appendChild(contentDiv);
      messagesContainer.appendChild(messageDiv);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showLoading() {
      const messagesContainer = this.getMessagesContainer();
      if (!messagesContainer) return;

      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'ai-chat-message assistant';
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
    }

    hideLoading() {
      const loadingDiv = document.getElementById('ai-chat-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }
    }

    handleActions(actions) {
      const actionsContainer = this.getActionsContainer();
      if (!actionsContainer) return;

      actionsContainer.innerHTML = '';

      switch (actions.type) {
        case 'product_info':
          this.handleProductInfo(actions.product);
          break;
        case 'related_products':
          this.handleRelatedProducts(actions.suggestions);
          break;
        case 'policy_info':
          this.handlePolicyInfo(actions.policy);
          break;
        case 'add_to_cart':
          this.handleAddToCart(actions.variantId, actions.quantity);
          break;
        case 'size_recommendation':
          this.handleSizeRecommendation(actions);
          break;
      }
    }

    handleProductInfo(product) {
      const actionsContainer = this.getActionsContainer();
      if (!actionsContainer) return;

      const productDiv = document.createElement('div');
      productDiv.style.cssText = `
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 8px 0;
      `;

      productDiv.innerHTML = `
        <h4 style="margin: 0 0 8px 0;">${product.title}</h4>
        ${product.description ? `<p style="margin: 0 0 8px 0; font-size: 13px;">${product.description}</p>` : ''}
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${product.variants.map(variant => `
            <button class="ai-chat-action-button" onclick="window.AIChatWidget.addToCart('${variant.id}', 1)">
              ${variant.title} - ${variant.price}
            </button>
          `).join('')}
        </div>
      `;

      actionsContainer.appendChild(productDiv);
    }

    handleRelatedProducts(suggestions) {
      const actionsContainer = this.getActionsContainer();
      if (!actionsContainer) return;

      const suggestionsDiv = document.createElement('div');
      suggestionsDiv.style.cssText = `
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 8px 0;
      `;

      suggestionsDiv.innerHTML = `
        <h4 style="margin: 0 0 8px 0;">Related Products</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${suggestions.map(suggestion => `
            <button class="ai-chat-action-button" onclick="window.AIChatWidget.sendMessage('Show me ${suggestion.category}')">
              ${suggestion.category}
            </button>
          `).join('')}
        </div>
      `;

      actionsContainer.appendChild(suggestionsDiv);
    }

    handlePolicyInfo(policy) {
      const actionsContainer = this.getActionsContainer();
      if (!actionsContainer) return;

      const policyDiv = document.createElement('div');
      policyDiv.style.cssText = `
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 8px 0;
      `;

      policyDiv.innerHTML = `
        <h4 style="margin: 0 0 8px 0;">${policy.title}</h4>
        <p style="margin: 0; font-size: 13px;">${policy.content.substring(0, 200)}...</p>
        <a href="/pages/${policy.handle}" class="ai-chat-action-button" style="margin-top: 8px; display: inline-block;">
          Read Full Policy
        </a>
      `;

      actionsContainer.appendChild(policyDiv);
    }

    async handleAddToCart(variantId, quantity) {
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{
              id: variantId,
              quantity: quantity,
            }],
          }),
        });

        if (response.ok) {
          this.addMessage('assistant', `Added to cart! You can view your cart or continue shopping.`);
          
          // Update cart count if it exists
          const cartCount = document.querySelector('.cart-count, .cart-count-bubble');
          if (cartCount) {
            // Trigger cart update event
            document.dispatchEvent(new CustomEvent('cart:updated'));
          }
        } else {
          this.addMessage('assistant', 'Sorry, there was an error adding the item to your cart.');
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        this.addMessage('assistant', 'Sorry, there was an error adding the item to your cart.');
      }
    }

    handleSizeRecommendation(actions) {
      const actionsContainer = this.getActionsContainer();
      if (!actionsContainer) return;

      const sizeDiv = document.createElement('div');
      sizeDiv.style.cssText = `
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 8px 0;
      `;

      sizeDiv.innerHTML = `
        <h4 style="margin: 0 0 8px 0;">Size Recommendation</h4>
        <p style="margin: 0 0 8px 0;">${actions.recommendation}</p>
        <button class="ai-chat-action-button" onclick="window.AIChatWidget.sendMessage('Show me the size chart')">
          View Size Chart
        </button>
      `;

      actionsContainer.appendChild(sizeDiv);
    }

    // Helper methods to get elements from shadow DOM
    getContainer() {
      const host = document.getElementById('ai-chat-widget-host');
      return host?.shadowRoot?.querySelector('.ai-chat-container');
    }

    getMessagesContainer() {
      const host = document.getElementById('ai-chat-widget-host');
      return host?.shadowRoot?.querySelector('.ai-chat-messages');
    }

    getInput() {
      const host = document.getElementById('ai-chat-widget-host');
      return host?.shadowRoot?.querySelector('.ai-chat-input input');
    }

    getSendButton() {
      const host = document.getElementById('ai-chat-widget-host');
      return host?.shadowRoot?.querySelector('.ai-chat-send');
    }

    getActionsContainer() {
      const host = document.getElementById('ai-chat-widget-host');
      return host?.shadowRoot?.querySelector('.ai-chat-actions');
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AIChatWidget = new AIChatWidget();
    });
  } else {
    window.AIChatWidget = new AIChatWidget();
  }

})();
