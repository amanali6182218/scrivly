(function () {
  'use strict';

  var GREETING = "Hi! I'm Scrivly Assistant 👋 How can I help you today?";
  var conversationHistory = [];
  var isOpen = false;
  var isSending = false;

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  function addMessage(container, role, text) {
    var row = el('div', 'scrivly-chat-msg scrivly-chat-msg-' + role);
    var bubble = el('div', 'scrivly-chat-bubble');
    bubble.textContent = text;
    row.appendChild(bubble);
    container.appendChild(row);
    scrollToBottom(container);
    return row;
  }

  function addTypingIndicator(container) {
    var row = el('div', 'scrivly-chat-msg scrivly-chat-msg-assistant scrivly-chat-typing-row');
    var bubble = el(
      'div',
      'scrivly-chat-bubble scrivly-chat-typing',
      '<span></span><span></span><span></span>'
    );
    row.appendChild(bubble);
    container.appendChild(row);
    scrollToBottom(container);
    return row;
  }

  function buildWidget() {
    var bubble = el('button', 'scrivly-chat-bubble-btn', 'S');
    bubble.type = 'button';
    bubble.setAttribute('aria-label', 'Open Scrivly Assistant');

    var win = el('div', 'scrivly-chat-window');
    win.style.display = 'none';

    var header = el('div', 'scrivly-chat-header');
    var headerLeft = el('div', 'scrivly-chat-header-left');
    var avatar = el('div', 'scrivly-chat-avatar', 'S');
    var title = el('span', 'scrivly-chat-title', 'Scrivly Assistant');
    headerLeft.appendChild(avatar);
    headerLeft.appendChild(title);
    var closeBtn = el('button', 'scrivly-chat-close', '&times;');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close chat');
    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    var messages = el('div', 'scrivly-chat-messages');

    var inputRow = el('div', 'scrivly-chat-input-row');
    var input = el('input', 'scrivly-chat-input');
    input.type = 'text';
    input.placeholder = 'Type your message…';
    var sendBtn = el('button', 'scrivly-chat-send', 'Send');
    sendBtn.type = 'button';
    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    win.appendChild(header);
    win.appendChild(messages);
    win.appendChild(inputRow);

    document.body.appendChild(bubble);
    document.body.appendChild(win);

    function openChat() {
      isOpen = true;
      win.style.display = 'flex';
      if (conversationHistory.length === 0) {
        addMessage(messages, 'assistant', GREETING);
      }
      input.focus();
    }

    function closeChat() {
      isOpen = false;
      win.style.display = 'none';
    }

    async function sendMessage() {
      var text = input.value.trim();
      if (!text || isSending) return;

      input.value = '';
      addMessage(messages, 'user', text);

      var userTurn = { role: 'user', content: text };
      var historyForRequest = conversationHistory.slice();
      conversationHistory.push(userTurn);

      isSending = true;
      sendBtn.disabled = true;
      var typingRow = addTypingIndicator(messages);

      try {
        var scrivlyUser = window.ScrivlyUser || {};
        var res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            userId: scrivlyUser.id || null,
            userEmail: scrivlyUser.email || null,
            conversationHistory: historyForRequest,
          }),
        });

        var data = await res.json();
        typingRow.remove();

        if (!res.ok) {
          addMessage(messages, 'assistant', "Sorry, something went wrong. Please try again in a moment.");
        } else {
          var reply = data.reply || "Sorry, I didn't catch that. Could you rephrase?";
          addMessage(messages, 'assistant', reply);
          conversationHistory.push({ role: 'assistant', content: reply });
        }
      } catch (err) {
        typingRow.remove();
        addMessage(messages, 'assistant', "Sorry, I couldn't reach the server. Please check your connection and try again.");
      } finally {
        isSending = false;
        sendBtn.disabled = false;
      }
    }

    bubble.addEventListener('click', function () {
      if (isOpen) {
        closeChat();
      } else {
        openChat();
      }
    });

    closeBtn.addEventListener('click', closeChat);

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    document.addEventListener('click', function (e) {
      if (!isOpen) return;
      if (win.contains(e.target) || bubble.contains(e.target)) return;
      closeChat();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
