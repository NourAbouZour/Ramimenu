(function () {
  'use strict';

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
})();
