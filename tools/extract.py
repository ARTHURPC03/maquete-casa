import pymupdf, sys, json
from PIL import Image, ImageDraw
doc=pymupdf.open(sys.argv[1]); pg=doc[0]; out=sys.argv[2]
M=pg.rotation_matrix
K=1.6854  # display px -> pt
def floor_of(x,y):
    dx,dy=x/K,y/K
    if dx<705 and dy<655 and dx>80: return 'p1'
    if 100<dx<1130 and 560<dy<1250: return 'p2'
    if 1040<dx<1935 and 40<dy<720: return 'terreo'
    if 1200<dx<1650 and 940<dy<1300: return 'garagem'
    return None
layers={1.56:'wall',0.6:'glass',0.48:'thin',0.84:'trim'}
segs={f:{k:[] for k in layers.values()} for f in ['garagem','terreo','p1','p2']}
fills={f:[] for f in segs}
for x in pg.get_drawings():
    w=round(x.get('width') or 0,2)
    if x['type'] in ('fs',) :
        r=x['rect']*M
        if 8<r.width<40 and 8<r.height<40:
            c=((r.x0+r.x1)/2,(r.y0+r.y1)/2); f=floor_of(*c)
            if f: fills[f].append([round(c[0],1),round(c[1],1),round(r.width,1),round(r.height,1)])
        continue
    if x['type']!='s' or w not in layers: continue
    for it in x['items']:
        pts=None
        if it[0]=='l': pts=[it[1],it[2]]
        elif it[0]=='re':
            r=it[1]; q=[pymupdf.Point(r.x0,r.y0),pymupdf.Point(r.x1,r.y0),pymupdf.Point(r.x1,r.y1),pymupdf.Point(r.x0,r.y1)]
            pts=None
            for a,b in zip(q,q[1:]+q[:1]):
                a2,b2=a*M,b*M; f=floor_of((a2.x+b2.x)/2,(a2.y+b2.y)/2)
                if f: segs[f][layers[w]].append([round(a2.x,2),round(a2.y,2),round(b2.x,2),round(b2.y,2)])
            continue
        elif it[0]=='qu':
            q=it[1]; qq=[q.ul,q.ur,q.lr,q.ll]
            for a,b in zip(qq,qq[1:]+qq[:1]):
                a2,b2=a*M,b*M; f=floor_of((a2.x+b2.x)/2,(a2.y+b2.y)/2)
                if f: segs[f][layers[w]].append([round(a2.x,2),round(a2.y,2),round(b2.x,2),round(b2.y,2)])
            continue
        if it[0]=='c':
            P=[it[1],it[2],it[3],it[4]]; prev=None
            for i in range(9):
                t=i/8; q=P[0]*((1-t)**3)+P[1]*(3*t*(1-t)**2)+P[2]*(3*t*t*(1-t))+P[3]*(t**3); q=q*M
                if prev is not None:
                    f=floor_of((prev.x+q.x)/2,(prev.y+q.y)/2)
                    if f: segs[f][layers[w]].append([round(prev.x,2),round(prev.y,2),round(q.x,2),round(q.y,2)])
                prev=q
            continue
        if pts:
            a,b=pts[0]*M,pts[1]*M; f=floor_of((a.x+b.x)/2,(a.y+b.y)/2)
            if f: segs[f][layers[w]].append([round(a.x,2),round(a.y,2),round(b.x,2),round(b.y,2)])
json.dump({'segs':segs,'pillars':fills},open(f"{out}/raw.json","w"))
W,H=pg.rect.width,pg.rect.height; sc=0.6
im=Image.new('RGB',(int(W*sc),int(H*sc)),'white'); dr=ImageDraw.Draw(im)
cols={'wall':(220,0,0),'glass':(0,0,255),'thin':(0,150,0),'trim':(255,140,0)}
fc={'garagem':(255,0,255),'terreo':(0,200,200),'p1':(120,120,0),'p2':(0,0,0)}
for f in segs:
    for k,L in segs[f].items():
        for s in L: dr.line([s[0]*sc,s[1]*sc,s[2]*sc,s[3]*sc],fill=cols[k] if k!='wall' else fc[f],width=1)
    for p in fills[f]: dr.rectangle([(p[0]-6)*sc,(p[1]-6)*sc,(p[0]+6)*sc,(p[1]+6)*sc],fill=(0,200,0))
im.save(f"{out}/extract.png")
for f in segs: print(f,{k:len(v) for k,v in segs[f].items()},'pillars',len(fills[f]))
