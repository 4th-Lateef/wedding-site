// ============================================================
// WEDDING SITE — main.js
// ============================================================

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

let currentPage = 0;

function getPerView() {
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1000) return 2;
  return 4;
}

function updateCarousel() {
  const cards = Array.from(wishesTrack.children).filter(c => c.classList.contains('wish-card'));
  const wrap = document.querySelector('.wishes-carousel-wrap');
  const perView = getPerView();
  const gap = 20;
  const containerWidth = wrap.querySelector('.wishes-carousel').clientWidth;
  const cardWidth = (containerWidth - gap * (perView - 1)) / perView;

  cards.forEach(c => { c.style.width = cardWidth + 'px'; });

  const totalPages = Math.max(1, Math.ceil(cards.length / perView));
  currentPage = Math.min(currentPage, totalPages - 1);
  const pageWidth = (cardWidth + gap) * perView;
  wishesTrack.style.transform = `translateX(-${currentPage * pageWidth}px)`;

  // Dots
  wishesDots.innerHTML = '';
  if (totalPages > 1) {
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'wishes-dot' + (i === currentPage ? ' active' : '');
      dot.setAttribute('aria-label', `Go to wishes page ${i + 1}`);
      dot.addEventListener('click', () => { currentPage = i; updateCarousel(); });
      wishesDots.appendChild(dot);
    }
  }

  // Arrows
  wishesPrev.disabled = currentPage === 0;
  wishesNext.disabled = currentPage >= totalPages - 1;
  const showControls = cards.length > perView;
  wishesPrev.style.visibility = showControls ? 'visible' : 'hidden';
  wishesNext.style.visibility = showControls ? 'visible' : 'hidden';
}

wishesPrev?.addEventListener('click', () => { currentPage = Math.max(0, currentPage - 1); updateCarousel(); });
wishesNext?.addEventListener('click', () => { currentPage += 1; updateCarousel(); });
window.addEventListener('resize', () => updateCarousel());

function renderWish(name, message) {
  if (wishesEmpty) wishesEmpty.remove();
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
  wishesTrack.prepend(card);
  currentPage = 0; // jump to first page so the newest wish is visible
  updateCarousel();
}

async function loadWishes() {
  if (!supabaseClient) { updateCarousel(); return; } // No backend configured yet — form still works locally below.
  const { data, error } = await supabaseClient
    .from('wishes')
    .select('name, message')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) { console.error(error); updateCarousel(); return; }
  if (data && data.length) {
    wishesEmpty?.remove();
    data.forEach(w => renderWish(w.name, w.message));
  } else {
    updateCarousel();
  }
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
