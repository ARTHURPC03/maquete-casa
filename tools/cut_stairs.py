"""Abre o vão das escadas nas texturas de piso (alpha 0) dos andares onde a escada chega.
Uso: python3 tools/cut_stairs.py  (precisa de Pillow)"""
import json, math, os
from PIL import Image, ImageDraw
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m=json.load(open(os.path.join(R,'data/model.json')))
CORE=[(14.95,9.5),(19.0,9.5),(19.0,12.45),(14.95,12.45)]          # escada principal
def rect(cx,cz,w,d,rot):
    a=math.radians(rot);c,s=math.cos(a),math.sin(a)
    return [(cx+x*c+z*s, cz-x*s+z*c) for x,z in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]]
WING=rect(26.8,5.6,2.6,2.4,42)                                      # escada de serviço da ala (térreo → 1º)
CUT={'terreo':[CORE],'p1':[CORE,WING],'p2':[CORE]}
for f,polys in CUT.items():
    p=os.path.join(R,'data/tex',f+'.png');im=Image.open(p).convert('RGBA')
    x0,z0,x1,z1=m['floors'][f]['bounds'];W,H=im.size
    a=im.getchannel('A');d=ImageDraw.Draw(a)
    for poly in polys:d.polygon([((x-x0)/(x1-x0)*W,(z-z0)/(z1-z0)*H) for x,z in poly],fill=0)
    im.putalpha(a);im.save(p,optimize=True);print('vão aberto em',f)
