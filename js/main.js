/* ═══════════════════════════════════════════════════════════
   Latteria Sociale di Valtorta — tutti i movimenti del sito

   Tre attrezzi, ognuno col suo mestiere:
   - Lenis ammorbidisce la rotella del mouse (lo scroll "scivola");
   - GSAP muove gli elementi, e il suo ScrollTrigger lega un
     movimento alla posizione di scorrimento (es. "quando questa
     sezione entra, fai salire il testo");
   - Matter.js è un motore di fisica: lo uso solo per il gioco dei
     prodotti che cadono in apertura.

   Il file è diviso in moduli numerati, nell'ordine della pagina.
   Ogni modulo è una funzione che parte da sola e non tocca le altre:
   se una sezione un giorno sparisce, basta togliere il suo modulo. */

/* Se il sistema operativo chiede "riduci le animazioni", questo è vero
   e ogni modulo salta la sua parte animata: il sito resta fermo ma intero. */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DESKTOP = () => window.matchMedia('(min-width: 861px)').matches;

gsap.registerPlugin(ScrollTrigger);

/* Su telefono la barra degli indirizzi che compare e scompare cambia l'altezza
   della finestra e fa scattare un resize: senza questo ScrollTrigger ricalcola
   i punti di aggancio a metà scorrimento e la pagina rimbalza indietro. */
ScrollTrigger.config({ ignoreMobileResize: true });

/* Lo stato di partenza dell'entrata va messo SUBITO, mentre il velo del
   caricamento copre ancora tutto: se lo si applica dopo, per un istante si
   vede la pagina già composta e poi tutto salta indietro per rientrare. */
const DA_ENTRARE = [
  ['#oSlot',                              { scale: 0.2, opacity: 0 }],
  ['.hero__title .w',                     { yPercent: 108, opacity: 0 }],
  ['.nav__logo, .nav__menu, .nav__burger',{ y: -18, opacity: 0 }],
  ['.hero__foot > *',                     { y: 14, opacity: 0 }],
  ['.shape',                              { scale: 0, opacity: 0 }],
];
if (!REDUCED) DA_ENTRARE.forEach(([sel, da]) => gsap.set(sel, da));

/* ─────────────────────────────────────────────
   1. SCROLL MORBIDO
   Lenis prende in mano la rotella e la traduce
   in uno scorrimento con inerzia. A dito però
   lascio fare al telefono (syncTouch false):
   se ci mettesse mano lui, la sua posizione e
   quella vera del browser litigherebbero e la
   pagina scatterebbe. GSAP fa da metronomo per
   entrambi (ticker → lenis.raf).
   ───────────────────────────────────────────── */
