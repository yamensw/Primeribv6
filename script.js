/* Prime Rig interactions (no external libraries) — Enhanced
   - Mobile drawer menu
   - Scroll reveal + staggered grid reveal
   - Smooth scrolling for on-page anchors
   - Liquid-glass button press: sweep + ripple + micro-bounce
   - Dropdown menu (keyboard-accessible)
   - Scroll progress bar
   - Iframe loading states (spinner → fade-in)
   - Subtle parallax on hero card
   - Form feedback (success / error states)
   - prefers-reduced-motion respected throughout
*/

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------
  // Helpers
  // ---------------------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const raf = window.requestAnimationFrame.bind(window);

  // ---------------------------
  // Smooth scroll (only same-page hash links)
  // ---------------------------
  $$('a[href^="#"]:not(.dropdown-item)').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '#';
      if (href === '#' || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      closeMobileMenu();
      closeAllDropdowns();

      history.pushState(null, '', href);
    });
  });

  // ---------------------------
  // Mobile menu
  // ---------------------------
  const menuBtn    = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');

  function isMobileNavActive() {
    return window.matchMedia('(max-width: 720px)').matches;
  }

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.setAttribute('aria-modal', 'true');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.querySelector('span').textContent = 'Close';
    }
    document.documentElement.classList.add('no-scroll');
    // Move focus into the menu
    const firstLink = $('a, button', mobileMenu);
    if (firstLink) firstLink.focus();
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.removeAttribute('aria-modal');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.querySelector('span').textContent = 'Menu';
    }
    document.documentElement.classList.remove('no-scroll');
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    // Click outside dialog closes
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobileMenu();
    });

    // ESC closes
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        closeAllDropdowns();
      }
    });

    // Focus trap inside mobile menu
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = $$('a, button, [tabindex]:not([tabindex="-1"])', mobileMenu)
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (!isMobileNavActive()) closeMobileMenu();
    });
  }

  // Mobile menu links close after click
  if (mobileMenu) {
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMobileMenu));
  }

  // ---------------------------
  // Scroll reveal
  // ---------------------------
  const revealEls = $$('.reveal');
  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    revealEls.forEach(el => {
      if (!el.classList.contains('in')) io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Staggered grid reveal
  const staggerEls = $$('.reveal-stagger');
  if (!prefersReducedMotion && 'IntersectionObserver' in window && staggerEls.length) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          sio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    staggerEls.forEach(el => sio.observe(el));
  } else {
    staggerEls.forEach(el => el.classList.add('in'));
  }

  // ---------------------------
  // Active nav link (index page sections)
  // ---------------------------
  const navLinks = $$('.navlinks a[href^="#"]');
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href') || ''))
    .filter(Boolean);

  if (!prefersReducedMotion && 'IntersectionObserver' in window && navLinks.length && sections.length) {
    const map = new Map(sections.map((sec, i) => [sec, navLinks[i]]));

    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const link = map.get(entry.target);
          if (link) link.classList.add('active');
        }
      });
    }, { threshold: 0.45 });

    sections.forEach(sec => navIO.observe(sec));
  }

  // ---------------------------
  // Button: sweep + ripple + micro-bounce
  // ---------------------------
  const buttons = $$('.btn');

  buttons.forEach(btn => {
    if (!btn.querySelector('.sweep')) {
      const sweep = document.createElement('i');
      sweep.className = 'sweep';
      sweep.setAttribute('aria-hidden', 'true');
      btn.prepend(sweep);
    }

    if (!btn.querySelector('span')) {
      const text = btn.textContent;
      btn.textContent = '';
      const span = document.createElement('span');
      span.textContent = text;
      btn.append(span);
    }
  });

  let lastPointerDownAt = 0;

  function pressEffect(e, btn) {
    const rect = btn.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if ((clientX == null || clientY == null) && e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    if (clientX == null || clientY == null) {
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });

    btn.classList.remove('sweeping');
    void btn.offsetWidth;
    btn.classList.add('sweeping');
    window.setTimeout(() => btn.classList.remove('sweeping'), 420);

    btn.classList.add('pressed');
    window.setTimeout(() => btn.classList.remove('pressed'), 140);
  }

  buttons.forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      lastPointerDownAt = Date.now();
      pressEffect(e, btn);
    });

    btn.addEventListener('touchstart', (e) => {
      if (Date.now() - lastPointerDownAt < 250) return;
      pressEffect(e, btn);
    }, { passive: true });
  });

  // ---------------------------
  // Hero video: best-effort play
  // ---------------------------
  const heroVideo = $('video[data-hero]');
  if (heroVideo && !prefersReducedMotion) {
    const tryPlay = () => {
      const p = heroVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    tryPlay();
    window.addEventListener('touchstart', tryPlay, { once: true, passive: true });
    window.addEventListener('click',      tryPlay, { once: true });
  }

  // ---------------------------
  // Staggered card index variables
  // ---------------------------
  function initStaggeredCards() {
    const cards = $$('.glass.card.reveal');
    cards.forEach((card, index) => {
      card.style.setProperty('--i', index);
    });
  }

  // ---------------------------
  // Scroll progress indicator
  // ---------------------------
  function initScrollProgress() {
    if (prefersReducedMotion) return;

    let bar = $('.scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      raf(() => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height    = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        bar.style.width = (height > 0 ? (winScroll / height) * 100 : 0) + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------------------------
  // Iframe loading states
  // ---------------------------
  function initIframeLoaders() {
    // Find every iframe that is inside a wrapper div (showroom cards)
    $$('iframe[loading="lazy"]').forEach(iframe => {
      const parent = iframe.parentElement;
      if (!parent) return;

      // Only enhance if it hasn't been processed yet
      if (parent.classList.contains('iframe-wrap')) return;

      // Wrap in .iframe-wrap if not already
      const wrapper = document.createElement('div');
      wrapper.className = 'iframe-wrap';
      // Copy inline styles we care about (height)
      const parentStyle = parent.getAttribute('style') || '';
      const heightMatch = parentStyle.match(/height\s*:\s*([^;]+)/i);
      if (heightMatch) wrapper.style.height = heightMatch[1].trim();

      parent.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);

      // Build loader overlay
      const loader = document.createElement('div');
      loader.className = 'iframe-loader';
      loader.innerHTML = `
        <div class="iframe-spinner" aria-hidden="true"></div>
        <p class="iframe-loader-text">Loading AR demo…</p>
      `;
      wrapper.appendChild(loader);

      // Fade in iframe and hide loader on load
      iframe.addEventListener('load', () => {
        iframe.classList.add('loaded');
        loader.classList.add('hidden');
        // Remove loader from DOM after transition
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      });

      // If reduced motion, skip animation
      if (prefersReducedMotion) {
        iframe.classList.add('loaded');
        loader.remove();
      }
    });
  }

  // ---------------------------
  // Subtle parallax on hero card
  // ---------------------------
  function initParallax() {
    if (prefersReducedMotion) return;
    const heroCard = $('.hero .heroCard');
    if (!heroCard) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      raf(() => {
        const scrollY = window.scrollY;
        // Subtle: moves 20% of scroll offset upward
        heroCard.style.transform = `translateY(${scrollY * 0.06}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------------------------
  // Dropdown Menu (keyboard-accessible)
  // ---------------------------
  function initDropdownMenu() {
    // Support multiple dropdowns on the page
    $$('.dropdown-trigger').forEach(trigger => {
      const navItem     = trigger.closest('.nav-item');
      const dropdownMenu = navItem && navItem.querySelector('.dropdown-menu');
      if (!navItem || !dropdownMenu) return;

      // ARIA
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      // Create overlay (only once)
      let overlay = $('.dropdown-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'dropdown-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(overlay);
      }

      function openDropdown() {
        closeAllDropdowns();
        dropdownMenu.classList.add('show');
        overlay.classList.add('show');
        trigger.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        // Focus first item
        const firstItem = $('[role="menuitem"], a, button', dropdownMenu);
        if (firstItem) firstItem.focus();
      }

      function closeDropdown() {
        dropdownMenu.classList.remove('show');
        overlay.classList.remove('show');
        trigger.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      }

      // Add menu roles for screen readers
      dropdownMenu.setAttribute('role', 'menu');
      $$('.dropdown-item', dropdownMenu).forEach(item => {
        item.setAttribute('role', 'menuitem');
      });

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('show');
        if (isOpen) closeDropdown();
        else openDropdown();
      });

      // Keyboard: Enter / Space open; Arrow keys navigate items
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown();
        }
      });

      // Arrow key navigation within dropdown
      dropdownMenu.addEventListener('keydown', (e) => {
        const items = $$('[role="menuitem"]', dropdownMenu).filter(el => el.offsetParent !== null);
        const idx   = items.indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          (items[idx + 1] || items[0]).focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          (items[idx - 1] || items[items.length - 1]).focus();
        } else if (e.key === 'Escape') {
          closeDropdown();
          trigger.focus();
        } else if (e.key === 'Tab') {
          closeDropdown();
        }
      });

      overlay.addEventListener('click', closeAllDropdowns);

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!navItem.contains(e.target)) closeDropdown();
      });

      // Handle dropdown items (hash links → smooth scroll)
      $$('.dropdown-item', dropdownMenu).forEach(item => {
        item.addEventListener('click', (e) => {
          const targetId = item.getAttribute('href');
          if (targetId && targetId.startsWith('#') && targetId.length > 1) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              closeAllDropdowns();
              targetEl.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
              });
              history.pushState(null, '', targetId);
              return;
            }
          }
          closeAllDropdowns();
        });
      });
    });
  }

  function closeAllDropdowns() {
    $$('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
    $$('.dropdown-overlay.show').forEach(ov  => ov.classList.remove('show'));
    $$('.dropdown-trigger.active').forEach(t  => {
      t.classList.remove('active');
      t.setAttribute('aria-expanded', 'false');
    });
  }

  // ---------------------------
  // Form: inline success / error feedback
  // ---------------------------
  function initFormFeedback() {
    const form       = $('#demoForm');
    const statusEl   = $('#formStatus');
    if (!form || !statusEl) return;

    form.addEventListener('submit', async (e) => {
      // Formspree handles real submission; we enhance UX here
      const submitBtn = $('[type="submit"]', form);
      if (submitBtn) {
        submitBtn.disabled = true;
        const span = submitBtn.querySelector('span');
        if (span) span.textContent = 'Sending…';
      }

      // Allow Formspree's default submission — but show feedback after
      // We listen for the fetch-based approach if JS is in control
      // For standard form POST we can't intercept easily without fetch,
      // so we attach a fetch-based handler:
      e.preventDefault();

      const data = new FormData(form);

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          statusEl.textContent = '✓ Sent! We'll be in touch within 1 business day.';
          statusEl.setAttribute('data-state', 'success');
          form.reset();
        } else {
          throw new Error('non-ok response');
        }
      } catch {
        statusEl.textContent = '✗ Something went wrong. Try emailing contact@prime-rig.com directly.';
        statusEl.setAttribute('data-state', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          const span = submitBtn.querySelector('span');
          if (span) span.textContent = 'Send Request';
        }
      }
    });
  }

  // ---------------------------
  // Apply reveal-stagger to industry grid
  // ---------------------------
  function initGridStagger() {
    // Add reveal-stagger to .grid-3 containers so children animate in sequence
    $$('.grid-3').forEach(grid => {
      grid.classList.add('reveal-stagger');
    });
  }

  // ---------------------------
  // Initialize
  // ---------------------------
  function init() {
    initStaggeredCards();
    initScrollProgress();
    initIframeLoaders();
    initGridStagger();
    if (!prefersReducedMotion) initParallax();
    initDropdownMenu();
    initFormFeedback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
