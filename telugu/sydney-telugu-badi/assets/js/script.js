/* =====================================================================
   TELUGU BADI — Sydney  ·  interactions
   Loader · cursor · sticky header · mobile menu · floating aksharalu ·
   counters · interactive vowel flip-cards · scroll reveals.
   ===================================================================== */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  function runLoader() {
    if (!loader) return done();
    let v = 0;
    (function step() {
      v = Math.min(100, v + Math.random() * 20 + 8);
      if (fill) fill.style.width = v + '%';
      if (v < 100) setTimeout(step, 90);
      else setTimeout(done, 350);
    })();
  }
  function done() {
    document.body.classList.remove('is-loading');
    if (loader) loader.classList.add('is-done');
  }

  /* ---------- Sticky header ---------- */
  const head = document.getElementById('head');
  const onScroll = () => head && head.classList.toggle('is-stuck', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  if (burger) {
    const close = () => { document.body.classList.remove('is-menu-open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('is-menu-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.menu a').forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- Floating aksharalu in hero ---------- */
  const heroLetters = document.getElementById('heroAksharalu');
  if (heroLetters && !reduce) {
    const glyphs = ['అ', 'ఆ', 'క', 'మ', 'తె', 'లు', 'గు', 'ప', 'డి', 'శ్రీ', 'ఇ', 'ఉ'];
    const colors = ['#ff8a00', '#00b5a5', '#ff4d8d', '#7a5cff', '#22b573', '#ffc233'];
    glyphs.forEach((g, i) => {
      const s = document.createElement('span');
      s.textContent = g;
      s.style.left = (6 + Math.random() * 88) + '%';
      s.style.top = (2 + Math.random() * 92) + '%';
      s.style.fontSize = (1.6 + Math.random() * 2.6) + 'rem';
      s.style.color = colors[i % colors.length];
      s.style.setProperty('--r', (Math.random() * 30 - 15) + 'deg');
      s.style.animationDelay = (Math.random() * 4) + 's';
      s.style.animationDuration = (5.5 + Math.random() * 4) + 's';
      s.style.opacity = 0.35 + Math.random() * 0.4;
      heroLetters.appendChild(s);
    });
  }

  /* ---------- Interactive vowel flip-cards ---------- */
  const learnGrid = document.getElementById('learnGrid');
  if (learnGrid) {
    const vowels = [
      { te: 'అ', rom: 'a', ex: 'అమ్మ · amma (mother)', c: '#ff8a00' },
      { te: 'ఆ', rom: 'aa', ex: 'ఆవు · aavu (cow)', c: '#00b5a5' },
      { te: 'ఇ', rom: 'i', ex: 'ఇల్లు · illu (house)', c: '#ff4d8d' },
      { te: 'ఈ', rom: 'ii', ex: 'ఈగ · eega (fly)', c: '#7a5cff' },
      { te: 'ఉ', rom: 'u', ex: 'ఉడుత · uduta (squirrel)', c: '#22b573' },
      { te: 'ఊ', rom: 'uu', ex: 'ఊయల · ooyala (cradle)', c: '#ffb300' },
      { te: 'ఎ', rom: 'e', ex: 'ఎలుక · eluka (mouse)', c: '#ff5d8f' },
      { te: 'ఏ', rom: 'ee', ex: 'ఏనుగు · enugu (elephant)', c: '#0fb2a1' },
      { te: 'ఐ', rom: 'ai', ex: 'ఐదు · aidu (five)', c: '#7a5cff' },
      { te: 'ఒ', rom: 'o', ex: 'ఒంటె · onte (camel)', c: '#ff8a00' },
      { te: 'ఓ', rom: 'oo', ex: 'ఓడ · ooda (ship)', c: '#00b5a5' },
      { te: 'ఔ', rom: 'au', ex: 'ఔషధం · aushadham (medicine)', c: '#ff4d8d' },
    ];
    const canSpeak = 'speechSynthesis' in window;
    vowels.forEach((v) => {
      const card = document.createElement('button');
      card.className = 'aksh';
      card.style.setProperty('--c', v.c);
      card.setAttribute('aria-label', 'Telugu letter ' + v.rom);
      card.innerHTML =
        '<span class="aksh__inner">' +
        '<span class="aksh__face aksh__front"><b>' + v.te + '</b></span>' +
        '<span class="aksh__face aksh__back"><b>' + v.rom + '</b><small>' + v.ex + '</small></span>' +
        '</span>';
      card.addEventListener('click', () => {
        card.classList.toggle('is-flip');
        if (canSpeak) {
          try {
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(v.te);
            u.lang = 'te-IN'; u.rate = 0.85;
            speechSynthesis.speak(u);
          } catch (e) {}
        }
      });
      learnGrid.appendChild(card);
    });
  }

  /* ---------- Count-up ---------- */
  function countUp(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    const dur = 1500, t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- Scroll reveals + counters ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll && e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.16 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    document.querySelectorAll('.stat').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll('[data-count]').forEach(countUp);
  }

  /* ---------- Init ---------- */
  addEventListener('load', runLoader);
  if (document.readyState === 'complete') runLoader();
})();
