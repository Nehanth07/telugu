/* =====================================================================
   TeluguBadi — Shared sub-page motion engine
   Lenis smooth scroll + dramatic word reveals + counters + page
   transitions + viewport recalibration. Ported from smart-prehospital.
   ===================================================================== */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Viewport recalibration (any aspect ratio) ---------- */
  function setViewportUnits() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    const w = vv ? vv.width : window.innerWidth;
    document.documentElement.style.setProperty("--vh", h * 0.01 + "px");
    document.documentElement.style.setProperty("--vw", w * 0.01 + "px");
  }
  setViewportUnits();
  window.addEventListener("resize", setViewportUnits, { passive: true });
  window.addEventListener("orientationchange", setViewportUnits);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", setViewportUnits);

  /* ---------- Dramatic word split ---------- */
  function splitReveal(el) {
    if (el.dataset.split === "1") return;
    el.dataset.split = "1";
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (tok.trim() === "") { frag.appendChild(document.createTextNode(tok)); return; }
            const w = document.createElement("span"); w.className = "word";
            const inner = document.createElement("span"); inner.textContent = tok;
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          walk(n);
        }
      });
    };
    walk(el);
    // Dramatic stagger
    el.querySelectorAll(".word > span").forEach((s, i) => {
      s.style.transitionDelay = (i * 0.06) + "s";
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    const revealEls = document.querySelectorAll("[data-reveal]");
    revealEls.forEach(splitReveal);
    const fadeEls = document.querySelectorAll(".fade");

    if (reduced) {
      revealEls.forEach((el) => el.classList.add("in"));
      fadeEls.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });

    revealEls.forEach((el) => io.observe(el));
    fadeEls.forEach((el) => io.observe(el));
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = el.dataset.dec ? parseInt(el.dataset.dec) : 0;
      const suffix = el.dataset.suffix || "";
      const dur = 1600, t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec) + suffix;
      };
      requestAnimationFrame(step);
    };
    if (reduced) { els.forEach((el) => el.textContent = parseFloat(el.dataset.count).toFixed(el.dataset.dec || 0) + (el.dataset.suffix || "")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Lenis smooth scroll ---------- */
  function initSmooth() {
    if (reduced || typeof Lenis === "undefined") return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: true, touchMultiplier: 1.8 });
    window.__lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---------- Page transitions ---------- */
  function wireTransitions() {
    const panel = document.querySelector(".transition-panel");
    const word = panel && panel.querySelector(".tp-word");
    const currentFile = () => location.pathname.split("/").pop() || "index.html";

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-link]");
      if (!a) return;
      const url = a.getAttribute("href");
      if (!url || url.startsWith("#") || url.startsWith("mailto")) return;
      const [file, hash] = url.split("#");
      if (file === currentFile() && hash) return;
      e.preventDefault();
      if (reduced || !panel) { location.href = url; return; }
      panel.animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], { duration: 620, easing: "cubic-bezier(0.77,0,0.175,1)", fill: "forwards" });
      word.animate([{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 500, delay: 200, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" });
      setTimeout(() => { location.href = url; }, 640);
    });

    if (panel && !reduced && sessionStorage.getItem("tb-nav") === "1") {
      panel.style.transform = "translateX(0%)";
      requestAnimationFrame(() => {
        panel.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], { duration: 700, easing: "cubic-bezier(0.77,0,0.175,1)", fill: "forwards" });
      });
    }
    window.addEventListener("pagehide", () => sessionStorage.setItem("tb-nav", "1"));
    window.addEventListener("pageshow", () => setTimeout(() => sessionStorage.removeItem("tb-nav"), 800));
  }

  function boot() {
    initReveals();
    initCounters();
    initSmooth();
    wireTransitions();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
