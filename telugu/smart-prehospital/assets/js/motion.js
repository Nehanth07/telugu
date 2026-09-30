/* =====================================================================
   SMART PREHOSPITAL CARE — Shared motion engine
   Lenis smooth scroll + IntersectionObserver reveals + scroll parallax
   + counters + nav + shared header/footer injection + page transitions.
   Dependencies (loaded via CDN in each page):
     - Lenis  (@studio-freight/lenis)
     - GSAP + ScrollTrigger (optional; falls back to IO/rAF if absent)
   ===================================================================== */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PAGES = [
    { href: "index.html",       label: "Home" },
    { href: "crisis.html",      label: "The Crisis" },
    { href: "capabilities.html",label: "Capabilities" },
    { href: "solution.html",    label: "The Solution" },
    { href: "opportunity.html", label: "Opportunity" },
  ];

  /* ---------------- Shared header + footer + transition panel ---------- */
  function currentFile() {
    const p = location.pathname.split("/").pop();
    return p && p.length ? p : "index.html";
  }

  function injectChrome() {
    const here = currentFile();

    // Transition panel
    if (!document.querySelector(".transition-panel")) {
      const tp = document.createElement("div");
      tp.className = "transition-panel";
      tp.innerHTML = '<span class="tp-word">Smart Care</span>';
      document.body.appendChild(tp);
    }

    // NAV
    if (!document.querySelector(".nav")) {
      const nav = document.createElement("header");
      nav.className = "nav";
      nav.innerHTML = `
        <a class="brand" href="index.html" data-link>
          <span class="cross"></span> SMART<span class="accent">MEDIC</span>
        </a>
        <nav class="nav-links desktop">
          ${PAGES.map(p => `<a href="${p.href}" data-link class="${p.href === here ? "active" : ""}">${p.label}</a>`).join("")}
          <a class="btn nav-cta" href="opportunity.html#contact" data-link>Partner With Us <span class="arrow">&rarr;</span></a>
        </nav>
        <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>`;
      document.body.appendChild(nav);
    }

    // Overlay menu
    if (!document.querySelector(".menu")) {
      const menu = document.createElement("nav");
      menu.className = "menu";
      menu.innerHTML = PAGES.map((p, i) =>
        `<a href="${p.href}" data-link><span class="menu-index">0${i + 1}</span>${p.label}</a>`
      ).join("");
      document.body.appendChild(menu);
    }

    // FOOTER
    if (!document.querySelector(".footer")) {
      const f = document.createElement("footer");
      f.className = "footer";
      f.innerHTML = `
        <div class="wrap">
          <div class="footer-cta reveal" data-reveal>
            From <span class="accent">last resort</span><br>to must-have.
          </div>
          <div class="footer-grid">
            <div>
              <h4>Smart Medic</h4>
              <p class="muted">Tech-driven, responsive, high-quality prehospital care. Reimagining the ambulance as an intelligent mobility platform.</p>
            </div>
            <div>
              <h4>Navigate</h4>
              ${PAGES.map(p => `<a href="${p.href}" data-link>${p.label}</a><br>`).join("")}
            </div>
            <div>
              <h4>Connect</h4>
              <a href="opportunity.html#contact" data-link>Partner With Us</a><br>
              <a href="mailto:care@smartmedic.health">care@smartmedic.health</a><br>
              <p class="muted">Universal Access: 1‑0‑8‑SMART</p>
            </div>
          </div>
          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} Smart Medic EMS</span>
            <span>Predictive · Insured · Life-first</span>
          </div>
        </div>`;
      document.body.appendChild(f);
    }

    wireNav();
  }

  function wireNav() {
    const nav = document.querySelector(".nav");
    const burger = document.querySelector(".burger");
    const menu = document.querySelector(".menu");

    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (burger && menu) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        menu.classList.toggle("open");
        document.documentElement.classList.toggle("lenis-stopped");
      });
      menu.querySelectorAll("a").forEach(a =>
        a.addEventListener("click", () => {
          burger.classList.remove("open");
          menu.classList.remove("open");
        })
      );
    }
  }

  /* ---------------- Page transitions ---------------- */
  function wireTransitions() {
    const panel = document.querySelector(".transition-panel");
    const word = panel && panel.querySelector(".tp-word");

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-link]");
      if (!a) return;
      const url = a.getAttribute("href");
      if (!url || url.startsWith("#") || url.startsWith("mailto")) return;

      // same page anchor
      const [file, hash] = url.split("#");
      if (file === currentFile() && hash) return; // let default anchor jump

      e.preventDefault();
      if (reduced || !panel) { location.href = url; return; }

      word.textContent = a.textContent.trim().replace(/[→]/g, "") || "Smart Care";
      panel.animate(
        [{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }],
        { duration: 620, easing: "cubic-bezier(0.77,0,0.175,1)", fill: "forwards" }
      );
      word.animate(
        [{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 500, delay: 200, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      );
      setTimeout(() => { location.href = url; }, 640);
    });

    // Incoming reveal: panel starts covering, slides away
    if (panel && !reduced && sessionStorage.getItem("nav") === "1") {
      panel.style.transform = "translateX(0%)";
      requestAnimationFrame(() => {
        panel.animate(
          [{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }],
          { duration: 700, easing: "cubic-bezier(0.77,0,0.175,1)", fill: "forwards" }
        );
      });
    }
    window.addEventListener("pagehide", () => sessionStorage.setItem("nav", "1"));
    window.addEventListener("pageshow", () => setTimeout(() => sessionStorage.removeItem("nav"), 800));
  }

  /* ---------------- Word splitting for reveal ---------------- */
  function splitReveal(el) {
    if (el.dataset.split === "1") return;
    el.dataset.split = "1";
    el.classList.add("reveal");
    const walk = (node) => {
      const kids = Array.from(node.childNodes);
      kids.forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (tok.trim() === "") { frag.appendChild(document.createTextNode(tok)); return; }
            const w = document.createElement("span");
            w.className = "word";
            const inner = document.createElement("span");
            inner.textContent = tok;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          walk(n);
        }
      });
    };
    walk(el);
    // stagger
    el.querySelectorAll(".word > span").forEach((s, i) => {
      s.style.transitionDelay = (i * 0.045) + "s";
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveals() {
    const revealEls = document.querySelectorAll("[data-reveal]");
    revealEls.forEach(splitReveal);
    const fadeEls = document.querySelectorAll("[data-fade]");
    fadeEls.forEach(el => el.classList.add("fade-up"));
    const zoomEls = document.querySelectorAll(".zoom-frame");

    if (reduced) {
      revealEls.forEach(el => el.classList.add("in"));
      fadeEls.forEach(el => el.classList.add("in"));
      zoomEls.forEach(el => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(el => io.observe(el));
    fadeEls.forEach(el => io.observe(el));

    const zio = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("in"); });
    }, { threshold: 0.2 });
    zoomEls.forEach(el => zio.observe(el));
  }

  /* ---------------- Counters ---------------- */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.dec ? parseInt(el.dataset.dec) : 0);
      const dur = 1600, t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      };
      requestAnimationFrame(step);
    };
    if (reduced) { els.forEach(el => el.textContent = parseFloat(el.dataset.count).toFixed(el.dataset.dec || 0)); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach(el => io.observe(el));
  }

  /* ---------------- Parallax + Lenis ---------------- */
  function initSmoothAndParallax() {
    const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
    const applyParallax = (scroll) => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
      });
    };

    if (reduced || typeof Lenis === "undefined") {
      window.addEventListener("scroll", () => applyParallax(window.scrollY), { passive: true });
      applyParallax(0);
      return;
    }

    const lenis = new Lenis({ duration: 1.15, lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;

    if (typeof gsap !== "undefined" && gsap.ticker) {
      lenis.on("scroll", () => { if (window.ScrollTrigger) ScrollTrigger.update(); applyParallax(); });
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); applyParallax(); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    injectChrome();
    initReveals();
    initCounters();
    initSmoothAndParallax();
    wireTransitions();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
