# 24/7 Artists — Premium Makeover & Multi‑Page Build Plan

A step‑by‑step implementation plan to refine [`final/final16.html`](../final/final16.html)
into a polished, premium, multi‑page experience — reusing the proven architecture from
[`smart-prehospital/`](../smart-prehospital/index.html).

> **How to use this file:** Each **Phase** below is a self‑contained chunk of work.
> When you're ready, tell me *"do Phase N"* and I'll implement only that phase.
> Phases are ordered so each builds on the last. Nothing is implemented yet —
> this document is the contract we agree on first.

---

## 1. Goals (what "done" looks like)

1. **Same concept, better UI.** Keep every section and idea already in `final16.html`
   (slider, about, education, horizontal journey, projects, garage, footer doodle).
   Only the *presentation* is upgraded.
2. **Multi‑page with cinematic redirects.** Split the one long page into linked pages,
   each with the sliding **page‑transition panel** used in `smart-prehospital`.
3. **Refined word / title reveals.** The slide‑in ("mask + rise") animation for headings
   works reliably and feels premium, not janky.
4. **Premium draggy scroll.** Smooth, weighted, slightly "heavy" inertia scrolling via
   a tuned Lenis config, synced to GSAP ScrollTrigger.
5. **Cohesive theme, per‑page accents.** One shared type + spacing system; each page keeps
   its own accent color (education = lime, tech = amber, network = violet, etc.) but reads
   as one family.
6. **Truly responsive at any aspect ratio.** Fluid viewport scaling (a shared `--u` unit
   built from `vw + vh`, `clamp()` guards, and live `visualViewport` recalibration) so the
   layout adapts to phones, tablets, ultrawides, and odd ratios.
7. **Fix the navbar.** Translucent, blurred, correctly sized; headings never collide with
   or get clipped by it. Word sizes are tuned so nothing overflows.
8. **Maximum reuse, minimum rework.** Port `motion.js` + `main.css` patterns instead of
   rewriting; keep the existing HTML markup wherever possible.

---

## 2. What we reuse from `smart-prehospital` (source of truth)

| Feature | Source | What we take |
| --- | --- | --- |
| Shared motion engine | [`assets/js/motion.js`](../smart-prehospital/assets/js/motion.js) | Lenis boot, reveal IO, counters, parallax, nav/footer injection |
| Page transitions | `motion.js` → `wireTransitions()` | Sliding `.transition-panel`, `data-link` interception, `sessionStorage` incoming reveal |
| Word‑split reveal | `motion.js` → `splitReveal()` + CSS `.reveal .word > span` | Mask + `translateY(115%) rotate(6deg)` → `0` with per‑word stagger |
| Design tokens | [`assets/css/main.css`](../smart-prehospital/assets/css/main.css) `:root` | `clamp()` fluid type scale, ease curves, spacing, nav/footer/transition CSS |
| Reduced‑motion support | `main.css` + `motion.js` `reduced` guard | Accessibility fallback |

### Fluid responsive technique (the "any aspect ratio" requirement)
Adopt the same system referenced in the Drive pages:

```css
:root{
  /* one fluid unit driven by BOTH width and height */
  --u: clamp(8px, calc(0.6vw + 0.6vh), 22px);
  /* fluid type scale */
  --fs-hero: clamp(2.6rem, 11vw, 11rem);
  --fs-h2:   clamp(1.9rem, 6vw, 5rem);
  --fs-body: clamp(1rem, 1.15vw, 1.2rem);
}
```

Plus a JS `visualViewport` recalibration that updates a `--vh`/`--vw` custom property on
`resize` + `orientationchange`, so `100vh` bugs on mobile browsers disappear and elements
that must hold proportion use `aspect-ratio`.

---

## 3. Target architecture

New sibling folder (keeps `final16.html` untouched as the reference/original):

