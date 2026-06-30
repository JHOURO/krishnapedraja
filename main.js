/* ═══════════════════════════════════════════════════════
   KRISHNA PEDRAJA — Global JS v3
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Cursor ── */
  const cur = document.getElementById('cursor');
  if (cur && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px';
      cur.style.top  = e.clientY + 'px';
    });
    const bindCursor = () => {
      document.querySelectorAll('a,button,.project-card,.skill-tile,.gallery-lightbox,.photo-strip-item').forEach(el => {
        el.addEventListener('mouseenter', () => cur.classList.add('hover'));
        el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
      });
    };
    bindCursor();
    window._rebindCursor = bindCursor;
  }

  /* ── Sticky nav ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav ── */
  const burger = document.querySelector('.nav-burger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = +(e.target.dataset.delay || 0);
          setTimeout(() => e.target.classList.add('visible'), delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(el => obs.observe(el));
  }

  /* ── Active nav link ── */
  const path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ── LIGHTBOX (gallery images only, NOT poster cards) ── */
  initLightbox();
});

function initLightbox() {
  /* Only these containers are lightbox-eligible:
     .gallery-lightbox, .photo-strip-item, .gallery-item
     Explicitly excluded: .pcard, .hcard (movie posters) */
  const SELECTOR = '.gallery-lightbox, .photo-strip-item[data-lightbox], .gallery-item[data-lightbox]';

  let overlay = document.getElementById('ksp-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'ksp-lightbox';
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <button class="lightbox-close" id="lb-close" aria-label="Close">✕</button>
      <button class="lightbox-nav lightbox-prev" id="lb-prev" aria-label="Previous">←</button>
      <div class="lightbox-inner"><img id="lb-img" src="" alt=""/></div>
      <button class="lightbox-nav lightbox-next" id="lb-next" aria-label="Next">→</button>
      <div class="lightbox-counter" id="lb-counter"></div>
    `;
    document.body.appendChild(overlay);
  }

  const lbImg     = document.getElementById('lb-img');
  const lbCounter = document.getElementById('lb-counter');
  let images = [];
  let current = 0;

  function collect() {
    images = Array.from(document.querySelectorAll(SELECTOR));
  }

  function openAt(idx) {
    collect();
    if (!images.length) return;
    current = ((idx % images.length) + images.length) % images.length;
    const el = images[current];
    const src = el.dataset.lightbox || el.querySelector('img')?.src || '';
    lbImg.src = src;
    lbCounter.textContent = `${current + 1} / ${images.length}`;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  /* Delegated click — only match gallery-eligible elements */
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.gallery-lightbox, .photo-strip-item[data-lightbox], .gallery-item[data-lightbox]');
    if (!trigger) return;
    e.preventDefault();
    collect();
    openAt(images.indexOf(trigger));
  });

  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', () => openAt(current - 1));
  document.getElementById('lb-next').addEventListener('click', () => openAt(current + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  openAt(current - 1);
    if (e.key === 'ArrowRight') openAt(current + 1);
  });
}

/* ══ PARALLAX: gallery + photo-strip images ═══════════════ */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = document.querySelectorAll('.gallery-item img, .photo-strip-item img, .about-strip-img img');
  if (!items.length) return;
  const onScroll = () => {
    items.forEach(img => {
      const wrap = img.closest('.gallery-item, .photo-strip-item, .about-strip-img');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const offset = ((rect.top + rect.height / 2) - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = `scale(1.08) translateY(${offset * 18}px)`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══ PAGE EXIT FADE ════════════════════════════════════════ */
document.querySelectorAll('a[href]').forEach(a => {
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
  a.addEventListener('click', e => {
    e.preventDefault();
    document.body.style.transition = 'opacity .25s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 240);
  });
});

/* ══ IMAGE FALLBACK: if local image fails, load from CDN ══ */
(function(){
  const CDN = {
    'images/2.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/2.png?fit=727%2C1024&ssl=1',
    'images/4.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/4.png?fit=727%2C1024&ssl=1',
    'images/5.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/5.png?fit=727%2C1024&ssl=1',
    'images/6.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/6.png?fit=1454%2C2048&ssl=1',
    'images/7.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/7.png?fit=727%2C1024&ssl=1',
    'images/8.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/8.png?fit=1454%2C2048&ssl=1',
    'images/9.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/9.png?fit=727%2C1024&ssl=1',
    'images/10-1.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/10-1.png?fit=727%2C1024&ssl=1',
    'images/11.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/11.png?fit=727%2C1024&ssl=1',
    'images/12.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/12.png?fit=727%2C1024&ssl=1',
    'images/13.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/13.png?fit=1454%2C2048&ssl=1',
    'images/14.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/14.png?fit=727%2C1024&ssl=1',
    'images/15.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/15.png?fit=727%2C1024&ssl=1',
    'images/FRAZZLED.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/FRAZZLED.png?fit=727%2C1024&ssl=1',
    'images/surprise.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2026/01/surprise.png?fit=1454%2C2048&ssl=1',
    'images/9974e88ee79ceb2bfebe1d34f942420e.jpeg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/9974e88ee79ceb2bfebe1d34f942420e.jpeg?fit=2048%2C1365&ssl=1',
    'images/c0a37ff7bb656787b488221c70d09941.jpeg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/c0a37ff7bb656787b488221c70d09941.jpeg?fit=2048%2C1365&ssl=1',
    'images/503cffe60a2d11a69060a751d0ef74aa.jpeg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/503cffe60a2d11a69060a751d0ef74aa.jpeg?fit=2048%2C1152&ssl=1',
    'images/24d176b77cd2861d897d83abcb032b17.jpeg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/24d176b77cd2861d897d83abcb032b17.jpeg?fit=1365%2C2048&ssl=1',
    'images/DSC04513.jpg': 'images/DSC04513.jpg',
    'images/DSC04524.jpg': 'images/DSC04524.jpg',
    'images/DSC01416.jpg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/DSC01416.jpg?ssl=1',
    'images/DSC01418.jpg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/DSC01418.jpg?ssl=1',
    'images/DSC07389-scaled.jpg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/DSC07389-scaled.jpg?fit=2560%2C1707&ssl=1',
    'images/DSC07422-scaled.jpg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/DSC07422-scaled.jpg?fit=1707%2C2560&ssl=1',
    'images/DSC07538-scaled.jpg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/DSC07538-scaled.jpg?fit=2560%2C1707&ssl=1',
    'images/WhatsApp-Image-2024-03-15-at-7.15.10-PM-554.jpeg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/WhatsApp-Image-2024-03-15-at-7.15.10-PM-554.jpeg?fit=1600%2C1200&ssl=1',
    'images/Imagen-de-WhatsApp-2024-12-07-a-las-12.19.09_49e0918a.jpg': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/Imagen-de-WhatsApp-2024-12-07-a-las-12.19.09_49e0918a.jpg?fit=682%2C1024&ssl=1',
    'images/MM-C.png':  'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/MM-C.png?fit=500%2C500&ssl=1',
    'images/AVG-C.png': 'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/AVG-C.png?fit=1404%2C1404&ssl=1',
    'images/PR-C.png':  'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/PR-C.png?fit=300%2C300&ssl=1',
    'images/AE-C.png':  'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/AE-C.png?fit=1200%2C1170&ssl=1',
    'images/PT-C.png':  'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/PT-C.png?fit=360%2C360&ssl=1',
    'images/BDS.png':   'https://i0.wp.com/krishnapedraja.com/wp-content/uploads/2024/12/BDS.png?fit=4096%2C4096&ssl=1',
  };

  function fallback(img) {
    const src = img.getAttribute('src');
    if (src && CDN[src]) {
      img.removeEventListener('error', img._fbHandler);
      img.src = CDN[src];
      // Also fix data-lightbox on parent
      const p = img.closest('[data-lightbox]');
      if (p && CDN[p.dataset.lightbox]) p.dataset.lightbox = CDN[p.dataset.lightbox];
    }
  }

  // Attach to all images immediately and on DOMContentLoaded
  function attach() {
    document.querySelectorAll('img[src^="images/"]').forEach(img => {
      img._fbHandler = () => fallback(img);
      img.addEventListener('error', img._fbHandler);
      // If already broken (cached error), trigger now
      if (img.complete && img.naturalWidth === 0) fallback(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
