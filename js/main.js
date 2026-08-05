/* ═══════════════════════════════════════════════════════════
   Latteria Sociale di Valtorta — animazioni
   Lenis (scroll morbido) + GSAP/ScrollTrigger + Matter.js
   ═══════════════════════════════════════════════════════════ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DESKTOP = () => window.matchMedia('(min-width: 861px)').matches;

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   1. SCROLL MORBIDO
   ───────────────────────────────────────────── */
let lenis = null;
if (!REDUCED) {
  lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}
const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

/* ─────────────────────────────────────────────
   2. PRELOADER
   ───────────────────────────────────────────── */
(function preloader() {
  const el = document.getElementById('preloader');
  const bar = el.querySelector('.preloader__bar i');
  const pct = el.querySelector('.preloader__pct');
  document.body.classList.add('is-locked');
  lenis?.stop();

  const done = () => {
    el.classList.add('is-out');
    document.body.classList.remove('is-locked');
    lenis?.start();
    setTimeout(() => el.remove(), 700);
    intro();
  };

  if (REDUCED) { done(); return; }

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: done });
  tl.set(bar, { scaleX: 0 })
    .to(bar, { scaleX: 0.35, duration: 0.5 })
    .to(bar, { scaleX: 0.72, duration: 0.55 }, '+=0.12')
    .to(bar, { scaleX: 1, duration: 0.45 }, '+=0.1')
    .to(el, { autoAlpha: 0, duration: 0.5, ease: 'power4.out' }, '+=0.15');

  tl.eventCallback('onUpdate', () => {
    const v = Math.round(Math.min(gsap.getProperty(bar, 'scaleX') * 100, 100));
    pct.textContent = v + '%';
  });
})();

/* ─────────────────────────────────────────────
   3. ENTRATA DELLA HERO
   ───────────────────────────────────────────── */
function intro() {
  if (REDUCED) return;
  const words = document.querySelectorAll('.hero__title .w');
  const oSlot = document.getElementById('oSlot');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from(oSlot, { scale: 0.2, opacity: 0, duration: 0.9, ease: 'power4.out' })
    .from(words, { yPercent: 108, opacity: 0, duration: 0.85, stagger: 0.055 }, 0.12)
    .from('.nav__logo, .nav__menu, .nav__burger', { y: -18, opacity: 0, duration: 0.6, stagger: 0.06 }, 0.35)
    .from('.hero__foot > *', { y: 14, opacity: 0, duration: 0.6, stagger: 0.07 }, 0.5)
    .from('.shape', { scale: 0, opacity: 0, duration: 0.7, stagger: { each: 0.035, from: 'random' }, ease: 'back.out(1.8)' }, 0.3);
}

/* ─────────────────────────────────────────────
   4. LA "O" CHE SI APRE E COPRE LO SCHERMO
   Prima la mucca sprofonda dentro il cerchio,
   che resta della sua misura. Solo quando è
   sparita il cerchio si allarga, e siccome ha lo
   stesso fondo del cerchio piccolo lo scambio
   fra i due strati non si vede.
   ───────────────────────────────────────────── */