```
artists247/
  index.html            # Home  (slider + about + hero)  — accent: cream/red
  education.html        # Education courses               — accent: lime  (#B4FF33)
  work.html             # Projects + garage grid          — accent: amber (#FFB800)
  journey.html          # Horizontal journey timeline     — accent: violet(#9D83FF)
  network.html          # Footer doodle / contact         — accent: teal  (#00BFA5)
  assets/
    css/
      main.css          # ported + adapted design system  (tokens, reveal, nav, footer, transition)
      pages.css         # per-page section styles pulled from final16 <style>
    js/
      motion.js         # ported shared engine (Lenis, reveals, transitions, nav/footer inject)
      journey.js        # the horizontal-scroll ScrollTrigger logic (page-specific)
      doodle.js         # footer character logic (page-specific)
  IMPLEMENTATION-PLAN.md  # this file
```

> **Decision needed from you:** page split above is a proposal. If you'd rather keep it a
> *single* long page but *add* the transition polish + fluid system, say so and we drop the
> multi‑page split (Phase 5 becomes optional).

---

## 4. Design system decisions

- **Fonts:** keep the existing pairing — `Bricolage Grotesque` (display),
  `Plus Jakarta Sans` (body), `Barlow Condensed` (mono/eyebrow), `Caveat` (doodle accent).
  Normalize sizes through the fluid `--fs-*` scale so nothing overflows the navbar.
- **Base theme:** cream `#FDF8F0` / ink `#1A1A1A` as the shared canvas.
- **Per‑page accent tokens** (set on `<body data-theme="...">`):
  - home → red `#F95335`
  - education → lime `#B4FF33`
  - work → amber `#FFB800`
  - journey → violet `#9D83FF`
  - network → teal `#00BFA5`
- **Navbar:** fixed, `height: clamp(64px, 8vh, 88px)`, translucent
  `background: rgba(253,248,240,.72)` + `backdrop-filter: blur(14px)`, hairline bottom border
  on scroll. Replaces the current `mix-blend-difference` header that clips large headings.
- **Heading safe‑area:** every first section gets `padding-top: calc(var(--nav-h) + clamp(1rem,4vh,3rem))`
  so titles never sit under the nav.

---

## 5. Phased work breakdown

### Phase 0 — Scaffold (no visual change yet)
- Create `artists247/` folder + `assets/css`, `assets/js`.
- Copy & adapt `main.css` tokens from `smart-prehospital` (light theme instead of dark).
- Port `motion.js` (strip medical‑specific nav/footer markup; make nav/footer generic to
  the 24/7 Artists brand).
- **Acceptance:** folder builds, a blank `index.html` loads the shared CSS/JS with no console errors.

### Phase 1 — Fluid responsive foundation
- Add `--u`, `--vh`, `--vw`, fluid `--fs-*` tokens to `main.css`.
- Add the `visualViewport` recalibration to `motion.js`.
- Convert fixed‑px section paddings in the ported `pages.css` to fluid units.
- **Acceptance:** resize + rotate at multiple aspect ratios (phone, tablet, ultrawide)
  with no overflow or clipping.

### Phase 2 — Navbar makeover
- Replace `mix-blend-difference` header with translucent blurred nav (see §4).
- Correct sizing (`--nav-h`), add scrolled state, add safe‑area padding to hero sections.
- Tune hero/heading font sizes so the biggest title fits within the viewport under the nav.
- **Acceptance:** on all breakpoints the nav is legible, translucent, and never clips a heading.

### Phase 3 — Word/title reveal refinement
- Wire headings to the `data-reveal` mask system (`splitReveal` + `.reveal .word > span`).
- Replace/repair the current `SplitType` attempts where they misbehave.
- Add per‑word stagger + `--ease` curve; guard with reduced‑motion.
- **Acceptance:** each major heading rises cleanly from a mask on scroll, staggered, no FOUC.

### Phase 4 — Premium draggy scroll
- Tune Lenis: `duration ≈ 1.25`, `lerp ≈ 0.075`, `wheelMultiplier ≈ 0.9`, `smoothWheel: true`,
  optional `syncTouch`.
- Sync to `gsap.ticker` + `ScrollTrigger.update()` (already the pattern in `motion.js`).
- Re‑tune the horizontal journey ScrollTrigger to feel weighted, not twitchy.
- **Acceptance:** scrolling feels smooth/heavy; horizontal section tracks cleanly.

