# Sorgenti

`originali/` contiene le 78 fotografie scaricate dalla libreria multimediale di
`latteriavaltorta.it/wp/wp-content/uploads`, alla risoluzione pubblicata dal
cliente. Da qui sono state ricavate le WebP in `assets/img/`, con `converti.py`.

`originali/mucca/` contiene i quindici disegni della mucca, già su fondo
trasparente e già allineati fra loro (stesse zampe, stessa altezza, stessa tela
1254x1254). L'arco è: dal primo all'ottavo le braccia si aprono e le orecchie si
alzano, dal nono al quindicesimo si richiude tutto. Il primo e il quindicesimo
sono identici, quindi il ciclo gira senza stacchi.

`mucca-fotogrammi.png` è il provino dei quindici in fila, per controllo.

La striscia usata dal sito è `assets/img/mucca-frames.webp`: 380 px per
fotogramma, quindici righe, ritagliate tutte sullo stesso riquadro.

Niente di tutto questo serve in produzione: se il progetto va su un repo,
`originali/` va escluso (c'è già nel .gitignore).