(function portal() {
  const portalEl = document.getElementById('portal');
  const oSlot = document.getElementById('oSlot');
  const oMedia = document.getElementById('oMedia');
  const oCow = document.getElementById('oCow');
  const heroWrap = document.querySelector('.hero-wrap');
  const nav = document.getElementById('nav');
  const caption = portalEl.querySelector('.portal__caption');

  const geo = { x: 0, y: 0, r0: 0, rMax: 0 };
  let progress = 0;

  function measure() {
    // la hero è appiccicata in cima: la posizione della O a riposo è
    // quella che ha quando lo scorrimento della hero è ancora a zero
    const b = oSlot.getBoundingClientRect();
    const w = b.width || parseFloat(getComputedStyle(oSlot).width) || 0;
    if (!w) return;
    geo.x = b.left + w / 2;
    geo.y = b.top + b.height / 2;
    geo.r0 = w / 2;
    // raggio necessario a coprire l'angolo più lontano
    const corners = [[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]];
    geo.rMax = Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - geo.x, cy - geo.y))) * 1.02;
    portalEl.style.setProperty('--px', geo.x + 'px');
    portalEl.style.setProperty('--py', geo.y + 'px');
    apply();
  }

  function apply() {
    const r = geo.r0 + (geo.rMax - geo.r0) * progress;
    portalEl.style.setProperty('--pr', r + 'px');
  }

  measure();
  // le web font cambiano la larghezza del titolo, quindi la posizione della O
  document.fonts?.ready.then(() => { measure(); ScrollTrigger.refresh(); });
  window.addEventListener('load', measure);
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { measure(); ScrollTrigger.refresh(); }, 120);
  });

  if (REDUCED) {
    gsap.set(portalEl, { opacity: 0 });
    return;
  }

  const state = { r: 0 };

  gsap.timeline({
    scrollTrigger: {
      id: 'portal',
      trigger: heroWrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        nav.classList.toggle('is-hidden', self.progress > 0.5);
        // al primo accenno di scorrimento il ciclo si ferma sulle braccia
        // alzate: è la posa con cui prende lo slancio
        oCow.classList.toggle('is-hop', self.progress > 0.004);
      },
    },
  })
    // 0 → 0.07 : il saltello, con una piccola compressione a molla
    .to(oMedia, { yPercent: -13, duration: 0.07, ease: 'power2.out' }, 0)
    // 0.07 → 0.24 : e sprofonda dentro il cerchio, che intanto non si muove.
    // La corsa deve bastare a portare sotto il bordo anche la testa, che a
    // riposo sta parecchio sopra il disco.
    .to(oMedia, { yPercent: 138, duration: 0.17, ease: 'power2.in' }, 0.07)
    // 0.20 → 0.28 : scambio fra il cerchio del titolo e il pannello.
    // Hanno lo stesso fondo e lo stesso raggio: non si vede niente.
    .to(portalEl, { opacity: 1, duration: 0.05, ease: 'none' }, 0.2)
    .to(oSlot, { opacity: 0, duration: 0.05, ease: 'none' }, 0.24)
    // 0.24 → 0.86 : solo adesso il ritaglio cresce fino a coprire lo schermo
    .fromTo(state, { r: 0 }, {
      r: 1, duration: 0.62, ease: 'power2.inOut',
      onUpdate: () => { progress = state.r; apply(); },
    }, 0.24)
    // le parole del titolo si allontanano mentre il nero avanza
    .to('.hero__row:first-child .w:first-child', { xPercent: -60, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.26)
    .to('.hero__row:first-child .w:last-child', { xPercent: 60, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.26)
    .to('.hero__row--serif .w', { yPercent: 90, opacity: 0, duration: 0.26, stagger: 0.03, ease: 'power2.in' }, 0.24)
    .to('.hero__foot > *, .shape', { opacity: 0, duration: 0.2, ease: 'none' }, 0.22)
    // a schermo pieno resta il nero e, al centro, una riga sola
    .to(caption, { opacity: 1, y: 0, duration: 0.16, ease: 'power3.out' }, 0.70)
    .to(caption, { opacity: 0, y: -18, duration: 0.09 }, 0.95);
})();

/* ─────────────────────────────────────────────
   5. NAV
   ───────────────────────────────────────────── */
(function navigation() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
    open ? lenis?.stop() : lenis?.start();
  });

  document.querySelectorAll('.nav__menu a[href^="#"], .foot__top, .row[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#') || !document.querySelector(id)) return;
      e.preventDefault();
      if (nav.classList.contains('is-open')) burger.click();
      scrollTo(id);
    });
  });

  // il logo passa a chiaro sulle sezioni scure
  document.querySelectorAll('.sec--dark, .steps, .hscroll, .storia, .foot, .marquee').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 46px',
      end: 'bottom 46px',
      onToggle: (self) => nav.classList.toggle('is-dark', self.isActive),
    });
  });
})();

/* ─────────────────────────────────────────────
   6. RIVELAZIONI: righe di testo e blocchi
   ───────────────────────────────────────────── */
