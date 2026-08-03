from PIL import Image
import os
SRC='raw'; DST='/Users/lucas/valtorta-2/assets/img'
os.makedirs(DST, exist_ok=True)

# name: (file, widths)
JOBS = {
 # hero
 'portale':        ('BL2B5530-scaled.jpg', [900, 1800]),
 'valle':          ('GFR_6593-scaled.jpg', [1200, 2000]),
 # cantina / ambiente
 'cantina-oro':    ('GFR_6508-scaled.jpg', [900, 1600]),
 'cantina-scaffali':('img_3190.jpeg',      [900, 1600]),
 'cantina-fila':   ('img_3201.jpeg',       [900, 1600]),
 'cantina-luce':   ('img_3186.jpeg',       [900, 1600]),
 # prodotti (still life pro)
 'p-agri':         ('GFR_6443-scaled.jpg', [700, 1300]),
 'p-agri-2':       ('GFR_6440-scaled.jpg', [700, 1300]),
 'p-formai':       ('GFR_6473-scaled.jpg', [700, 1300]),
 'p-formai-2':     ('GFR_6468-scaled.jpg', [700, 1300]),
 'p-stracchino':   ('Stracchino-allantica-scaled.jpg', [700, 1300]),
 'p-formagella':   ('GFR_6447-scaled.jpg', [700, 1300]),
 'p-fiuri':        ('GFR_6397-scaled.jpg', [700, 1300]),
 'p-tavola':       ('GFR_6492-scaled.jpg', [900, 1600]),
 'p-tagliere':     ('GFR_6478-scaled.jpg', [900, 1600]),
 'p-mut-taglio':   ('image5-768x1024-1.jpeg', [700, 1100]),
 # packshot su bianco
 'pk-fiuri':       ('fiuri.jpeg',   [420]),
 'pk-yogurt':      ('yogurt.jpeg',  [420]),
 'pk-burro':       ('burro-2.jpeg', [520]),
 'pk-ricotta':     ('ricotta.jpeg', [420]),
 'pk-formagella':  ('formaggella_ok.jpeg', [460]),
 'pk-agri':        ('agri.jpg',     [640]),
 'pk-formai':      ('formai-de-mut-sc.jpg', [480]),
 'pk-stracchino':  ('stracchino_foto_principale.png', [520]),
 # persone / lavorazione
 'c-corridoio':    ('BL2B5530-scaled.jpg', [900]),
 'c-scaffale':     ('BL2B5580-scaled.jpg', [900, 1500]),
 'c-vassoio':      ('BL2B5589-scaled.jpg', [900, 1500]),
 'c-forma':        ('BL2B5627-scaled.jpg', [900, 1500]),
 'c-duo':          ('BL2B5658-scaled.jpg', [900, 1500]),
 'c-mut':          ('BL2B5702-scaled.jpg', [900, 1500]),
 'c-scaffali2':    ('BL2B5737-scaled.jpg', [900, 1500]),
 'c-annusa':       ('BL2B5755-scaled.jpg', [900, 1600]),
 'c-caldaia':      ('BL2B5803-scaled.jpg', [900, 1600]),
 'c-notte':        ('BL2B5871-scaled.jpg', [900, 1500]),
 'c-squadra':      ('BL2B5915-Modifica-scaled.jpg', [1000, 1800]),
 # territorio
 'v-paese':        ('Valtorta1.jpeg',      [900]),
 'v-acqua':        ('GFR_6584-1-scaled.jpg',[1000, 1700]),
 'v-baita':        ('GFR_6606-scaled.jpg', [1000, 1700]),
 'v-museo':        ('ecomuseo-di-valtorta-3.jpeg', [800]),
 'v-casera':       ('4-casera-e1597305127972.jpeg', [900]),
 'v-etnografico':  ('slide-etnografico.jpeg', [900]),
 # archivio storico
 'st-abramo':      ('ABRAMO.jpeg',   [450]),
 'st-silvano':     ('SILVANO.jpeg',  [800]),
 'st-caldaia':     ('P6214829-scaled.jpg', [900, 1500]),
 'st-taglio':      ('P6214870-scaled.jpg', [700, 1200]),
 'st-tela':        ('P6214919-scaled.jpg', [700, 1200]),
 'st-fascera':     ('P6215131-scaled.jpg', [700, 1200]),
 'st-casaro':      ('P6215152-scaled.jpg', [700, 1200]),
 # loghi / marchi
 'logo-latteria':  ('LatteriaValtorta_Logo2-2-scaled.jpg', [800]),
 'm-dop':          ('LOGO-DOP.png',      [300]),
 'm-slowfood':     ('slow-food-logo.png',[400]),
 'm-fdm':          ('logo-fdm.png',      [200]),
 'm-brembana':     ('prodotti-vb.jpeg',  [300]),
}
# sequenza agrì modellato a mano
for i,f in enumerate(['1-agri.jpg','2-agri.jpg','3-agri.jpg','4-agri.jpg','5-agri.jpg','6-agri.jpg',
                      '7-agri.jpg','8-agri.jpg','9-agri.jpg','10-agri-1.jpeg','11-agri-1.jpeg','12-agri-1.jpeg'], 1):
    JOBS[f'mano-{i:02d}'] = (f, [900])

tot=0
for name,(f,widths) in JOBS.items():
    p=os.path.join(SRC,f)
    if not os.path.exists(p): print('MISS',f); continue
    im=Image.open(p)
    if im.mode in ('RGBA','LA','P'):
        im=im.convert('RGBA')
        bg=Image.new('RGB',im.size,(255,255,255)); bg.paste(im,mask=im.split()[-1] if im.mode=='RGBA' else None)
        im=bg
    else: im=im.convert('RGB')
    for w in widths:
        if im.width < w: w2=im.width
        else: w2=w
        r=w2/im.width
        out=im.resize((w2,max(1,int(im.height*r))), Image.LANCZOS)
        suffix = '' if w==widths[-1] else f'@{w}'
        fn=f'{name}{suffix}.webp'
        out.save(os.path.join(DST,fn),'WEBP',quality=80,method=5)
        tot+=1
print('written',tot)
