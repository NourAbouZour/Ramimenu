(function () {
  'use strict';

  // ----- Edit these when you have the info -----
  const OPENING_TIMES = 'Opening times: 12:00 PM to 1:00 AM (every day)';
  const LOCATION = 'Location: Nazlet esblnada abel ko3 Le bnzlak 3ala de3a be waj Vila ka3ky';

  // ----- Chat API -----
  // API key in code: chat works on GitHub Pages / any static host. No Vercel or .env needed.
  const OPENAI_API_KEY = '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';
  const CHAT_API_URL = ''; // no backend: key above is used from the browser
  const STORAGE_KEY = 'menurami_openai_key';
  function getOpenAIKey() {
    return localStorage.getItem(STORAGE_KEY) || OPENAI_API_KEY || '';
  }
  function setOpenAIKey(key) {
    if (key && key.trim()) localStorage.setItem(STORAGE_KEY, key.trim());
  }

  const menu = document.querySelector('.menu-paper');
  const sections = document.querySelectorAll('.menu-section');
  const items = document.querySelectorAll('.menu-item');
  const banner = document.querySelector('.section-banner');

  // ----- Image fallback: if images/ file missing, use data-fallback URL -----
  document.querySelectorAll('.item-image[data-fallback]').forEach((img) => {
    img.addEventListener('error', function () {
      const fallback = this.getAttribute('data-fallback');
      if (fallback) {
        this.src = fallback;
        this.removeAttribute('data-fallback');
      }
    });
  });

  // ----- Scroll-triggered fade-in for sections -----
  const observerOptions = { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    });
  }, observerOptions);

  sections.forEach((section, i) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
    observer.observe(section);
  });

  // First section visible immediately if in view
  const firstSection = sections[0];
  if (firstSection && firstSection.getBoundingClientRect().top < window.innerHeight) {
    firstSection.style.opacity = '1';
    firstSection.style.transform = 'translateY(0)';
  }

  // ----- Cover logo subtle entrance -----
  const cover = document.querySelector('.cover');
  if (cover) {
    const logo = cover.querySelector('.logo-oval');
    const tagline = cover.querySelector('.tagline');
    if (logo) {
      logo.style.opacity = '0';
      logo.style.transform = 'translateY(16px)';
      logo.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';
      requestAnimationFrame(() => {
        logo.style.opacity = '1';
        logo.style.transform = 'translateY(0)';
      });
    }
    if (tagline) {
      tagline.style.opacity = '0';
      tagline.style.transition = 'opacity 0.8s ease 0.5s';
      requestAnimationFrame(() => { tagline.style.opacity = '1'; });
    }
  }

  // ----- Menu item hover: subtle glow on price -----
  items.forEach((item) => {
    const priceEl = item.querySelector('.item-price');
    if (!priceEl) return;
    item.addEventListener('mouseenter', () => {
      priceEl.style.textShadow = '0 0 12px rgba(212, 175, 55, 0.5)';
      priceEl.style.transition = 'text-shadow 0.25s ease';
    });
    item.addEventListener('mouseleave', () => {
      priceEl.style.textShadow = 'none';
    });
  });

  // ----- Click image: lightbox-style overlay -----
  const images = document.querySelectorAll('.item-image');
  let overlay = null;

  function openLightbox(src, alt) {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'menu-lightbox';
    overlay.innerHTML = `
      <div class="menu-lightbox-backdrop"></div>
      <div class="menu-lightbox-content">
        <img src="${src}" alt="${alt || 'Menu item'}" />
        <button type="button" class="menu-lightbox-close" aria-label="Close">×</button>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
      padding: 1rem; animation: menuLightboxIn 0.25s ease;
    `;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes menuLightboxIn { from { opacity: 0; } to { opacity: 1; } }
      .menu-lightbox-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.85); cursor: pointer; }
      .menu-lightbox-content { position: relative; max-width: 90vw; max-height: 85vh; border: 3px solid #c9a227; border-radius: 8px; overflow: hidden; box-shadow: 0 0 40px rgba(201,162,39,0.3); }
      .menu-lightbox-content img { display: block; max-width: 100%; max-height: 85vh; object-fit: contain; }
      .menu-lightbox-close { position: absolute; top: 8px; right: 8px; width: 36px; height: 36px; border: 2px solid #c9a227; background: rgba(0,0,0,0.7); color: #d4af37; font-size: 24px; line-height: 1; cursor: pointer; border-radius: 4px; }
      .menu-lightbox-close:hover { background: rgba(201,162,39,0.2); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const close = () => {
      if (!overlay) return;
      overlay.style.animation = 'menuLightboxIn 0.2s ease reverse';
      setTimeout(() => {
        overlay.remove();
        overlay = null;
      }, 180);
    };

    overlay.querySelector('.menu-lightbox-backdrop').addEventListener('click', close);
    overlay.querySelector('.menu-lightbox-close').addEventListener('click', close);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    overlay.tabIndex = 0;
    overlay.focus();
  }

  images.forEach((img) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      const src = img.currentSrc || img.src;
      openLightbox(src, img.alt);
    });
  });

  document.querySelectorAll('.item-price').forEach((el) => {
    el.setAttribute('title', 'Price');
  });

  // ----- Menu chatbot (OpenAI): menu, opening times, location only; English & Arabic -----
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');

  const MENU_DATA = {
    sandwiches: [
      { name: 'Mohammara El Skelmbou', desc: 'House specialty with roasted pepper & walnut spread', price: '250,000', signature: true },
      {
        name: 'Tawouk',
        desc: 'Tawouk, salad, pickles, garlic sauce, fries',
        desc_ar: 'طاووق، سلطة، كبس، ثوم، بطاطا',
        calories: 750,
        protein_g: 40,
        price: '400,000'
      },
      { name: 'Mohammara', desc: 'Roasted red pepper & walnut', price: '100,000' },
      {
        name: 'Sandwich Jwaneh',
        desc: 'Wings, salad, pickles, garlic sauce, fries',
        desc_ar: 'جوانح، سلطة، كبس، ثوم، بطاطا',
        calories: 820,
        protein_g: 35,
        price: '350,000'
      },
      {
        name: 'Sandwich Djaj',
        desc: 'Chicken, salad, pickles, garlic sauce, fries',
        desc_ar: 'دجاج، سلطة، كبس، ثوم، بطاطا',
        calories: 720,
        protein_g: 38,
        price: '350,000'
      },
      { name: 'Potato Sandwich', desc: 'Golden fries in fresh bread', price: '200,000' },
      { name: 'Shaqf Sandwich Meal', desc: 'Combo with fries & drink', price: '300,000' },
      {
        name: 'Farooj',
        desc: 'Garlic sauce, pickles, salad, grilled onions, mohammara',
        desc_ar: 'ثوم، كبس، سلطة، بصل مشوي، محمرة',
        calories: 1500,
        protein_g: 120,
        price: '1,000,000'
      },
      {
        name: 'Jwaneh (16 pieces)',
        desc: '16 pieces wings, garlic sauce, pickles, salad, mohammara',
        desc_ar: 'جوانح ١٦ قطعة، ثوم، كبس، سلطة، محمرة',
        calories: 1200,
        protein_g: 80,
        price: '—'
      }
    ],
    drinks: [
      { name: 'Arabic Coffee', price: '50,000' },
      { name: 'Fresh Lemonade', price: '80,000' },
      { name: 'Ayran', price: '60,000' },
      { name: 'Fresh Juice', price: '120,000' }
    ]
  };

  const SYSTEM_PROMPT = `You are the assistant for Dar Baalshmay cafe & restaurant. You must ONLY answer questions about:
1) Menu items (food and drinks): names, descriptions, and prices.
2) Opening hours / opening times.
3) Location, address, or how to find the restaurant.

Use ONLY this information:

OPENING TIMES: ${OPENING_TIMES}
LOCATION: ${LOCATION}

MENU - Sandwiches: ${MENU_DATA.sandwiches.map((i) => i.name + (i.desc ? ': ' + i.desc : '') + ' — ' + i.price).join('; ')}
MENU - Drinks: ${MENU_DATA.drinks.map((i) => i.name + ' — ' + i.price).join('; ')}

If the user asks anything else (reservations, jobs, other topics), politely say you can only help with menu items, opening times, and location.
IMPORTANT: Respond in the SAME language the user writes in. If they write in Arabic, reply in Arabic. If they write in English, reply in English. Support both English and Arabic.`;

  function buildMenuText() {
    const sandwiches = MENU_DATA.sandwiches
      .map((i) => {
        const en = i.desc ? `EN: ${i.desc}` : '';
        const ar = i.desc_ar ? `AR: ${i.desc_ar}` : '';
        const macros = (typeof i.calories === 'number' && typeof i.protein_g === 'number')
          ? `Approx: ${i.calories} kcal, ${i.protein_g}g protein`
          : '';
        const parts = [en, ar, macros].filter(Boolean).join(' | ');
        return `${i.name}${parts ? ': ' + parts : ''} — ${i.price}`;
      })
      .join('; ');
    const drinks = MENU_DATA.drinks
      .map((i) => i.name + ' — ' + i.price)
      .join('; ');
    return `MENU - Sandwiches: ${sandwiches}\nMENU - Drinks: ${drinks}`;
  }

  function addMessage(text, isUser, options) {
    if (!chatbotMessages) return null;
    const div = document.createElement('div');
    div.className = 'chatbot-msg ' + (isUser ? 'user' : 'bot') + (options && options.typing ? ' typing' : '');
    div.setAttribute('dir', 'auto');
    div.textContent = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return div;
  }

  function removeTypingIndicator() {
    if (!chatbotMessages) return;
    const typing = chatbotMessages.querySelector('.chatbot-msg.typing');
    if (typing) typing.remove();
  }

  async function sendToOpenAI(messages) {
    const apiUrl = (CHAT_API_URL || '').trim();
    if (apiUrl) {
      const url = apiUrl.startsWith('http') ? apiUrl : new URL(apiUrl, window.location.href).href;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingTimes: OPENING_TIMES,
          location: LOCATION,
          menuText: buildMenuText(),
          messages: messages
        })
      });
      if (!res.ok) {
        if (res.status === 404 && getOpenAIKey()) {
          // e.g. GitHub Pages with no serverless: fall back to direct OpenAI using /setkey
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = err.error || ('API error ' + res.status);
          if (res.status === 404) {
            throw new Error(msg + '. Deploy to Vercel and set OPENAI_API_KEY there, or type /setkey YOUR_KEY to use your key in this browser.');
          }
          throw new Error(msg);
        }
      } else {
        const data = await res.json();
        return (data.reply && data.reply.trim()) || null;
      }
    }
    const key = getOpenAIKey();
    if (!key) return null;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 400,
        temperature: 0.3
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error && err.error.message ? err.error.message : 'API error ' + res.status);
    }
    const data = await res.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return content ? content.trim() : null;
  }

  let chatHistory = [];

  async function sendUserMessage() {
    const text = (chatbotInput.value || '').trim();
    if (!text) return;

    // Special: set API key (user types exactly this)
    if (text.toLowerCase().startsWith('/setkey ')) {
      const key = text.slice(8).trim();
      setOpenAIKey(key);
      addMessage('API key saved. You can now chat with the assistant.', false);
      chatbotInput.value = '';
      return;
    }

    addMessage(text, true);
    chatbotInput.value = '';

    const useBackend = (CHAT_API_URL || '').trim().length > 0;
    const key = getOpenAIKey();
    if (!useBackend && !key) {
      addMessage('To use the chat here, type: /setkey YOUR_OPENAI_KEY (stored only in this browser). Get a key at platform.openai.com. Or deploy to Vercel with OPENAI_API_KEY set.', false);
      return;
    }

    chatHistory.push({ role: 'user', content: text });
    addMessage('…', false, { typing: true });

    try {
      const reply = await sendToOpenAI(chatHistory);
      removeTypingIndicator();
      if (reply) {
        chatHistory.push({ role: 'assistant', content: reply });
        addMessage(reply, false);
      } else {
        addMessage('Sorry, I could not get a response. Please try again.', false);
      }
    } catch (e) {
      removeTypingIndicator();
      addMessage('Error: ' + (e.message || 'Something went wrong. Check your API key and connection.'), false);
    }
  }

  if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener('click', () => {
      const isOpen = chatbotWindow.classList.contains('chatbot-window--open');
      chatbotWindow.classList.toggle('chatbot-window--open', !isOpen);
      chatbotWindow.setAttribute('aria-hidden', !isOpen ? 'false' : 'true');
      if (!isOpen && chatbotInput) chatbotInput.focus();
    });
  }
  if (chatbotClose && chatbotWindow) {
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.remove('chatbot-window--open');
      chatbotWindow.setAttribute('aria-hidden', 'true');
    });
  }
  if (chatbotSend) {
    chatbotSend.addEventListener('click', sendUserMessage);
  }
  if (chatbotInput) {
    chatbotInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendUserMessage();
    });
  }

  if (chatbotMessages && !chatbotMessages.innerHTML.trim()) {
    addMessage('Ask about our menu, opening hours, or location. English and Arabic supported.', false);
  }
})();
