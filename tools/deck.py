"""Gera o deck de madeira do 1º pavimento (área do térreo que fica descoberta no 1º) e a extensão da ala,
cortada na folha da planta. Saída: data/tex/p1_deck.png + data/extra.json. Uso: python3 tools/deck.py (Pillow + numpy)"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m=json.load(open(os.path.join(R,'data/model.json')))
A=(13.5,8.6); a=math.radians(42); U=(math.cos(a),-math.sin(a)); V=(math.sin(a),math.cos(a))
P=lambda u,v:(round(A[0]+u*U[0]+v*V[0],3),round(A[1]+u*U[1]+v*V[1],3))
EXT=[P(9.0,0),P(13.8,0),P(13.8,4.1),P(9.0,4.1)]          # extensão interna da ala (cozinha, copa, lavanderia)
def load(f):
    im=Image.open(os.path.join(R,'data/tex',f+'.png')).convert('RGBA');return np.array(im)[:,:,3]>0,m['floors'][f]['bounds'],im.size
ta,tb,(TW,TH)=load('terreo'); pa,pb,(PW,PH)=load('p1')
S=20  # px por metro no deck
x0,z0,x1,z1=tb; W,H=int((x1-x0)*S),int((z1-z0)*S)
xs=x0+(np.arange(W)+.5)/S; zs=z0+(np.arange(H)+.5)/S; X,Z=np.meshgrid(xs,zs)
def sample(mask,b,size,X,Z):
    bw,bh=size;ix=((X-b[0])/(b[2]-b[0])*bw).astype(int);iz=((Z-b[1])/(b[3]-b[1])*bh).astype(int)
    ok=(ix>=0)&(ix<bw)&(iz>=0)&(iz<bh);out=np.zeros(X.shape,bool);out[ok]=mask[iz[ok],ix[ok]];return out
t=sample(ta,tb,(TW,TH),X,Z); p=sample(pa,pb,(PW,PH),X,Z)
ext=Image.new('L',(W,H),0);ImageDraw.Draw(ext).polygon([((x-x0)*S,(z-z0)*S) for x,z in EXT],fill=255);ext=np.array(ext)>0
core=(X>14.9)&(X<19.05)&(Z>9.45)&(Z<12.5)
deck=t&~p&~ext&~core&(X>18.7)
# tábuas: listras ao longo da ala
uu=(X-A[0])*V[0]+(Z-A[1])*V[1]; plank=(np.floor(uu/0.14)%2).astype(np.uint8)
img=np.zeros((H,W,4),np.uint8); base=np.array([139,104,69]); alt=np.array([126,92,60])
img[deck,:3]=np.where(plank[deck,None]==1,base,alt); img[deck,3]=255
Image.fromarray(img).save(os.path.join(R,'data/tex/p1_deck.png'),optimize=True)
# contorno do deck → guarda-corpo (bordas do deck que não encostam em parede interna)
extra={'p1_deck_bounds':tb,'p1_ext':{'poly':EXT,'walls':[EXT[0]+EXT[1],EXT[1]+EXT[2]],'glass':[EXT[2]+EXT[3],EXT[0]+EXT[1]]},
       'rooms':{'gourmet':P(5.5,2.1),'cozinha':P(8.6,2.0),'servico':P(12.0,2.0)}}
json.dump(extra,open(os.path.join(R,'data/extra.json'),'w'))
print('deck m²:',round(deck.sum()/S/S,1),'| cômodos:',extra['rooms'])
