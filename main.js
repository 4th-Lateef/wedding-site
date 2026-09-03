// ============================================================
// WEDDING SITE — main.js
// ============================================================
// ============================================================
// SCROLL REVEAL — fade/slide elements into view as you scroll
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    } else {
      entry.target.classList.remove('in-view');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

function observeReveal(el, delay = 0) {
  el.classList.add('reveal');
  el.style.setProperty('--reveal-delay', `${delay}s`);
  revealObserver.observe(el);
}

// Reveal grouped items (cards in a grid/list) with a gentle stagger
function revealGroup(selector, stagger = 0.08) {
  document.querySelectorAll(selector).forEach(group => {
    Array.from(group.children).forEach((el, i) => observeReveal(el, i * stagger));
  });
}

// Reveal standalone elements (headings, single blocks) with no stagger
function revealEach(selector) {
  document.querySelectorAll(selector).forEach(el => observeReveal(el));
}

revealGroup('.timeline');
revealGroup('.couple-grid');
revealGroup('.details-grid');
revealGroup('.menu-grid');
revealGroup('#galleryGrid');
revealGroup('.party-grid');
revealGroup('.programme-list', 0.06);
revealGroup('.rsvp-grid');

revealEach('.section .eyebrow, .section .section-title, .section-sub');
revealEach('.story-text, .guestbook-form, .directions-info, .map-embed');

// ---------- Smooth scroll for in-page anchor links ----------
function smoothScrollTo(targetY) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(1800, Math.max(900, Math.abs(distance) * 1.1));
  const startTime = performance.now();

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuad(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navHeight = document.getElementById('siteNav')?.offsetHeight || 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
    smoothScrollTo(targetY);
  });
});

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---------- Countdown timer ----------
(function countdown() {
  const el = document.getElementById('countdown-timer');
  if (!el) return;
  const weddingDate = new Date(el.dataset.weddingDate).getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();

// ---------- Gallery filter ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hidden', !show);
    });
  });
});

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

galleryItems.forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
  });
});
function closeLightbox() { lightbox.classList.remove('open'); lightboxImg.src = ''; }
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// ============================================================
// GUESTBOOK — Supabase integration
//
// SETUP INSTRUCTIONS (see README.md for the full walkthrough):
// 1. Create a free project at https://supabase.com
// 2. In the SQL editor, run:
//      create table wishes (
//        id uuid default gen_random_uuid() primary key,
//        name text not null,
//        message text not null,
//        created_at timestamp with time zone default now()
//      );
//    alter table wishes enable row level security;
//    create policy "Public read" on wishes for select using (true);
//    create policy "Public insert" on wishes for insert with check (true);
// 3. Copy your Project URL and anon public key from
//    Project Settings > API, and paste them below.
// 4. Add this script tag ABOVE this file in index.html:
//    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ============================================================

const SUPABASE_URL = 'https://cyozplmtpemuwqtnavec.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-3fUSsjqrv1bXOJVoJyNeg_-PHkqAcJ';

let supabaseClient = null;
if (window.supabase && SUPABASE_URL.startsWith('http')) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const guestbookForm = document.getElementById('guestbookForm');
const gbStatus = document.getElementById('gbStatus');
const wishesTrack = document.getElementById('wishesTrack');
const wishesEmpty = document.getElementById('wishesEmpty');
const wishesDots = document.getElementById('wishesDots');
const wishesPrev = document.getElementById('wishesPrev');
const wishesNext = document.getElementById('wishesNext');

let wishesData = [];
let currentPage = 0;
const WISHES_PER_PAGE = 4;

function buildWishCard(name, message) {
  const card = document.createElement('div');
  card.className = 'wish-card';
  const nameEl = document.createElement('p');
  nameEl.className = 'wish-name';
  nameEl.textContent = name;
  const msgEl = document.createElement('p');
  msgEl.className = 'wish-message';
  msgEl.textContent = message;
  card.appendChild(nameEl);
  card.appendChild(msgEl);
  return card;
}

function renderWishesCarousel() {
  wishesTrack.innerHTML = '';

  if (wishesData.length === 0) {
    if (wishesEmpty) wishesTrack.appendChild(wishesEmpty);
    wishesTrack.style.transform = 'translateX(0)';
    wishesDots.innerHTML = '';
    wishesPrev.style.visibility = 'hidden';
    wishesNext.style.visibility = 'hidden';
    return;
  }

  const totalPages = Math.ceil(wishesData.length / WISHES_PER_PAGE);
  currentPage = Math.min(currentPage, totalPages - 1);

  for (let p = 0; p < totalPages; p++) {
    const pageEl = document.createElement('div');
    pageEl.className = 'wishes-page';
    const grid = document.createElement('div');
    grid.className = 'wishes-page-grid';
    wishesData
      .slice(p * WISHES_PER_PAGE, p * WISHES_PER_PAGE + WISHES_PER_PAGE)
      .forEach(w => grid.appendChild(buildWishCard(w.name, w.message)));
    pageEl.appendChild(grid);
    wishesTrack.appendChild(pageEl);
  }

  wishesTrack.style.transform = `translateX(-${currentPage * 100}%)`;

  wishesDots.innerHTML = '';
  if (totalPages > 1) {
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'wishes-dot' + (i === currentPage ? ' active' : '');
      dot.setAttribute('aria-label', `Go to wishes page ${i + 1}`);
      dot.addEventListener('click', () => { currentPage = i; renderWishesCarousel(); });
      wishesDots.appendChild(dot);
    }
  }

  wishesPrev.disabled = currentPage === 0;
  wishesNext.disabled = currentPage >= totalPages - 1;
  const showControls = totalPages > 1;
  wishesPrev.style.visibility = showControls ? 'visible' : 'hidden';
  wishesNext.style.visibility = showControls ? 'visible' : 'hidden';
}

wishesPrev?.addEventListener('click', () => {
  currentPage = Math.max(0, currentPage - 1);
  renderWishesCarousel();
});
wishesNext?.addEventListener('click', () => {
  const totalPages = Math.ceil(wishesData.length / WISHES_PER_PAGE);
  currentPage = Math.min(totalPages - 1, currentPage + 1);
  renderWishesCarousel();
});

function renderWish(name, message) {
  wishesData.unshift({ name, message });
  currentPage = 0; // jump to first page so the newest wish is visible
  renderWishesCarousel();
}

async function loadWishes() {
  if (!supabaseClient) { renderWishesCarousel(); return; } // No backend configured yet — form still works locally below.
  const { data, error } = await supabaseClient
    .from('wishes')
    .select('name, message')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error(error); renderWishesCarousel(); return; }
  wishesData = data || [];
  renderWishesCarousel();
}
loadWishes();

guestbookForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('gbName').value.trim();
  const message = document.getElementById('gbMessage').value.trim();
  if (!name || !message) return;

  gbStatus.textContent = 'Sending your wish...';

  if (supabaseClient) {
    const { error } = await supabaseClient.from('wishes').insert([{ name, message }]);
    if (error) {
      gbStatus.textContent = "Something went wrong. Please try again.";
      console.error(error);
      return;
    }
  }

  // Show it immediately regardless of backend, for instant feedback
  renderWish(name, message);
  gbStatus.textContent = 'Thank you for your wish! 💛';
  guestbookForm.reset();
  setTimeout(() => { gbStatus.textContent = ''; }, 4000);
});

// ---------- Sticky nav shadow on scroll (subtle polish) ----------
const siteNav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    siteNav.style.boxShadow = '0 4px 20px rgba(58,50,44,0.06)';
  } else {
    siteNav.style.boxShadow = 'none';
  }
});