(function reveals() {
  if (REDUCED) return;

  // ogni parola dentro la sua feritoia: sale da sotto senza toccare il markup
  // (i <em> restano al loro posto, perché avvolgo solo i nodi di testo)
  const splitWords = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((node) => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        const slot = document.createElement('span');
        slot.className = 'sw';
        const inner = document.createElement('i');
        inner.textContent = part;
        slot.appendChild(inner);
        frag.appendChild(slot);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll('.sw > i');
  };

  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = splitWords(el);
    if (!words.length) return;
    // il translateY(112%) del CSS, letto dalla matrice calcolata, GSAP lo
    // vede come pixel: azzero anche y, altrimenti l'offset resta lì per sempre
    gsap.fromTo(words, { yPercent: 112, y: 0 }, {
      yPercent: 0, y: 0, duration: 0.85, stagger: 0.028, ease: 'power3.out',
      immediateRender: false,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });

  document.querySelectorAll('[data-rise]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // schede prodotto
  document.querySelectorAll('[data-case]').forEach((el) => {
    gsap.from(el, {
      y: 60, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });
})();

/* ─────────────────────────────────────────────
   6b. LA MUCCA APPESA — scende da dietro il bordo
   arancione della citazione e resta appesa lì
   ───────────────────────────────────────────── */
(function appesa() {
  const el = document.querySelector('.banco__appesa');
  if (!el) return;
  gsap.set(el, { xPercent: -50 });
  if (REDUCED) return;
  gsap.fromTo(el, { yPercent: -103, xPercent: -50 }, {
    yPercent: 0, xPercent: -50, duration: 1.1, ease: 'back.out(1.1)',
    scrollTrigger: { trigger: '#banco', start: 'top 74%' },
  });
})();

/* ─────────────────────────────────────────────
   7. SCORRIMENTO ORIZZONTALE — modellato a mano
   ───────────────────────────────────────────── */
(function horizontal() {
  const sec = document.querySelector('.hscroll');
  const track = document.getElementById('hTrack');
  if (!sec || !track) return;

  ScrollTrigger.matchMedia({
    '(min-width: 861px)': () => {
      const dist = () => track.scrollWidth - window.innerWidth + parseInt(getComputedStyle(track).paddingLeft) * 2;
      const tw = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: '.hscroll__pin',
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(track, { x: 0 }); };
    },
  });
})();

/* ─────────────────────────────────────────────
   8. COME NASCE — slider appuntato a quattro passi
   ───────────────────────────────────────────── */
(function steps() {
  const sec = document.querySelector('.steps');
  if (!sec) return;
  const items = sec.querySelectorAll('.step');
  const media = sec.querySelectorAll('.steps__media img');
  const dots = sec.querySelectorAll('.steps__dots i');
  let cur = 0;

  const show = (i) => {
    if (i === cur) return;
    cur = i;
    items.forEach((el, k) => el.classList.toggle('is-on', k === i));
    media.forEach((el, k) => el.classList.toggle('is-on', k === i));
    dots.forEach((el, k) => el.classList.toggle('is-on', k === i));
  };

  ScrollTrigger.create({
    trigger: sec,
    start: 'top top',
    end: () => '+=' + window.innerHeight * (items.length - 0.2),
    pin: '.steps__pin',
    scrub: false,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const i = Math.min(items.length - 1, Math.floor(self.progress * items.length));
      show(i);
    },
  });
})();

/* ─────────────────────────────────────────────
   9. MARQUEE — scorre da sola, accelera con lo scroll
   ───────────────────────────────────────────── */
(function marquee() {
  const row = document.querySelector('[data-marq]');
  if (!row || REDUCED) return;

  row.innerHTML += row.innerHTML;
  const half = row.scrollWidth / 2;
  // wrap invece del modulo: con timeScale negativo il modulo darebbe
  // valori positivi e lascerebbe un buco a sinistra
  const wrap = gsap.utils.wrap(-half, 0);

  const tw = gsap.to(row, {
    x: -half,
    duration: 26,
    ease: 'none',
    repeat: -1,
    modifiers: { x: (x) => wrap(parseFloat(x)) + 'px' },
  });

  let last = 0;
  ScrollTrigger.create({
    trigger: row,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity();
      const dir = v < 0 ? -1 : 1;
      gsap.to(tw, { timeScale: dir * Math.min(4, 1 + Math.abs(v) / 900), duration: 0.4, overwrite: true });
      clearTimeout(last);
      last = setTimeout(() => gsap.to(tw, { timeScale: 1, duration: 0.8 }), 180);
    },
  });
})();