### Phase 5 — Page split + cinematic redirects
- Split `final16.html` sections into the pages listed in §3.
- Add `.transition-panel` + `data-link` interception (ported `wireTransitions()`).
- Set per‑page `data-theme` accent; verify incoming reveal via `sessionStorage`.
- **Acceptance:** clicking any nav link plays the slide wipe, loads the next page, and the
  incoming page slides the panel away — accent color carries the brand.

### Phase 6 — Polish & consistency pass
- Normalize spacing rhythm, hover states, footer doodle, image zoom frames.
- Cross‑check color contrast + reduced‑motion + keyboard focus.
- Final responsive sweep at 5+ aspect ratios.
- **Acceptance:** the whole set reads as one premium, consistent product.

---

## 6. Specific fixes already identified in `final16.html`

- **Heading clipped by nav:** `mix-blend-difference` header + oversized
  `.s-about-home .s__title { font-size: min(11.1111rem, 10.4167vw); }` — cap with fluid
  `--fs-hero` and add nav safe‑area (Phase 2).
- **Reveal reliability:** page loads `SplitType` (line ~1139) but reveals depend on it being
  present; standardize on the `motion.js` `splitReveal` fallback so a missing CDN never breaks
  text visibility (Phase 3).
- **Scroll feel:** current Lenis is default‑tuned; apply the weighted config (Phase 4).
- **Per‑section media queries:** many hard breakpoints (lines 147‑151, 241‑274) → replace the
  brittle ones with fluid units so fewer breakpoints are needed (Phase 1).

---

## 7. Decisions (LOCKED)

1. **Structure:** ONE long continuous **home page** (`telugubadi/index.html`) holding every
   section in sequence (slider → about → courses → journey → showcase → garage → community
   footer). Plus a few **redirect sub-pages** reached from the nav/CTAs, each with the
   cinematic transition panel.
2. **Brand:** rebranded to **TeluguBadi** — an educational (Telugu learning) organization.
   All 24/7 Artists copy is rephrased into an educational voice, reusing captions where useful.
3. **Media:** keep the existing external `247artists.com` video URLs.
4. **Wordmark:** restyled as `Telugu` + light `Badi` in Bricolage.
5. **Build order:** any order, prioritizing reuse and efficiency.

### Progress log
- [x] Phase 0 scaffold — `telugubadi/` folder, `index.html` copied from final16, asset dirs.
- [x] Rebrand nav + wordmark + mobile menu + CTAs → TeluguBadi (About/Courses/Showcase/Community, Enroll).
- [x] Navbar makeover — translucent frosted `nav-bg` (rgba cream + backdrop-blur), reduced height, `--nav-h` token, `scroll-padding-top`.
- [x] Hero heading fluid sizing `clamp(3rem,9vw,8.5rem)` (was `min(11.1rem,10.4vw)`) to stop nav clipping.
- [x] Premium draggy Lenis tune (`lerp .085`, `wheelMultiplier .95`, `syncTouch`).
- [x] Section copy rebrand pass (hero slides, about, showcase, garage, footer, sitemap).
- [x] Shared engine built — `assets/css/main.css` (design system + DRAMATIC reveal + transitions + per-page accent via `body[data-theme]`) and `assets/js/motion.js` (Lenis, splitReveal, counters, transitions, `visualViewport` recalibration).
- [x] Sub-pages: `enroll.html`, `courses.html`, `community.html` — all on the shared engine with dramatic word reveals + cinematic transitions.
- [x] Home footer sitemap Courses/Community/Contact wired as redirect links.
- [ ] Remaining polish: mobile-menu links for sub-pages on home; optional home-page reveal check; final multi-aspect-ratio sweep.

### Dramatic reveal (sub-pages)
Words wrapped by `motion.js` `splitReveal`; CSS masks each word and animates the inner span
from `translateY(130%) rotate(12deg)` + `opacity:0` → rest over `1.15s` with `0.06s`
per-word stagger. Home page keeps its own SplitType `is-inview` system (unchanged, by request).
