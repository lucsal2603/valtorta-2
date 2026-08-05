# Latteria Sociale di Valtorta

Sito vetrina per la Latteria Sociale di Valtorta (alta Valle Brembana, BG).
HTML, CSS e JavaScript puri: nessuna build, nessun pacchetto da installare.

```bash
python3 -m http.server 8034 --directory .
# → http://localhost:8034
```

**Online**: https://lucsal2603.github.io/valtorta-2/

Contenuti e fotografie vengono dal sito del cliente, `latteriavaltorta.it/wp/`.
Quello che ho scritto io è elencato in [DA-VERIFICARE.md](DA-VERIFICARE.md).

---

## Il progetto

Il linguaggio visivo è quello di **funtownstudio.com**: fondo grigio chiarissimo
a puntini, tipografia grande in Be Vietnam Pro con le parole d'accento in
Platypi corsivo, navigazione a pillola bianca sospesa, forme che galleggiano e
cadono, sezioni scure che scorrono sopra l'apertura.

Il pezzo che tiene insieme tutto è **la O**.

Nel titolo d'apertura, la O di «Valtorta» non è una lettera: è un disco scuro
con dentro la mucca, che sporge con le corna e le orecchie sopra il cerchio e si
taglia sul bordo tondo all'altezza delle zampe. Sta in piedi e muove la coda,
con una leggera spinta verso l'alto, poi resta ferma un momento prima di
ricominciare.

Quando si comincia a scorrere fa un saltello, con le braccia in alto, e
sprofonda dentro il cerchio finché non sparisce. Solo allora il cerchio si
allarga, fino a coprire lo schermo di nero. Poi la sezione scura sale e lo
copre. Detto in un altro modo: si entra a Valtorta passando dentro la sua
stessa iniziale.

## Colori

Le neutre sono quelle di funtown. Gli accenti no: il rame è quello della
vecchia caldera, il verde è preso dalla mucca del loro logo.

| Ruolo | Valore | Note |
|---|---|---|
| Fondo chiaro | `#f0f0f3` | con trama a puntini da 30 px |
| Superfici / schede | `#f8f8fb` | |
| Fondo scuro | `#1b1d22` | |
| Fondo scurissimo, chiusura | `#151618` | |
| Rame (accento) | `#f66c40` | la caldera |
| Pascolo | `#77b82a` | campionato dal logo della latteria |
| Pascolo tenue | `#dcecc4` | una sola scheda, quella dello shop |