let lenis = null;
if (!REDUCED) {
  lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // a dito lascio scorrere il telefono per conto suo: se Lenis ci mette
    // mano, la sua posizione e quella vera del browser litigano e la pagina
    // torna indietro a scatti
    syncTouch: false,
    smoothTouch: false,
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

  let uscito = false;
  const esci = () => {
    if (uscito) return;
    uscito = true;
    document.body.classList.remove('is-locked');
    lenis?.start();
    intro();                                    // entra mentre il velo si dissolve
    if (REDUCED) { el.remove(); return; }
    gsap.to(el, { autoAlpha: 0, duration: 0.5, ease: 'power2.out',
      onComplete: () => el.remove() });
  };

  if (REDUCED) { esci(); return; }

  // la barra segue il caricamento vero, non un tempo inventato
  const stato = { v: 0 };
  const dipingi = () => {
    gsap.set(bar, { scaleX: stato.v });
    pct.textContent = Math.round(stato.v * 100) + '%';
  };
  const porta = (v) => gsap.to(stato, { v, duration: 0.5, ease: 'power2.out', onUpdate: dipingi });
  dipingi();

  // conto le immagini che servono subito (le altre sono differite) più i caratteri
  const subito = [...document.images].filter((im) => im.loading !== 'lazy');
  const totale = subito.length + 1;
  let fatte = 0;
  const passo = () => {
    fatte++;
    porta(Math.min(1, fatte / totale));
    if (fatte >= totale) pronto();
  };

  const PARTENZA = performance.now();
  const MINIMO = 900;                            // così il velo non lampeggia
  const pronto = () => {
    if (uscito) return;
    porta(1);
    const resta = Math.max(0, MINIMO - (performance.now() - PARTENZA));
    gsap.delayedCall((resta + 300) / 1000, esci);
  };

  subito.forEach((im) => {
    if (im.complete) { passo(); return; }
    im.addEventListener('load', passo, { once: true });
    im.addEventListener('error', passo, { once: true });
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(passo);

  // rete di sicurezza: se qualcosa non arriva, non si resta chiusi fuori
  gsap.delayedCall(9, esci);
})();

/* ─────────────────────────────────────────────
   3. ENTRATA DELLA HERO
   La sfilata iniziale: cerchio, parole, menu,
   piè di pagina, forme. Gli stati di partenza
   li ho già applicati in cima al file (vedi
   DA_ENTRARE): qui porto tutto ai valori
   naturali e con clearProps tolgo ogni stile
   in linea, così ScrollTrigger poi lavora su
   elementi puliti.
   ───────────────────────────────────────────── */
function intro() {
  if (REDUCED) return;
  const pulisci = { clearProps: 'transform,opacity' };
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('#oSlot', { scale: 1, opacity: 1, duration: 0.9, ease: 'power4.out', ...pulisci })
    .to('.hero__title .w', { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.055, ...pulisci }, 0.12)
    .to('.nav__logo, .nav__menu, .nav__burger', { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ...pulisci }, 0.35)
    .to('.hero__foot > *', { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ...pulisci }, 0.5)
    .to('.shape', { scale: 1, opacity: 1, duration: 0.7, stagger: { each: 0.035, from: 'random' },
                    ease: 'back.out(1.8)', ...pulisci }, 0.3);
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
    // durante l'entrata la O è rimpicciolita da GSAP: la misuro senza
    // trasformazioni, se no raggio e centro escono sbagliati
    const inLinea = oSlot.style.transform;
    oSlot.style.transform = 'none';
    const b = oSlot.getBoundingClientRect();
    oSlot.style.transform = inLinea;
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
  let rz, larghezzaNota = window.innerWidth;
  window.addEventListener('resize', () => {
    // solo un vero cambio di larghezza rifà i conti: l'altezza su telefono
    // balla da sola con la barra degli indirizzi
    if (window.innerWidth === larghezzaNota) { measure(); return; }
    larghezzaNota = window.innerWidth;
    clearTimeout(rz);
    rz = setTimeout(() => { measure(); ScrollTrigger.refresh(); }, 160);
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
   Tre compiti: il menu a schermo pieno del
   telefono, gli ancoraggi morbidi (i link #...
   scivolano con Lenis invece di saltare), e il
   colore del logo, deciso campionando il punto
   dello schermo dietro al logo stesso.
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

  // il logo passa a chiaro quando dietro ha qualcosa di scuro. Invece di
  // inseguire gli intervalli di ogni sezione, guardo il colore che sta
  // davvero sotto l'angolo del logo: funziona con qualunque sezione, anche
  // col nero del portale, e non può restare incastrato.
  const logo = nav.querySelector('.nav__logo');
  const scuro = (c) => {
    const m = String(c).match(/\d+/g);
    if (!m) return false;
    const [r, g, b] = m.map(Number);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;   // luminanza
  };
  const portale = document.getElementById('portal');
  const aggiorna = () => {
    const b = logo.getBoundingClientRect();
    // il portale non si può campionare (pointer-events:none): guardo se il
    // suo ritaglio circolare copre già l'angolo del logo
    if (portale && +getComputedStyle(portale).opacity > 0.5) {
      const cs = getComputedStyle(portale);
      const m = cs.clipPath.match(/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/);
      if (m) {
        const [, r, cx, cy] = m.map(Number);
        if (Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy) < r) {
          nav.classList.add('is-dark');
          return;
        }
      }
    }
    nav.style.pointerEvents = 'none';
    const sotto = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    nav.style.pointerEvents = '';
    if (!sotto) return;
    let el = sotto, colore = 'rgba(0, 0, 0, 0)';
    while (el && colore === 'rgba(0, 0, 0, 0)') {
      colore = getComputedStyle(el).backgroundColor;
      el = el.parentElement;
    }
    nav.classList.toggle('is-dark', scuro(colore));
  };
  aggiorna();
  ScrollTrigger.addEventListener('refresh', aggiorna);
  (lenis ? lenis.on.bind(lenis, 'scroll') : (f) => addEventListener('scroll', f, { passive: true }))(aggiorna);
})();

/* ─────────────────────────────────────────────
   6. RIVELAZIONI: righe di testo e blocchi
   Due famiglie: [data-rise] (blocchi che salgono
   e compaiono) e [data-split] (titoli spezzati
   parola per parola, ognuna dentro una
   "feritoia" con overflow nascosto, che sale
   quando il titolo entra in vista). Lo split lo
   faccio avvolgendo i soli nodi di testo, così
   i corsivi <em> restano al loro posto.
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
  // sul bordo arancione combacia la pancia piatta (11% dell'altezza del
  // disegno, misurato sul riempimento delle righe): mani e braccia stanno
  // tutte sopra, sull'arancione
  gsap.set(el, { xPercent: -50, yPercent: -11 });
  if (REDUCED) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#banco', start: 'top 74%' } });
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'none' }, 0)
    // scende sull'arancione e aggancia il bordo con un piccolo rimbalzo
    .fromTo(el, { yPercent: -64, xPercent: -50 },
      { yPercent: -11, xPercent: -50, duration: 1.0, ease: 'back.out(1.4)' }, 0);
})();

/* ─────────────────────────────────────────────
   7. IL GESTO — lo scorrimento fa girare la
   sequenza dentro il disco: sei tu che formi
   l'agrì, un fotogramma alla volta
   ───────────────────────────────────────────── */
(function gesto() {
  const sec = document.querySelector('.gesto');
  if (!sec) return;
  const foto = sec.querySelectorAll('.gesto__fot');
  const voci = sec.querySelectorAll('.gesto__voce');
  const barra = sec.querySelector('.gesto__barra i');
  if (!foto.length) return;

  let cur = -1;
  const mostra = (i) => {
    if (i === cur) return;
    cur = i;
    foto.forEach((el, k) => el.classList.toggle('is-on', k === i));
    voci.forEach((el, k) => el.classList.toggle('is-on', k === i));
  };
  mostra(0);

  if (REDUCED) { gsap.set(barra, { scaleX: 1 }); return; }

  ScrollTrigger.create({
    trigger: sec,
    start: 'top top',
    end: () => '+=' + window.innerHeight * 2.4,
    pin: '.gesto__pin',
    scrub: 0.5,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      mostra(Math.min(foto.length - 1, Math.floor(self.progress * foto.length)));
      gsap.set(barra, { scaleX: self.progress });
    },
  });
})();

