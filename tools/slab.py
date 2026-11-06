"""Laje contínua por andar: une a planta, o deck, a extensão da ala e os pisos dos cômodos, fecha frestas de até
~1,2 m e grava data/tex/<andar>_slab.png + os limites em data/extra.json. Uso: python3 tools/slab.py (Pillow, numpy, scipy)"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m=json.load(open(os.path.join(R,'data/model.json'))); ex=json.load(open(os.path.join(R,'data/extra.json')))
rooms=json.load(open(os.path.join(R,'data/rooms.json')))
S=10; PAD=2
allb=[f['bounds'] for f in m['floors'].values()]
X0=min(b[0] for b in allb)-PAD; Z0=min(b[1] for b in allb)-PAD; X1=max(b[2] for b in allb)+PAD; Z1=max(b[3] for b in allb)+PAD
W,H=int((X1-X0)*S),int((Z1-Z0)*S)
def px(x,z): return ((x-X0)*S,(z-Z0)*S)
def paste_alpha(mask,path,b,thr=0):
    a=np.array(Image.open(path).convert('RGBA'))[:,:,3]>thr
    bw=int((b[2]-b[0])*S);bh=int((b[3]-b[1])*S)
    im=Image.fromarray((a*255).astype(np.uint8)).resize((bw,bh),Image.NEAREST);ox,oz=int((b[0]-X0)*S),int((b[1]-Z0)*S)
    mask[oz:oz+bh,ox:ox+bw]|=np.array(im)[:H-oz,:W-ox]>0
def rect(cx,cz,w,d,rot):
    a=math.radians(rot);c,s=math.cos(a),math.sin(a)
    return [(cx+x*c+z*s,cz-x*s+z*c) for x,z in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]]
out={}
for f in m['floors']:
    mask=np.zeros((H,W),bool)
    paste_alpha(mask,os.path.join(R,'data/tex',f+'.png'),m['floors'][f]['bounds'])
    if f=='p1':
        paste_alpha(mask,os.path.join(R,'data/tex/p1_deck.png'),ex['p1_deck_bounds'])
    im=Image.fromarray((mask*255).astype(np.uint8));d=ImageDraw.Draw(im)
    if f=='p1': d.polygon([px(*p) for p in ex['p1_ext']['poly']],fill=255)
    for r in rooms:
        if r['floor']!=f or not r.get('fl'): continue
        fl=r['fl']
        if fl.get('circle'):
            cx,cz=px(r['x'],r['z']);rr=fl['w']/2*S;d.ellipse([cx-rr,cz-rr,cx+rr,cz+rr],fill=255)
        else: d.polygon([px(*p) for p in rect(r['x'],r['z'],fl['w'],fl['d'],r.get('rot',0))],fill=255)
    mask=np.array(im)>0
    rr=12  # 1,2 m
    pad=np.pad(mask,rr+2)
    dil=ndimage.distance_transform_edt(~pad)<=rr
    cl=ndimage.distance_transform_edt(dil)>rr
    cl=ndimage.binary_fill_holes(cl|pad)[rr+2:-(rr+2),rr+2:-(rr+2)]
    # não fecha o vão da escada (andares de cima) nem a área da piscina
    cut=Image.new('L',(W,H),0);dc=ImageDraw.Draw(cut)
    if f in('terreo','p1','p2'): dc.rectangle([px(14.95,9.5),px(19.0,12.45)],fill=255)
    if f=='p1':
        cx,cz=px(25.6,18.9);dc.ellipse([cx-34,cz-34,cx+34,cz+34],fill=255)
    cl&=~(np.array(cut)>0)
    rgba=np.zeros((H,W,4),np.uint8);rgba[cl]=(214,208,198,255)
    Image.fromarray(rgba).save(os.path.join(R,'data/tex',f+'_slab.png'),optimize=True)
    out[f]=round(float((cl&~mask).sum())/S/S,1)
ex['slab_bounds']=[round(X0,3),round(Z0,3),round(X1,3),round(Z1,3)]
json.dump(ex,open(os.path.join(R,'data/extra.json'),'w'))
print('m² de fresta fechada por andar:',out)