I grigi del testo sono divisi per fondo, così i contrasti reggono ovunque:
`--su-chiaro` (5.4:1 su fondo chiaro), `--su-scuro` (6.2:1 su fondo scuro),
`--su-rame` (5.0:1 sull'arancio). Il grigio `--g500` resta solo per usi
decorativi: da solo non arriva a 4.5:1.

Caratteri: **Be Vietnam Pro** (300–700) e **Platypi** corsivo, entrambi da
Google Fonts, come sull'originale.

## I momenti

- **Il caricamento** — la mucca corre in loop sopra il marchio. La barra segue
  il caricamento **vero** (immagini non differite più i caratteri), non un tempo
  inventato, e il velo se ne va solo quando è tutto pronto — con un minimo di
  nove decimi di secondo perché non lampeggi e una rete di sicurezza a nove
  secondi. Lo stato di partenza dell'entrata è applicato subito, sotto il velo:
  altrimenti per un istante si vede la pagina già composta e poi tutto salta
  indietro per rientrare. È un WebP animato: l'originale pesava 2,6 MB, troppo per la prima
  cosa che si vede, quindi è ridotto a dodici fotogrammi a 9 al secondo e 300px
  di larghezza — 229 KB.
- **Apertura** — la O con la mucca, dodici forme che galleggiano, e un pulsante
  in basso a destra: cliccandolo le forme cadono davvero (Matter.js) e si
  possono spingere col mouse.
- **La mucca** — quarantacinque disegni, che però sono un palindromo esatto:
  in `mucca-frames.webp` ne stanno ventitré (dal riposo al culmine), rigiocati
  avanti e poi indietro. Li muove un'animazione CSS, che gira fuori dal thread
  principale e quindi non salta nemmeno mentre il resto della pagina lavora. Il
  giro dura cinque secondi: trentacinque scatti di movimento e poi la posa di
  riposo ferma per l'ultimo quarto. L'oscillazione si ferma al diciottesimo
  disegno invece che al ventitreesimo — è il numero da cambiare per farla più o
  meno ampia. La spinta verso l'alto è una seconda animazione, su un elemento a
  parte, così il saltello e il ciclo dei disegni non se la portano via; dura
  esattamente quanto il ciclo, quindi respiro e coda restano in sincrono.
- **Il taglio** — una maschera a due strati (il cerchio del disco, più un
  rettangolo che copre tutto quello che sta sopra l'88% della sua altezza) su un
  elemento **fermo**, non su quello che GSAP trasla. La scatola della maschera è
  larga e alta il triplo del disco: `mask-clip` taglia tutto quello che esce dal
  riquadro dell'elemento, ed è il motivo per cui prima sparivano la testa e le
  mani. Così invece la testa esce sopra, le braccia ai lati, e sotto il bordo
  tondo si porta via tutto.
- **La mucca che indica** — nella sezione "Come nasce" sporge da dietro il bordo
  sinistro della fotografia e punta il dito verso il testo. È attaccata al bordo
  con `right:100%`, quindi resta incollata anche se la foto cambia misura.
- **Il portale** — il cerchio si allarga con `clip-path`, non con `scale`, e il
  fondo è pieno: niente fotografia da deformare. La riga che compare sul nero è
  centrata in mezzo allo schermo. Il raggio e il centro vengono
  misurati sulla O vera e ricalcolati quando cambiano i caratteri o le
  dimensioni della finestra.
- **I tre formaggi** — schede grandi, foto a tutta altezza, etichette a
  pillola. Agrì, Formai de Mut, Stracchino.
- **Il gesto** — le dodici fotografie della lavorazione dell'agrì stanno dentro
  un disco, la stessa forma della O: scorrendo la sequenza avanza fotogramma per
  fotogramma, quindi è chi guarda a formare il formaggio. Attorno gira un anello
  di testo su tracciato circolare, sotto la didascalia del fotogramma in corso e
  una barra di avanzamento.
- **Come nasce** — quattro tappe che si impilano: il latte, la caldaia, le mani,
  la cantina. Ogni scheda si incolla in cima e quella dopo le sale sopra
  lasciandone sporgere un dito, come le forme sulle assi. La mucca sporge dal
  fianco della terza e indica il testo.
- **Nastro** — i nomi dei prodotti scorrono e accelerano seguendo lo scroll,
  invertendo il verso se si torna indietro.
- **La citazione** — schermata rame, una riga sola.
- **Il territorio** — elenco di righe: passando sopra, la fotografia insegue il
  cursore con un po' di ritardo.
- **La navigazione** — logo e menu non si nascondono mai. Il logo decide da solo
  se schiarirsi: campiona il colore che ha davvero dietro (e il ritaglio del
  portale, che non è campionabile perché non prende il puntatore) invece di
  seguire gli intervalli delle sezioni, che restavano incastrati.

Tutto si spegne con `prefers-reduced-motion`.

Su telefono: `ignoreMobileResize` e il ricalcolo legato alla sola larghezza,
perché la barra degli indirizzi che compare e scompare cambia l'altezza e
faceva rimbalzare indietro la pagina; e Lenis non tocca lo scorrimento a dito,
che resta quello nativo.

## Struttura

```
index.html            una pagina sola
css/style.css         variabili, sezioni, responsive
js/main.js            Lenis + GSAP/ScrollTrigger + Matter.js (da CDN)
assets/img/           46 WebP: le foto del cliente e la striscia della mucca
assets/svg/           le forme che galleggiano
_qa.html  _sec.html   strumenti di verifica, vedi sotto
```

## Verificare il lavoro

Un sito così pieno di animazioni legate allo scorrimento è scomodo da
controllare: per vedere com'è fatta una sezione tocca ogni volta scorrere fin
lì, aspettare che parta l'animazione e sperare di beccare il fotogramma giusto.
Per questo mi sono fatto due pagine di servizio.

**`_sec.html`** monta una sezione da sola in cima al documento, ferma e senza
animazioni: la guardi subito, senza scorrere e senza aspettare.

```
_sec.html?sel=%23prodotti&z=0.35     una sezione, rimpicciolita per starci tutta
_sec.html?sel=.marquee%7C.quote      più sezioni insieme (| separa i selettori)
_sec.html?sel=.hero-wrap            l'apertura, ferma e senza animazioni
_sec.html?sel=.portal&portal=0.6     il cerchio aperto al 60%
```

`z` rimpicciolisce solo la resa, non il layout: le misure in `vw` restano vere.

**`_qa.html`** carica il sito dentro un riquadro di larghezza esatta, così provo
una misura di schermo precisa senza ridimensionare la finestra, e leggo le
misure vere degli elementi.

```
_qa.html?w=375&h=780            telefono
_qa.html?w=1440&h=810&p=0.22    a un quinto della pagina
```

La barra in alto riporta larghezza, posizione, diametro e centro della O, il
ritaglio del portale, e l'elenco degli elementi che escono di lato.

Le due pagine servono solo in sviluppo: si possono cancellare prima di
pubblicare.