/* ─────────────────────────────────────────────
   8. COME NASCE — le tappe si impilano da sole
   con position:sticky; qui aggiungo solo la
   salita di ciascuna quando entra in campo
   ───────────────────────────────────────────── */
(function tappe() {
  const carte = document.querySelectorAll('.tappa__scheda');
  if (!carte.length || REDUCED) return;
  carte.forEach((c) => {
    gsap.from(c, {
      yPercent: 6, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: c, start: 'top 92%' },
    });
  });
})();

/* ─────────────────────────────────────────────
   9. MARQUEE — scorre da sola, accelera con lo scroll
   Duplico il contenuto e lo faccio scorrere di
   metà larghezza in loop: quando la prima metà
   esce, la seconda è identica e il salto non si
   vede. La velocità segue lo scroll (timeScale)
   e si inverte se torni indietro; wrap() invece
   del modulo perché il modulo, con la velocità
   negativa, lascerebbe un buco a sinistra.
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
   quickTo è la versione "continua" di un tween:
   ogni movimento del mouse aggiorna la meta e
   GSAP insegue con un piccolo ritardo, che è
   quello che dà la sensazione di peso. Muovo i
   GUSCI (row__ph, cursor) e lascio ai figli gli
   effetti CSS: GSAP scrive il transform in linea
   e cancellerebbe quello delle classi.
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
   Al clic costruisco un mondo fisico grande come
   la hero: tre muri invisibili (pavimento e
   fianchi), poi per ogni prodotto un corpo
   circolare nella sua posizione esatta, con la
   stessa immagine come "vestito". Da lì in poi
   comanda la gravità, e il mouse può trascinare
   i pezzi. Le immagini originali spariscono nel
   momento in cui nascono i corpi: nessuno se ne
   accorge perché sono identiche.
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
   L'anno del copyright scritto da solo, e un
   refresh generale di ScrollTrigger a pagina
   carica, quando le misure sono definitive.
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   13. IL NOME IN FONDO — si riempie di rame
   dall'alto verso il basso mentre arrivi
   ───────────────────────────────────────────── */
(function riempi() {
  const el = document.querySelector('.foot__word');
  if (!el) return;
  if (REDUCED) { el.style.setProperty('--fw', '100%'); return; }
  // il traguardo è il fondo pagina, non un punto del viewport: la parola sta
  // così in basso che "top 42%" cadeva oltre lo scroll massimo e il
  // riempimento si fermava al 64%
  gsap.fromTo(el, { '--fw': '0%' }, {
    '--fw': '100%', ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 96%', end: 'max', scrub: 0.4 },
  });
})();

document.getElementById('yy').textContent = new Date().getFullYear();

window.addEventListener('load', () => ScrollTrigger.refresh());