/* ─────────────────────────────────────────────
   10. TERRITORIO — l'immagine segue il cursore
   ───────────────────────────────────────────── */
(function follow() {
  if (!DESKTOP() || REDUCED) return;
  const rows = document.querySelectorAll('#territorioList .row');
  const cursor = document.getElementById('cursor');

  // GSAP scrive il transform in linea e cancellerebbe quello del CSS: perciò
  // sposto il contenitore e lascio al figlio la scala e l'opacità
  rows.forEach((row) => {
    const ph = row.querySelector('.row__ph');
    if (!ph) return;
    gsap.set(ph, { xPercent: -50, yPercent: -50 });
    const qx = gsap.quickTo(ph, 'x', { duration: 0.5, ease: 'power3' });
    const qy = gsap.quickTo(ph, 'y', { duration: 0.5, ease: 'power3' });

    row.addEventListener('mouseenter', () => { row.classList.add('is-on'); cursor.classList.add('is-on'); });
    row.addEventListener('mouseleave', () => { row.classList.remove('is-on'); cursor.classList.remove('is-on'); });
    row.addEventListener('mousemove', (e) => { qx(e.clientX + 200); qy(e.clientY); });
  });

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.32, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.32, ease: 'power3' });
  window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); });
})();

/* ─────────────────────────────────────────────
   11. LE FORME CADONO — Matter.js
   ───────────────────────────────────────────── */
(function physics() {
  const btn = document.getElementById('surprise');
  const canvas = document.getElementById('physics');
  const box = document.getElementById('shapes');
  if (!btn || !canvas || !box) return;
  let running = false;

  btn.addEventListener('click', () => {
    if (running || typeof Matter === 'undefined') return;
    running = true;
    btn.textContent = 'ecco, sono cadute';

    const hero = document.getElementById('hero');
    const W = hero.clientWidth, H = hero.clientHeight;
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create();
    const render = Render.create({
      canvas, engine,
      options: { width: W, height: H, wireframes: false, background: 'transparent', pixelRatio: window.devicePixelRatio || 1 },
    });

    const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true, render: { visible: false } });
    Composite.add(engine.world, [
      wall(W / 2, H + 30, W * 2, 60),
      wall(-30, H / 2, 60, H * 2),
      wall(W + 30, H / 2, 60, H * 2),
    ]);

    box.querySelectorAll('.shape').forEach((el) => {
      const b = el.getBoundingClientRect();
      const hb = hero.getBoundingClientRect();
      const size = Math.max(b.width, b.height);
      const scala = b.width / (el.naturalWidth || 100);
      const body = Bodies.circle(b.left - hb.left + b.width / 2, b.top - hb.top + b.height / 2, size / 2, {
        restitution: 0.62,
        friction: 0.05,
        render: { sprite: { texture: el.src, xScale: scala, yScale: scala } },
      });
      Composite.add(engine.world, body);
      el.style.visibility = 'hidden';
    });

    canvas.style.pointerEvents = 'auto';
    const mouse = Mouse.create(canvas);
    mouse.element.removeEventListener('wheel', mouse.mousewheel);
    Composite.add(engine.world, MouseConstraint.create(engine, {
      mouse, constraint: { stiffness: 0.2, render: { visible: false } },
    }));

    Render.run(render);
    Runner.run(Runner.create(), engine);
  });
})();

/* ─────────────────────────────────────────────
   12. RIFINITURE
   ───────────────────────────────────────────── */
document.getElementById('yy').textContent = new Date().getFullYear();

window.addEventListener('load', () => ScrollTrigger.refresh());
