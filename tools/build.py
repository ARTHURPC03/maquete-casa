import pymupdf, json, sys, math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
pdf, raw, out = sys.argv[1], sys.argv[2], sys.argv[3]
d=json.load(open(raw))
K=1.685; MPT=0.0176389  # m per pt at 1:50
off={'p1':(0,0),'terreo':(-823*K,69*K),'p2':(-22*K,-706*K),'garagem':(-983*K,-656*K)}
def floor_of(x,y):
    dx,dy=x/K,y/K
    if dx<705 and dy<655 and dx>80: return 'p1'
    if 100<dx<1130 and 560<dy<1250: return 'p2'
    if 1040<dx<1935 and 40<dy<720: return 'terreo'
    if 1200<dx<1650 and 940<dy<1300: return 'garagem'
    return None
doc=pymupdf.open(pdf); pg=doc[0]
DPI=150; S=DPI/72
pix=pg.get_pixmap(dpi=DPI, alpha=False)
full=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.h,pix.w,pix.n)[:,:,:3]
model={'floors':{}}
for f,(ox,oy) in off.items():
    segs=d['segs'][f]
    allp=[(s[0],s[1]) for k in segs for s in segs[k]]+[(s[2],s[3]) for k in segs for s in segs[k]]
    xs=[p[0] for p in allp]; ys=[p[1] for p in allp]
    x0,x1,y0,y1=min(xs)-20,max(xs)+20,min(ys)-20,max(ys)+20
    # crop raster, mask other floors
    X0,X1,Y0,Y1=int(x0*S),int(x1*S),int(y0*S),int(y1*S)
    crop=full[Y0:Y1,X0:X1].copy()
    h,w=crop.shape[:2]
    yy,xx=np.mgrid[0:h,0:w]
    px=(xx+X0)/S; py=(yy+Y0)/S
    m=np.vectorize(lambda a,b: floor_of(a,b)==f)(px[::8,::8],py[::8,::8])
    m=np.kron(m,np.ones((8,8),bool))[:h,:w]
    # footprint from vector segments
    fp=Image.new('L',(w,h),0); dr=ImageDraw.Draw(fp)
    for k in ('wall','thin','glass','trim'):
        for s in segs[k]:
            dr.line([(s[0]-x0)*S,(s[1]-y0)*S,(s[2]-x0)*S,(s[3]-y0)*S],fill=255,width=3)
    fpa=np.array(fp)>0
    r=int(0.9/MPT*S)  # close gaps up to ~1.8m
    rr=r/4; pd=int(rr)+6
    small=np.pad(fpa[::4,::4],pd)
    dil=ndimage.distance_transform_edt(~small)<=rr
    dil=ndimage.binary_fill_holes(dil)
    cl=ndimage.distance_transform_edt(dil)>rr
    cl=ndimage.binary_fill_holes(cl|small)[pd:-pd,pd:-pd]
    cl=np.kron(cl,np.ones((4,4),bool))[:h,:w]
    ink=(crop.mean(axis=2)<200)&m&ndimage.binary_dilation(cl,iterations=6)
    rgba=np.zeros((h,w,4),np.uint8)
    rgba[cl]=(236,228,214,255)
    rgba[ink]=(70,70,78,255)
    Image.fromarray(rgba).resize((w//2,h//2),Image.LANCZOS).save(f"{out}/{f}.png",optimize=True)
    def tm(x,y): return [round((x+ox)*MPT,3), round((y+oy)*MPT,3)]
    F={'bounds':[*tm(x0,y0),*tm(x1,y1)],'walls':[],'glass':[],'rails':[]}
    for s in segs['wall']:
        a,b=tm(s[0],s[1]),tm(s[2],s[3])
        if math.dist(a,b)>0.05: F['walls'].append(a+b)
    for s in segs['glass']:
        a,b=tm(s[0],s[1]),tm(s[2],s[3])
        if math.dist(a,b)>0.6: F['glass'].append(a+b)
    model['floors'][f]=F
    print(f,len(F['walls']),len(F['glass']),F['bounds'])
json.dump(model,open(f"{out}/model.json","w"))
