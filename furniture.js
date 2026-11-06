// Biblioteca de móveis procedurais. Convenção: frente do móvel para +z, centro na origem, base em y=0.
// Cada função recebe (g, it) e adiciona meshes ao grupo g. it.w = largura (x), it.d = profundidade (z), it.h = altura.
// it.m = chave de material em MAT. Geometrias, texturas e materiais são criados uma vez e compartilhados
// (a casa tem ~250 peças); peças com muitas repetições (livros, ripas, fichas, garrafas) usam InstancedMesh.
(function(){
const PI=Math.PI,HP=PI/2,UP=new THREE.Vector3(0,1,0),FWD=new THREE.Vector3(0,0,1);
function rng(seed){let s=(Math.floor(seed*1000)*2654435761)>>>0||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}

// ---------- texturas procedurais (canvas pequeno, geradas uma vez e compartilhadas)
const TEXC={};
function ctex(name,size,draw,rep=1,mirror=true){if(TEXC[name])return TEXC[name];const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=mirror?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=4;t.encoding=THREE.sRGBEncoding;return TEXC[name]=t}
function noiseFill(x,S,amp,r){x.fillStyle='#fff';x.fillRect(0,0,S,S);const id=x.getImageData(0,0,S,S),d=id.data;for(let i=0;i<d.length;i+=4){const v=255-Math.floor(r()*amp);d[i]=d[i+1]=d[i+2]=v}x.putImageData(id,0,0)}
const T={
 grain:()=>ctex('grain',256,(x,S)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);const r=rng(7);
   for(let i=0;i<90;i++){x.strokeStyle=`rgba(40,20,0,${.05+r()*.14})`;x.lineWidth=.6+r()*2.4;x.beginPath();let px=r()*S;x.moveTo(px,-8);for(let y=0;y<=S+8;y+=12){px+=(r()-.5)*5;x.lineTo(px,y)}x.stroke()}
   for(let i=0;i<5;i++){x.strokeStyle='rgba(30,15,0,.16)';x.lineWidth=5+r()*8;x.beginPath();let px=r()*S;x.moveTo(px,-8);for(let y=0;y<=S+8;y+=24){px+=(r()-.5)*9;x.lineTo(px,y)}x.stroke()}},1.5),
 noise:()=>ctex('noise',128,(x,S)=>noiseFill(x,S,42,rng(3)),3),
 boucle:()=>ctex('boucle',128,(x,S)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);const r=rng(11);for(let i=0;i<900;i++){x.fillStyle=`rgba(90,70,50,${.04+r()*.1})`;x.beginPath();x.arc(r()*S,r()*S,1.2+r()*2.2,0,7);x.fill()}},3),
 weave:()=>ctex('weave',128,(x,S)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);const r=rng(5),c=8;for(let i=0;i<S/c;i++)for(let j=0;j<S/c;j++){x.fillStyle=`rgba(60,45,30,${((i+j)%2?.11:.03)+r()*.07})`;x.fillRect(i*c,j*c,c-1,c-1)}},8,false),
 trav:()=>ctex('trav',256,(x,S)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);const r=rng(13);for(let i=0;i<12;i++){x.fillStyle=`rgba(120,100,70,${.04+r()*.06})`;x.fillRect(0,r()*S,S,2+r()*14)}
   for(let i=0;i<260;i++){x.fillStyle=`rgba(90,70,50,${.08+r()*.2})`;x.beginPath();x.ellipse(r()*S,r()*S,.6+r()*3,.4+r()*1.2,0,0,7);x.fill()}},1.5),
 cooktop:()=>ctex('cooktop',256,(x,S)=>{x.fillStyle='#0a0b0d';x.fillRect(0,0,S,S);x.strokeStyle='#5a5d62';x.lineWidth=3;
   [[70,80,34],[186,80,26],[70,180,26],[186,180,34]].forEach(([cx,cy,R])=>{x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();x.beginPath();x.arc(cx,cy,R*.45,0,7);x.stroke()});x.fillStyle='#8a8d92';for(let i=0;i<6;i++){x.beginPath();x.arc(30+i*40,238,4,0,7);x.fill()}},1,false),
 screen:()=>ctex('screen',128,(x,S)=>{const gr=x.createLinearGradient(0,0,0,S);gr.addColorStop(0,'#14233a');gr.addColorStop(.55,'#3f6d93');gr.addColorStop(.6,'#e9a45a');gr.addColorStop(1,'#2a1d2e');x.fillStyle=gr;x.fillRect(0,0,S,S)},1,false),
 art:()=>ctex('art',256,(x,S)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);const r=rng(17);for(let i=0;i<9;i++){x.fillStyle=`rgba(${i%2?255:30},${i%2?250:40},${i%2?240:60},${.25+r()*.4})`;x.beginPath();x.ellipse(r()*S,r()*S,20+r()*70,15+r()*50,r()*3,0,7);x.fill()}x.fillStyle='rgba(20,20,20,.7)';x.fillRect(0,S*.62,S,6)},1,false),
 stripes:()=>ctex('stripes',128,(x,S)=>{x.fillStyle='#fff';x.fillRect(0,0,S,S);x.fillStyle='rgba(40,40,40,.4)';for(let i=0;i<8;i+=2)x.fillRect(i*S/8,0,S/8,S)},1,false),
 net:()=>ctex('net',64,(x,S)=>{x.clearRect(0,0,S,S);x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=1;for(let i=0;i<S;i+=6){x.beginPath();x.moveTo(i+.5,0);x.lineTo(i+.5,S);x.moveTo(0,i+.5);x.lineTo(S,i+.5);x.stroke()}},8,false),
 holes:()=>ctex('holes',64,(x,S)=>{x.fillStyle='#262729';x.fillRect(0,0,S,S);x.fillStyle='#6a6d72';for(let i=4;i<S;i+=12){x.beginPath();x.arc(S/2,i,3,0,7);x.fill()}},1,false),
};

// ---------- materiais
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:0},o));
const MT=(c,t,o={})=>M(c,Object.assign({map:T[t]()},o));
const DS=THREE.DoubleSide;
const MAT={
  // madeiras (veio procedural)
  walnut:MT(0x5b3d29,'grain',{roughness:.5}),freijo:MT(0xa47a4c,'grain',{roughness:.55}),oak:MT(0xc6a477,'grain',{roughness:.6}),teak:MT(0x94663d,'grain',{roughness:.6}),
  // metais
  black:M(0x1d1e20,{roughness:.5,metalness:.3}),steel:M(0xa3a8ad,{metalness:.75,roughness:.3}),chrome:M(0xdadfe2,{metalness:.9,roughness:.12}),brass:M(0xb08d57,{metalness:.8,roughness:.3}),
  // couros e tecidos
  leather:MT(0x8e522a,'noise',{roughness:.45}),cognac:MT(0x9a5a2c,'noise',{roughness:.45}),leatherDark:MT(0x3b2a22,'noise',{roughness:.5}),
  linen:MT(0xe6dfd1,'noise',{roughness:.95}),boucle:MT(0xf0ebe2,'boucle',{roughness:1}),charcoal:MT(0x3a3e44,'noise',{roughness:.95}),sand:MT(0xc9b99e,'noise',{roughness:.95}),
  olive:MT(0x6f7257,'noise',{roughness:.95}),terracotta:MT(0xa95f3e,'noise',{roughness:.9}),felt:MT(0x1d5a3e,'noise',{roughness:1}),feltBlue:MT(0x1f6c84,'noise',{roughness:1}),
  throw:MT(0xb69b74,'noise',{roughness:1}),duvet:MT(0xe8e2d6,'noise',{roughness:1}),pillow:MT(0xfcfbf7,'noise',{roughness:1}),mattress:MT(0xf6f3ec,'noise',{roughness:1}),shade:M(0xf3e9d6,{roughness:1,emissive:0xffe2b0,emissiveIntensity:.25,side:DS}),
  // pedras e superfícies
  trav:MT(0xd9ccb3,'trav',{roughness:.6}),travDS:MT(0xd9ccb3,'trav',{roughness:.6,side:DS}),quartz:M(0xd9cdb6,{roughness:.3}),concrete:M(0x8f8a82,{roughness:.95}),rubber:M(0x2a2b2d,{roughness:1}),white:M(0xf1f0ec,{roughness:.55}),
  gray:M(0x9aa3aa,{transparent:true,opacity:.6}),gray2:M(0x8f9396,{roughness:.5}),redStool:MT(0x8a1f24,'noise',{roughness:.55}),red:M(0xa8332a,{roughness:.6}),orange:M(0xcf6d2c,{roughness:.8}),
  // telas, vidros e luz
  tv:M(0x0b0c0e,{roughness:.18,metalness:.3}),screen:M(0xf4f4f2,{roughness:.35,emissive:0x262626}),
  tvScreen:MT(0xffffff,'screen',{roughness:.12,metalness:.1,emissive:0xffffff,emissiveMap:T.screen(),emissiveIntensity:.45}),
  monitor:MT(0xffffff,'screen',{roughness:.2,emissive:0xffffff,emissiveMap:T.screen(),emissiveIntensity:.5}),
  glass:M(0xcfe6ee,{transparent:true,opacity:.35,roughness:.05}),glassDark:M(0x0e1a24,{roughness:.08,metalness:.4,transparent:true,opacity:.7}),
  mirror:M(0xcfdbe3,{metalness:.85,roughness:.08,emissive:0x6e7f8a,emissiveIntensity:.3}),acrylic:M(0x111214,{transparent:true,opacity:.6,roughness:.3}),
  lightOn:M(0xfff4dc,{emissive:0xffe9c0,emissiveIntensity:.9}),neon:M(0xff8a4c,{emissive:0xff6a2c,emissiveIntensity:1.4}),neon2:M(0x7fd7ff,{emissive:0x3ab6ff,emissiveIntensity:1.4}),redOn:M(0xff3030,{emissive:0xff2020,emissiveIntensity:1}),
  water:M(0x3aa7c4,{roughness:.1,transparent:true,opacity:.85}),spaInner:M(0xbfd6dc,{roughness:.4}),
  // plantas e exterior
  plant:M(0x3d6a39,{roughness:.9,side:DS}),plant2:M(0x5c8b45,{roughness:.9,side:DS}),leafI:M(0xffffff,{roughness:.9,side:DS}),pot:M(0xbca98f,{roughness:.9}),soil:M(0x3a2a1e,{roughness:1}),
  trunk:MT(0x7a5a40,'noise',{roughness:1}),rattan:MT(0x8d5c33,'weave',{roughness:.9,side:DS}),rope:M(0xd2c5aa,{roughness:1}),
  car:M(0xb7bbc1,{metalness:.65,roughness:.32}),tire:M(0x151515,{roughness:.9}),bottle:M(0x4a6b3a,{roughness:.2,transparent:true,opacity:.8}),bottleI:M(0xffffff,{roughness:.2,transparent:true,opacity:.85}),
  book1:M(0x8b4a3a),book2:M(0x2f4858),book3:M(0xc7a35a),acoustic:M(0x2f3338,{roughness:1}),acoustic2:M(0x6b5a48,{roughness:1}),feltI:MT(0xffffff,'noise',{roughness:1}),
  inst:M(0xffffff,{roughness:.7}),rugEdge:M(0x8a7a62,{roughness:1}),ppTop:M(0x1f3f8f,{roughness:.6}),net:M(0xffffff,{map:T.net(),transparent:true,side:DS,depthWrite:false}),
  cooktop:MT(0xffffff,'cooktop',{roughness:.15,metalness:.2}),rackSteel:MT(0xffffff,'holes',{roughness:.5,metalness:.3}),
  // acabamentos de piso (rooms.json usa estas chaves em "rug" como trecho de piso)
  madeira:MT(0x6a4430,'grain',{roughness:.55}),vinilico:MT(0xa47c55,'grain',{roughness:.6}),deck:MT(0x8b6845,'grain',{roughness:.8}),porcBranco:M(0xe8e6e1,{roughness:.22}),porcBege:M(0xd6ccbc,{roughness:.4})
};
const FLOORKEYS={madeira:1,porcBranco:1,porcBege:1,vinilico:1,deck:1};
const RUGM={},ARTM={},CANM={};
const mat=(it,def)=>MAT[it.m]||MAT[def]||MAT.linen;
const mk=(k,def)=>MAT[k]||MAT[def];
const hex=m=>m.color.getHex();

// ---------- geometrias compartilhadas
const GC={};const geo=(k,mkf)=>GC[k]||(GC[k]=mkf());
const BOX=new THREE.BoxGeometry(1,1,1);
const SPH=new THREE.SphereGeometry(1,12,9);
const cylGeo=(rt,rb,h,s=20,open)=>geo('c'+[rt,rb,h,s,open?1:0],()=>new THREE.CylinderGeometry(rt,rb,h,s,1,!!open));
const torGeo=(R,r,arc=PI*2,ts=8,rs=28)=>geo('t'+[R,r,arc,ts,rs],()=>new THREE.TorusGeometry(R,r,ts,rs,arc));
// Caixa arredondada (RoundedBoxGeometry não existe no UMD r147): BoxGeometry subdividida com as bordas projetadas
// numa esfera de raio r. seg=1 → 96 vértices, seg=2 → 216. O tipo continua 'BoxGeometry' (o site não a descarta ao reconstruir).
function rbGeo(w,h,d,r=.04,seg=2){r=Math.max(.002,Math.min(r,w/2,h/2,d/2));const k='r'+[w,h,d,r,seg].map(v=>+(+v).toFixed(3)).join();
  return geo(k,()=>{const n=seg*2+1,gm=new THREE.BoxGeometry(1,1,1,n,n,n),p=gm.attributes.position,nr=gm.attributes.normal,hs=.5/n,bx=w/2-r,by=h/2-r,bz=d/2-r,v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),sx=Math.sign(x),sy=Math.sign(y),sz=Math.sign(z);v.set(x-sx*hs,y-sy*hs,z-sz*hs);
      if(Math.abs(v.x)<1e-6)v.x=0;if(Math.abs(v.y)<1e-6)v.y=0;if(Math.abs(v.z)<1e-6)v.z=0;v.normalize();
      p.setXYZ(i,bx*sx+v.x*r,by*sy+v.y*r,bz*sz+v.z*r);nr.setXYZ(i,v.x,v.y,v.z)}
    gm.computeBoundingSphere();return gm})}
// Estádio (retângulo com pontas redondas) para a mesa de poker
function stadium(L,W){const s=new THREE.Shape(),r=W/2,a=Math.max(0,L/2-r);s.moveTo(-a,-r);s.lineTo(a,-r);s.absarc(a,0,r,-HP,HP,false);s.lineTo(-a,r);s.absarc(-a,0,r,HP,PI*1.5,false);return s}
const slabGeo=(L,W,h)=>geo('slab'+[L,W,h],()=>{const g=new THREE.ExtrudeGeometry(stadium(L,W),{depth:h,bevelEnabled:false,curveSegments:14});g.rotateX(-HP);g.translate(0,0,0);return g});
const railGeo=(L,W,t,h)=>geo('rail'+[L,W,t,h],()=>{const b=Math.min(h/2,t/2)*.9,s=stadium(L-2*b,W-2*b);s.holes.push(stadium(L-2*t+2*b,W-2*t+2*b));
  const g=new THREE.ExtrudeGeometry(s,{depth:h-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:14});g.rotateX(-HP);g.translate(0,b,0);return g});
const flatGeo=(L,W)=>geo('flat'+[L,W],()=>{const g=new THREE.ShapeGeometry(stadium(L,W),14);g.rotateX(-HP);return g});
// Folha de palmeira: tira afunilada em V que sobe e cai (comprimento 1 ao longo de +z)
const FROND=()=>geo('frond',()=>{const seg=9,pos=[],idx=[];for(let i=0;i<=seg;i++){const t=i/seg,z=t,y=.3*t-.75*t*t,hw=.02+.13*Math.pow(Math.sin(PI*t),.7);
    pos.push(-hw,y-hw*.45,z,0,y,z,hw,y-hw*.45,z)}
  for(let i=0;i<seg;i++){const a=i*3;idx.push(a,a+1,a+4,a,a+4,a+3,a+1,a+2,a+5,a+1,a+5,a+4)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g});

// ---------- helpers de montagem
function add(g,ge,m,x,y,z){const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o}
function box(g,w,h,d,x,y,z,m,ry){const o=add(g,BOX,m,x,y+h/2,z);o.scale.set(w,h,d);if(ry)o.rotation.y=ry;return o}
function rb(g,w,h,d,x,y,z,m,r=.04,seg=2){return add(g,rbGeo(w,h,d,r,seg),m,x,y+h/2,z)}
function cyl(g,r,h,x,y,z,m,s=20,rt){return add(g,cylGeo(rt??r,r,h,s),m,x,y+h/2,z)}
function rod(g,r,len,x,y,z,m,rx=0,rz=0,s=8){const o=add(g,cylGeo(r,r,len,s),m,x,y,z);o.rotation.set(rx,0,rz);return o}
function bar(g,r,a,b,m,s=8){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),L=A.distanceTo(B),o=add(g,cylGeo(r,r,+L.toFixed(3),s),m,0,0,0);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(UP,B.sub(A).normalize());return o}
function legs(g,w,d,h,r,m,inset=.06,s=8){[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>cyl(g,r,h,a*(w/2-inset),0,b*(d/2-inset),m,s))}
function sph(g,r,x,y,z,m,sx=1,sy=1,sz=1){const o=add(g,SPH,m,x,y,z);o.scale.set(r*sx,r*sy,r*sz);return o}
function tor(g,R,r,x,y,z,m,flat=true,arc){const o=add(g,torGeo(R,r,arc),m,x,y,z);if(flat)o.rotation.x=HP;return o}
function pivot(g,x,y,z,rx=0,ry=0,rz=0){const p=new THREE.Group();p.position.set(x,y,z);p.rotation.set(rx,ry,rz);g.add(p);return p}
// InstancedMesh: list = [{p:[x,y,z], r:[rx,ry,rz,order?] | q:Quaternion, s:[sx,sy,sz], c:hex}]
function inst(g,ge,m,list){if(!list.length)return null;const im=new THREE.InstancedMesh(ge,m,list.length),o=new THREE.Object3D();
  list.forEach((it,i)=>{o.position.set(...(it.p||[0,0,0]));if(it.q)o.quaternion.copy(it.q);else{const r=it.r||[0,0,0];o.rotation.set(r[0],r[1],r[2],r[3]||'XYZ')}o.scale.set(...(it.s||[1,1,1]));o.updateMatrix();im.setMatrixAt(i,o.matrix);if(it.c!=null)im.setColorAt(i,new THREE.Color(it.c))});
  im.castShadow=im.receiveShadow=true;g.add(im);return im}
const ib=(w,h,d,x,y,z,c,ry)=>({p:[x,y+h/2,z],s:[w,h,d],r:[0,ry||0,0],c});
const qDir=(dir,from=UP)=>new THREE.Quaternion().setFromUnitVectors(from,dir.clone().normalize());

const F={};
F.box=(g,it)=>rb(g,it.w,it.h||.75,it.d,0,0,0,mat(it,'sand'),.02,1);

// ----- estar
F.sofa=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'linen'),a=.22,hb=it.h||.82,fm=mk(it.fm,'walnut');
  legs(g,w-.1,d-.1,.12,.02,fm,.1);
  rb(g,w-2*a+.02,.16,d-.06,0,.12,0,m,.04);
  [-1,1].forEach(s=>rb(g,a,.58,d,s*(w/2-a/2),.12,0,m,.07));
  rb(g,w-2*a+.02,hb-.28,.2,0,.28,-d/2+.1,m,.06);
  const n=w>2.6?3:w>1.5?2:1,cw=(w-2*a)/n;
  for(let i=0;i<n;i++){const x=-w/2+a+cw*(i+.5);rb(g,cw-.02,.17,d-.3,x,.27,.06,m,.07);rb(g,cw-.04,.4,.17,x,.43,-d/2+.3,m,.08).rotation.x=-.12}
  if(w>1.4){const pm=mk(it.p,'throw'),p2=it.p?pm:MAT.olive;rb(g,.44,.44,.13,-w/2+a+.34,.44,-d/2+.42,pm,.06).rotation.set(-.14,.18,.08);rb(g,.4,.4,.13,w/2-a-.3,.44,-d/2+.42,p2,.06).rotation.set(-.14,-.2,-.08)}};
F.sofaL=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'boucle'),sd=1.0,fm=mk(it.fm,'walnut');
  const g1=new THREE.Group();g1.position.z=-d/2+sd/2;g.add(g1);F.sofa(g1,{w,d:sd,m:it.m||'boucle',p:it.p,fm:it.fm});
  const cl=new THREE.Group();cl.position.set(w/2-.5,0,sd/2-.02);g.add(cl);const cd=d-sd;
  rb(cl,1.0,.16,cd+.02,0,.12,0,m,.04);rb(cl,.96,.17,cd-.04,0,.28,0,m,.07);legs(cl,.9,cd-.1,.12,.02,fm,.06);
  rb(cl,.42,.42,.13,.1,.4,-cd/2+.26,mk(it.p,'throw'),.06).rotation.set(-.5,.3,0)};
F.armchair=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'leather'),fm=mk(it.fm,'walnut');
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>rod(g,.018,.2,a*(w/2-.08),.1,b*(d/2-.08),fm,-b*.1,a*.1));
  rb(g,w,.14,d,0,.18,0,m,.05);rb(g,w-.28,.14,d-.26,0,.32,.05,m,.07);
  rb(g,w-.08,.5,.16,0,.3,-d/2+.08,m,.07).rotation.x=-.1;
  [-1,1].forEach(s=>rb(g,.14,.3,d-.08,s*(w/2-.07),.32,0,m,.06));
  if(it.p)rb(g,.36,.36,.11,0,.46,-d/2+.3,mk(it.p,'throw'),.05).rotation.x=-.12};
F.ropeChair=(g,it)=>{const w=it.w,d=it.d,t=MAT.teak;legs(g,w,d,.4,.02,t,.05);
  [-1,1].forEach(b=>box(g,w-.06,.04,.04,0,.36,b*(d/2-.05),t));[-1,1].forEach(a=>box(g,.04,.04,d-.06,a*(w/2-.05),.36,0,t));
  rb(g,w-.08,.11,d-.1,0,.4,0,MAT.linen,.04);
  [-1,1].forEach(s=>{rod(g,.016,.52,s*(w/2-.05),.66,-d/2+.06,t);rod(g,.014,.24,s*(w/2-.05),.52,d/2-.06,t);rod(g,.014,d-.1,s*(w/2-.05),.64,0,t,HP,0)});
  box(g,w,.05,.05,0,.9,-d/2+.06,t);
  const posts=[];for(let i=0;i<8;i++)posts.push({p:[-w/2+.09+i*(w-.18)/7,.66,-d/2+.06]});inst(g,cylGeo(.006,.006,.48,6),MAT.rope,posts);
  [.52,.66,.8].forEach(y=>rod(g,.006,w-.14,0,y,-d/2+.06,MAT.rope,0,HP,6))};
F.rattanRound=(g,it)=>{const r=it.w/2;cyl(g,r,.4,0,0,0,MAT.rattan,32,r*.96);tor(g,r*.97,.03,0,.4,0,MAT.rattan);
  cyl(g,r*.86,.12,0,.4,0,MAT.linen,32);
  add(g,geo('rr'+r,()=>new THREE.CylinderGeometry(r,r,.45,32,1,true,PI*.2,PI*1.6)),MAT.rattan,0,.64,0);
  for(let i=0;i<3;i++){const a=PI*.75+i*PI*.25,p=rb(g,.42,.4,.13,Math.cos(a+HP)*(r*.7),.52,Math.sin(a+HP)*(r*.7)*-1,[MAT.throw,MAT.olive,MAT.sand][i],.06);p.rotation.set(-.35,-a,0,'YXZ')}};

// ----- quarto
F.bed=(g,it)=>{const w=it.w,d=it.d,fm=mk(it.fm,'walnut'),hbm=mk(it.hbm,'sand'),dm=mk(it.p,'duvet');
  rb(g,w+.1,.24,d+.06,0,.06,0,fm,.02,1);legs(g,w,d,.06,.025,MAT.black,.1);
  rb(g,w,.22,d,0,.3,0,MAT.mattress,.05);box(g,w+.004,.012,d+.004,0,.4,0,MAT.sand);
  const dz0=-d/2+.55,dl=d/2-.3-dz0;rb(g,w+.08,.12,dl,0,.5,dz0+dl/2,dm,.06);
  rb(g,w+.1,.15,.32,0,.5,d/2-.15,dm,.07);rb(g,w+.06,.05,d*.2,0,.62,d/2-.46,mk(it.tm,'throw'),.025);
  const np=w<1.3?1:2;for(let i=0;i<np;i++){const x=np==1?0:(i?1:-1)*(w/4),pw=np==1?w*.7:w/2-.1;
    rb(g,pw,.14,.4,x,.52,-d/2+.3,MAT.pillow,.06).rotation.x=-.35;rb(g,pw*.7,.1,.3,x,.54,-d/2+.5,mk(it.p2,'sand'),.05).rotation.x=-.2}
  if(it.hb!==false){const hw=w+.3;rb(g,hw,1.15,.1,0,0,-d/2-.08,hbm,.03,1);const n=Math.max(3,Math.round(hw/.3)),cw=(hw-.04)/n,l=[];
    for(let i=0;i<n;i++)l.push({p:[-(hw-.04)/2+cw*(i+.5),.15+.475,-d/2-.01]});inst(g,rbGeo(cw-.02,.95,.06,.03,1),hbm,l)}};
F.nightstand=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'walnut');rb(g,w,.45,d,0,.1,0,m,.015,1);legs(g,w,d,.1,.014,MAT.black,.04);
  box(g,w-.04,.006,.01,0,.33,d/2-.002,MAT.black);box(g,.14,.012,.02,0,.42,d/2+.005,MAT.black);box(g,.14,.012,.02,0,.2,d/2+.005,MAT.black);
  cyl(g,.05,.3,0,.55,0,MAT.trav,16,.035);cyl(g,.14,.19,0,.84,0,MAT.shade,24,.1)};
F.wardrobe=(g,it)=>{const w=it.w,h=it.h||2.4,d=it.d,m=mat(it,'white');rb(g,w,h-.06,d,0,.06,0,m,.006,1);box(g,w-.04,.06,d-.03,0,0,0,MAT.charcoal);
  const n=Math.max(2,Math.round(w/.6)),l=[];for(let i=1;i<n;i++)l.push({p:[-w/2+i*w/n,h/2+.03,d/2],s:[.005,h-.1,.006],c:0x5a5550});
  for(let i=0;i<n;i++)l.push({p:[-w/2+(i+.5)*w/n+(i%2?-1:1)*(w/n/2-.06),h*.45,d/2+.01],s:[.012,.3,.012],c:0x1d1e20});inst(g,BOX,MAT.inst,l)};

// ----- trabalho e jantar
F.desk=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'oak');rb(g,w,.035,d,0,.7,0,m,.01,1);
  [-1,1].forEach(s=>{box(g,.04,.7,.05,s*(w/2-.05),0,d/2-.08,MAT.black);box(g,.04,.7,.05,s*(w/2-.05),0,-d/2+.08,MAT.black);box(g,.04,.04,d-.16,s*(w/2-.05),.02,0,MAT.black)});
  if(it.mon!==false){box(g,.14,.012,.2,0,.735,-d/2+.2,MAT.black);box(g,.05,.22,.04,0,.745,-d/2+.16,MAT.black);rb(g,.64,.38,.025,0,.93,-d/2+.18,MAT.tv,.006,1);box(g,.62,.35,.003,0,.945,-d/2+.195,MAT.monitor);
    rb(g,.42,.012,.14,0,.735,d*.08,MAT.white,.004,1);rb(g,.06,.025,.1,.32,.735,d*.08,MAT.white,.01,1)}};
F.chair=(g,it)=>{const w=it.w||.48,d=it.d||.5,m=mat(it,'oak'),sm=mk(it.s,'linen');
  [-1,1].forEach(a=>cyl(g,.018,.44,a*(w/2-.04),0,d/2-.04,m,8,.014));
  [-1,1].forEach(a=>rod(g,.017,.88,a*(w/2-.04),.44,-d/2+.05,m,-.08,0));
  rb(g,w,.05,d,0,.44,0,m,.01,1);rb(g,w-.04,.05,d-.06,0,.49,.01,sm,.02,1);
  rb(g,w,.14,.03,0,.76,-d/2+.0,m,.012,1).rotation.x=-.08;rb(g,w-.1,.03,.025,0,.6,-d/2+.015,m,.01,1).rotation.x=-.08};
F.officeChair=(g,it)=>{const m=mat(it,'black'),arms=[],cast=[];for(let i=0;i<5;i++){const a=i/5*PI*2;arms.push({p:[Math.cos(a)*.15,.05,Math.sin(a)*.15],r:[0,-a,0],s:[.32,.035,.05]});cast.push({p:[Math.cos(a)*.3,.03,Math.sin(a)*.3],s:[.03,.03,.03]})}
  inst(g,BOX,MAT.black,arms);inst(g,SPH,MAT.rubber,cast);
  cyl(g,.025,.4,0,.06,0,MAT.chrome,10);box(g,.3,.04,.3,0,.42,0,MAT.black);
  rb(g,.5,.09,.5,0,.44,0,m,.04);rb(g,.46,.56,.07,0,.56,-.24,m,.04).rotation.x=-.1;rb(g,.3,.12,.06,0,1.12,-.29,m,.03,1).rotation.x=-.15;
  [-1,1].forEach(s=>{box(g,.03,.2,.05,s*.27,.5,.02,MAT.black);rb(g,.06,.025,.26,s*.27,.7,0,MAT.rubber,.01,1)})};
F.stool=(g,it)=>{const h=it.h||.75,m=mat(it,'leather');cyl(g,.19,.02,0,0,0,MAT.black,24);cyl(g,.03,h-.08,0,.02,0,MAT.black,10,.022);tor(g,.15,.012,0,.3,0,MAT.black);
  cyl(g,.19,.07,0,h-.07,0,m,24,.18);tor(g,.17,.018,0,h-.02,0,m);
  if(it.back!==false){rb(g,.3,.12,.03,0,h+.08,-.17,m,.012,1).rotation.x=-.1;rod(g,.01,.14,-.1,h+.03,-.165,MAT.black);rod(g,.01,.14,.1,h+.03,-.165,MAT.black)}};
F.dining=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'walnut');rb(g,w,.05,d,0,.7,0,m,.012,1);
  [-1,1].forEach(s=>rb(g,.08,.68,d-.3,s*(w/2-.35),0,0,m,.01,1));box(g,w-.9,.08,.08,0,.1,0,m);
  cyl(g,.07,.22,0,.75,0,MAT.quartz,16,.05);sph(g,.16,0,1.02,0,MAT.plant2,1,.7,1);
  const n=it.seats||8,per=Math.ceil(n/2),sp=(w-.3)/per;for(let i=0;i<per;i++)[-1,1].forEach(s=>{if(i*2+(s>0?1:0)>=n)return;const c=new THREE.Group();c.position.set(-w/2+.15+sp*(i+.5),0,s*(d/2+.28));c.rotation.y=s>0?PI:0;g.add(c);F.chair(c,{m:it.cm||'walnut',s:it.cs||'linen'})})};
F.coffee=(g,it)=>{const m=mat(it,'trav');if(it.round){cyl(g,it.w/2,.33,0,0,0,m,36,it.w/2*.9);cyl(g,it.w/2+.02,.04,0,.33,0,m,36)}
  else{rb(g,it.w,.05,it.d,0,.32,0,m,.012,1);rb(g,it.w*.6,.32,it.d*.6,0,0,0,m,.01,1)}
  const y=.37;rb(g,.3,.03,.22,-it.w*.15,y,.05,MAT.book2,.004,1);rb(g,.26,.025,.2,-it.w*.15,y+.03,.06,MAT.book3,.004,1).rotation.y=.2;cyl(g,.11,.07,it.w*.2,y,-.05,MAT.black,20,.13)};
F.side=(g,it)=>{const m=mat(it,'trav');cyl(g,it.w/2,.035,0,.5,0,m,28);cyl(g,.025,.5,0,0,0,MAT.black,10);cyl(g,it.w/2.4,.015,0,0,0,MAT.black,28);cyl(g,.035,.14,0,.535,-.03,MAT.white,12);sph(g,.02,0,.69,-.03,MAT.lightOn)};
F.rug=(g,it)=>{const key=it.m||'sand';let m;if(FLOORKEYS[key])m=MAT[key];else m=RUGM[key]||(RUGM[key]=MT(MAT[key]?hex(MAT[key]):0xc9b99e,'weave',{roughness:1}));
  if(it.round){cyl(g,it.w/2,.012,0,0,0,m,48);if(!FLOORKEYS[key])tor(g,it.w/2-.004,.009,0,.012,0,MAT.rugEdge)}
  else{rb(g,it.w,.014,it.d,0,0,0,m,.006,1);if(!FLOORKEYS[key])box(g,it.w+.03,.006,it.d+.03,0,0,0,MAT.rugEdge)}};

// ----- TV, estantes, painéis
F.tv=(g,it)=>{const w=it.w,h=w*.5625,y=it.y??.95;rb(g,w,h,.035,0,y,0,MAT.tv,.006,1);box(g,w-.03,h-.03,.003,0,y+.015,.019,MAT.tvScreen);box(g,.12,.01,.004,0,y+.012,.021,MAT.gray2);
  if(it.stand&&y<.3)[-1,1].forEach(s=>box(g,.18,y,.2,s*(w/2-.2),0,0,MAT.black))};
F.rack=(g,it)=>{const w=it.w,d=it.d,h=it.h||.42,m=mat(it,'walnut');rb(g,w,h-.12,d,0,.12,0,m,.012,1);legs(g,w,d,.12,.016,MAT.black,.08);
  const n=Math.max(2,Math.round(w/.6)),l=[];for(let i=1;i<n;i++)l.push({p:[-w/2+i*w/n,h/2+.04,d/2],s:[.005,h-.16,.006],c:0x2a2a2a});for(let i=0;i<n;i++)l.push({p:[-w/2+(i+.5)*w/n,h/2+.08,d/2+.008],s:[.14,.012,.012],c:0x1d1e20});inst(g,BOX,MAT.inst,l);
  if(it.deco!==false){cyl(g,.06,.22,-w/2+.25,h,-.02,MAT.quartz,14,.045);sph(g,.12,-w/2+.25,h+.3,-.02,MAT.plant2,1,.8,1);rb(g,.3,.18,.18,w/2-.3,h,0,MAT.black,.01,1)}};
F.slat=(g,it)=>{const w=it.w,h=it.h||2.4,n=Math.max(1,Math.floor(w/.09)),m=mat(it,'walnut'),l=[];for(let i=0;i<n;i++)l.push({p:[-w/2+w/n/2+i*w/n,h/2,0],s:[.045,h,.04]});inst(g,BOX,m,l);if(it.back!==false)box(g,w,h,.012,0,0,-.026,MAT.charcoal)};
F.shelf=(g,it)=>{const w=it.w,d=it.d,h=it.h||1.9,m=mat(it,'oak'),r=rng(w*7+d*3+h);[-1,1].forEach(s=>rb(g,.03,h,d,s*(w/2-.015),0,0,m,.004,1));box(g,w-.06,h-.06,.012,0,.03,-d/2+.006,m);
  const books=[],cols=[0x8b4a3a,0x2f4858,0xc7a35a,0xe8e2d0,0x4a6b5a,0x1d1e20];for(let i=0;i<5;i++){const y=i*(h-.03)/4;rb(g,w,.03,d,0,y,0,m,.004,1);
    if(i<4){let x=-w/2+.08;if(i%2){cyl(g,.05,.16,-w/2+.25,y+.03,0,MAT.quartz,12,.04);x+=.4}
      while(x<w/2-.25){const bw=.03+r()*.045,bh=.19+r()*.1;books.push(ib(bw,bh,d*.65,x+bw/2,y+.03,-.02,cols[Math.floor(r()*cols.length)]));x+=bw+.004;if(r()<.12)x+=.25}}}
  inst(g,BOX,MAT.inst,books)};
F.bar=(g,it)=>{const w=it.w,d=it.d;rb(g,w,.88,d,0,0,0,MAT.walnut,.01,1);const sl=[],n=Math.floor(w/.06);for(let i=0;i<n;i++)sl.push({p:[-w/2+.03+i*w/n,.44,d/2+.012],s:[.035,.84,.025]});inst(g,BOX,MAT.walnut,sl);
  rb(g,w+.04,.04,d+.06,0,.88,0,MAT.trav,.01,1);box(g,w,1.1,.04,0,1.25,-d/2+.02,MAT.walnut);
  const bt=[],cols=[0x4a6b3a,0x7a3b2a,0xc9a86a,0x2a3b4a,0xe8e2d0];for(let i=0;i<2;i++){box(g,w-.1,.015,.24,0,1.45+i*.4,-d/2+.14,MAT.glass);for(let b=0;b<Math.floor((w-.2)/.12);b++)bt.push({p:[-w/2+.15+b*.12,1.465+i*.4+.14,-d/2+.14],c:cols[(b+i)%5]})}
  inst(g,cylGeo(.03,.03,.28,10),MAT.bottleI,bt);box(g,w-.1,.015,.015,0,1.4,-d/2+.05,MAT.lightOn);
  const gl=[];for(let i=0;i<4;i++)gl.push({p:[-w/2+.3+i*.14,.97,-d/2+.3]});inst(g,cylGeo(.035,.028,.1,10),MAT.glass,gl)};
F.cabinet=(g,it)=>{const w=it.w,d=it.d,h=it.h||2.0,m=mat(it,'white');rb(g,w,h-.08,d,0,.08,0,m,.006,1);box(g,w-.04,.08,d-.03,0,0,0,MAT.charcoal);
  const n=Math.max(2,Math.round(w/.5)),l=[];for(let i=1;i<n;i++)l.push({p:[-w/2+i*w/n,h/2+.04,d/2],s:[.005,h-.12,.006],c:0x5a5550});
  for(let i=0;i<n;i++)l.push({p:[-w/2+(i+.5)*w/n+(i%2?-1:1)*(w/n/2-.05),h*.5,d/2+.012],s:[.012,.25,.012],c:0x1d1e20});inst(g,BOX,MAT.inst,l)};
F.steelShelf=(g,it)=>{const w=it.w,d=it.d,h=it.h||2.0,s=MAT.steel,r=rng(w*5+h);[-1,1].forEach(a=>[-1,1].forEach(b=>box(g,.035,h,.035,a*(w/2-.02),0,b*(d/2-.02),s)));
  const bins=[],cols=[0xb89a6a,0x8a8f94,0xe4e1da,0x4a5560];for(let i=0;i<5;i++){const y=.08+i*(h-.12)/4;box(g,w,.025,d,0,y,0,s);if(i<4){let x=-w/2+.06;while(x<w/2-.3){const bw=.25+r()*.15,bh=.18+r()*.14;bins.push(ib(bw,bh,d*.75,x+bw/2,y+.025,-.02,cols[Math.floor(r()*4)]));x+=bw+.04+r()*.1}}}inst(g,BOX,MAT.inst,bins)};
F.mirror=(g,it)=>{const w=it.w,h=it.h||1.8,y=it.y??.3;rb(g,w,h,.03,0,y,0,MAT.black,.006,1);box(g,w-.05,h-.05,.006,0,y+.025,.016,MAT.mirror)};
F.mirrorWall=(g,it)=>{const h=it.h||2.5;box(g,it.w,h,.01,0,.02,0,MAT.black);box(g,it.w-.03,h-.03,.012,0,.035,.002,MAT.mirror)};
F.art=(g,it)=>{const w=it.w,h=it.h||.9,y=it.y??1.3,key=it.m||'terracotta',m=ARTM[key]||(ARTM[key]=MT(MAT[key]?hex(MAT[key]):0xa95f3e,'art',{roughness:.9}));
  rb(g,w,h,.035,0,y,0,mk(it.fm,'walnut'),.006,1);box(g,w-.06,h-.06,.004,0,y+.03,.018,MAT.white);box(g,w-.16,h-.16,.004,0,y+.08,.021,m)};
F.acoustic=(g,it)=>{const w=it.w,h=it.h||1.8,n=Math.max(1,Math.round(w/.62)),y=it.y??.6,a=hex(MAT.acoustic),b=hex(mk(it.m2,'acoustic2')),l=[];
  for(let i=0;i<n;i++)for(let j=0;j<3;j++)l.push({p:[-w/2+(i+.5)*w/n,y+(j+.5)*h/3,.025],s:[w/n-.04,h/3-.04,.05],c:(i+j)%2?a:b});inst(g,BOX,MAT.feltI,l)};
F.curtain=(g,it)=>{const w=it.w,h=it.h||2.5,m=mat(it,'charcoal'),n=Math.max(2,Math.round(w/.11)),l=[];for(let i=0;i<n;i++)l.push({p:[-w/2+(i+.5)*w/n,h/2,i%2?.03:-.03]});inst(g,cylGeo(.058,.058,+h.toFixed(2),10),m,l);rod(g,.012,w+.1,0,h+.02,0,MAT.black,0,HP,8)};
F.neon=(g,it)=>{const w=it.w||1,y=it.y??1.7;box(g,w+.1,.5,.01,0,y-.1,-.01,MAT.acrylic);const seg=[],n=10;
  for(let i=0;i<n;i++){const x0=-w/2+i*w/n,x1=x0+w/n,y0=y+.15+Math.sin(i*1.7)*.09,y1=y+.15+Math.sin((i+1)*1.7)*.09,dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);seg.push({p:[(x0+x1)/2,(y0+y1)/2,.01],r:[0,0,Math.atan2(-dx,dy)],s:[1,L/.1,1]})}
  inst(g,cylGeo(.012,.012,.1,8),MAT.neon,seg);box(g,w*.6,.02,.012,0,y-.03,.01,MAT.neon2)};

// ----- cozinha e serviço
F.fridge=(g,it)=>{const w=it.w,d=it.d,h=it.h||1.85,m=mat(it,'steel');rb(g,w,h,d,0,0,0,m,.012,1);
  if(h>1.3){box(g,w-.02,.006,.01,0,h*.62,d/2,MAT.black);box(g,.006,h*.37,.01,0,h*.63,d/2,MAT.black);
    [-1,1].forEach(s=>rb(g,.025,h*.3,.03,s*.06,h*.66,d/2+.02,MAT.chrome,.01,1));rb(g,w*.6,.025,.03,0,h*.56,d/2+.02,MAT.chrome,.01,1);box(g,.14,.1,.004,-w*.22,h*.78,d/2+.002,MAT.tv)}
  else{box(g,w-.1,h-.18,.006,0,.09,d/2,MAT.glassDark);rb(g,.02,h-.3,.03,w/2-.08,.15,d/2+.02,MAT.chrome,.008,1);
    const bt=[],cols=[0x4a6b3a,0x7a3b2a,0xc9a86a];for(let r=0;r<3;r++)for(let i=0;i<3;i++)bt.push({p:[-w*.25+i*w*.25,.16+r*.24,d/2-.12],r:[HP,0,0],c:cols[i]});inst(g,cylGeo(.03,.03,.24,10),MAT.bottleI,bt)}};
F.appliance=(g,it)=>{const w=it.w,d=it.d,h=it.h||.85,m=mat(it,'steel');rb(g,w,h,d,0,0,0,m,.01,1);rb(g,w*.8,.025,.03,0,h-.1,d/2+.02,MAT.chrome,.01,1);
  box(g,w-.1,h*.55,.006,0,h*.18,d/2,MAT.glassDark);const kn=[];for(let i=0;i<4;i++)kn.push({p:[-w*.3+i*w*.2,h-.045,d/2+.01],r:[HP,0,0]});inst(g,cylGeo(.018,.018,.02,10),MAT.black,kn)};
F.washer=(g,it)=>{const w=it.w,d=it.d,h=it.h||.85;rb(g,w,h,d,0,0,0,MAT.white,.015,1);tor(g,.21,.025,0,.4,d/2+.02,MAT.chrome,false);
  add(g,cylGeo(.19,.19,.03,24),MAT.glassDark,0,.4,d/2+.01).rotation.x=HP;add(g,cylGeo(.17,.17,.3,20),MAT.charcoal,0,.4,d/2-.16).rotation.x=HP;
  box(g,w-.08,.1,.01,0,h-.14,d/2+.002,MAT.gray2);add(g,cylGeo(.03,.03,.02,14),MAT.black,w/2-.12,h-.09,d/2+.015).rotation.x=HP;box(g,.16,.04,.004,-w/2+.16,h-.11,d/2+.008,MAT.tv)};
F.counter=(g,it)=>{const w=it.w,d=it.d,h=it.h||.9,m=mat(it,'gray2'),top=mk(it.top,'quartz');
  rb(g,w,h-.14,d-.02,0,.1,-.01,m,.006,1);box(g,w-.02,.1,d-.08,0,0,-.04,MAT.charcoal);rb(g,w+.02,.04,d+.03,0,h-.04,.015,top,.008,1);
  const n=Math.max(1,Math.round(w/.6)),mw=w/n,l=[],zf=d/2;
  for(let i=0;i<n;i++){const x=-w/2+mw*(i+.5);if(i>0)l.push({p:[x-mw/2,h/2,zf],s:[.004,h-.18,.006],c:0x3a3a3a});
    if(i%3==1){const dh=(h-.2)/3;for(let k=0;k<3;k++){if(k)l.push({p:[x,.12+k*dh,zf],s:[mw-.02,.004,.006],c:0x3a3a3a});l.push({p:[x,.12+k*dh+dh-.05,zf+.012],s:[mw*.5,.012,.012],c:0x1d1e20})}}
    else l.push({p:[x+(i%2?-1:1)*(mw/2-.06),h*.62,zf+.012],s:[.012,.2,.012],c:0x1d1e20})}
  if(it.upper){rb(g,w,.7,.35,0,1.5,-d/2+.175,m,.006,1);for(let i=1;i<n;i++)l.push({p:[-w/2+i*mw,1.85,-d/2+.35],s:[.004,.64,.006],c:0x3a3a3a});for(let i=0;i<n;i++)l.push({p:[-w/2+(i+.5)*mw+(i%2?-1:1)*(mw/2-.06),1.6,-d/2+.36],s:[.012,.15,.012],c:0x1d1e20});box(g,w-.1,.01,.02,0,1.49,-d/2+.33,MAT.lightOn)}
  inst(g,BOX,MAT.inst,l);
  if(it.cook!=null&&it.cook!==false)box(g,.72,.01,.5,it.cook,h,-.02,MAT.cooktop);
  if(it.sink!=null&&it.sink!==false){const x=it.sink;box(g,.52,.045,.4,x,h-.04,0,MAT.steel);box(g,.44,.004,.32,x,h+.005,0,MAT.charcoal);rod(g,.012,.28,x,h+.14,-d/2+.1,MAT.chrome,0,0,10);add(g,torGeo(.1,.012,PI,8,12),MAT.chrome,x,h+.28,-d/2+.2).rotation.set(0,-HP,0)}};
F.tall=(g,it)=>{const w=it.w,d=it.d,h=it.h||2.2,m=mat(it,'gray2');rb(g,w,h-.1,d,0,.1,0,m,.006,1);box(g,w-.02,.1,d-.06,0,0,-.03,MAT.charcoal);
  if(it.oven!==false){rb(g,w-.1,.52,.02,0,.8,d/2,MAT.glassDark,.004,1);rb(g,w-.16,.02,.03,0,1.26,d/2+.02,MAT.chrome,.008,1);box(g,w-.1,.08,.004,0,1.32,d/2+.002,MAT.tv);
    rb(g,w-.1,.36,.02,0,1.45,d/2,MAT.glassDark,.004,1);rb(g,w-.16,.02,.03,0,1.74,d/2+.02,MAT.chrome,.008,1);
    inst(g,BOX,MAT.inst,[{p:[0,.45,d/2],s:[w-.04,.004,.006],c:0x3a3a3a},{p:[0,1.92,d/2],s:[w-.04,.004,.006],c:0x3a3a3a},{p:[0,.3,d/2+.012],s:[w*.4,.012,.012],c:0x1d1e20},{p:[0,2.05,d/2+.012],s:[w*.4,.012,.012],c:0x1d1e20}]);
    const kn=[];for(let i=0;i<3;i++)kn.push({p:[-.12+i*.12,1.32,d/2+.01],r:[HP,0,0]});inst(g,cylGeo(.015,.015,.02,10),MAT.gray2,kn)}};
F.bbq=(g,it)=>{const w=it.w||1.0,d=it.d||.6;rb(g,w,.85,d,0,0,0,MAT.trav,.01,1);rb(g,w+.04,.04,d+.04,0,.85,0,MAT.quartz,.008,1);
  box(g,w,1.1,.3,0,.89,-d/2+.15,MAT.trav);box(g,w-.3,.55,.36,0,.95,-d/2+.19,MAT.charcoal);
  const gr=[];for(let i=0;i<9;i++)gr.push({p:[-(w-.4)/2+i*(w-.4)/8,1.03,-d/2+.37],r:[HP,0,0]});inst(g,cylGeo(.006,.006,.3,6),MAT.steel,gr);
  const co=[];for(let i=0;i<7;i++)co.push({p:[-(w-.5)/2+i*(w-.5)/6,1.0,-d/2+.37+(i%2?.03:-.01)],s:[.035,.025,.035]});inst(g,SPH,MAT.neon,co);
  box(g,w-.1,.03,.32,0,1.49,-d/2+.21,MAT.steel);add(g,cylGeo(.14,.32,.3,4),MAT.steel,0,2.0,-d/2+.15).rotation.y=PI/4;box(g,.26,.4,.26,0,2.3,-d/2+.15,MAT.steel)};

// ----- jogos
F.poolTable=(g,it)=>{const w=it.w,d=it.d,fm=mat(it,'feltBlue'),wd=mk(it.wm,'walnut');
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=a*(w/2-.2),z=b*(d/2-.18);box(g,.17,.1,.17,x,0,z,wd);cyl(g,.06,.3,x,.1,z,wd,12,.08);sph(g,.09,x,.45,z,wd);box(g,.17,.1,.17,x,.52,z,wd)});
  rb(g,w-.1,.22,d-.1,0,.62,0,wd,.015,1);box(g,w-.2,.02,d-.2,0,.84,0,fm);
  [-1,1].forEach(s=>{rb(g,w,.06,.13,0,.84,s*(d/2-.065),wd,.012,1);rb(g,.13,.06,d-.26,s*(w/2-.065),.84,0,wd,.012,1);box(g,w-.5,.035,.05,0,.86,s*(d/2-.155),fm);box(g,.05,.035,d-.5,s*(w/2-.155),.86,0,fm)});
  const pk=[];[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]].forEach(([a,b])=>pk.push({p:[a*(w/2-.09),.895,b*(d/2-.08)]}));inst(g,cylGeo(.055,.055,.03,14),MAT.rubber,pk);
  const balls=[],bc=[0xf2c230,0x2b5cad,0xd23a2a,0x5b2a7a,0xe07a2a,0x2a7a46,0x8a2a2a,0x151515,0xf2c230,0x2b5cad];let k=0;
  for(let r=0;r<4;r++)for(let i=0;i<=r;i++)balls.push({p:[-w*.2-r*.05,.888,(i-r/2)*.058],s:[.028,.028,.028],c:bc[k++]});balls.push({p:[w*.22,.888,.05],s:[.028,.028,.028],c:0xfafafa});inst(g,SPH,MAT.inst,balls);
  rod(g,.008,1.45,w*.1,.93,d/2-.02,MAT.freijo,0,HP).rotation.set(0,.12,HP)};
F.pingpong=(g,it)=>{const w=it.w,d=it.d;rb(g,w,.03,d,0,.74,0,MAT.ppTop,.005,1);
  box(g,w,.004,.02,0,.771,0,MAT.white);box(g,.02,.004,d,0,.771,0,MAT.white);[-1,1].forEach(s=>{box(g,w,.004,.02,0,.771,s*(d/2-.01),MAT.white);box(g,.02,.004,d,s*(w/2-.01),.771,0,MAT.white)});
  [-1,1].forEach(s=>rod(g,.012,.2,s*(w/2+.06),.86,0,MAT.black));box(g,w+.12,.15,.004,0,.78,0,MAT.net);rod(g,.006,w+.12,0,.93,0,MAT.white,0,HP);
  [-1,1].forEach(s=>{const x=s*(w/2-.45);[-1,1].forEach(b=>box(g,.04,.72,.04,x,0,b*(d/2-.12),MAT.black));box(g,.04,.04,d-.2,x,.3,0,MAT.black)});box(g,w-.9,.04,.04,0,.3,0,MAT.black);
  add(g,cylGeo(.08,.08,.012,16),MAT.red,w*.25,.775,d*.2).rotation.x=HP;box(g,.025,.012,.1,w*.25,.769,d*.2+.13,MAT.freijo);
  add(g,cylGeo(.08,.08,.012,16),MAT.rubber,-w*.3,.775,-d*.15).rotation.x=HP;box(g,.025,.012,.1,-w*.3,.769,-d*.15-.13,MAT.freijo);sph(g,.02,w*.1,.79,-d*.3,MAT.white)};
F.poker=(g,it)=>{const w=it.w,d=it.d,seats=it.seats||9,rm=mk(it.rm,'leatherDark'),fm=mat(it,'felt'),t=.15,r=rng(w*3+d);
  add(g,slabGeo(w-.04,d-.04,.06),MAT.walnut,0,.66,0);add(g,railGeo(w,d,t,.1),rm,0,.72,0);add(g,flatGeo(w-2*t+.02,d-2*t+.02),fm,0,.728,0);
  [-1,1].forEach(s=>{cyl(g,.09,.66,s*w*.22,0,0,MAT.black,14,.07);rb(g,.6,.04,.5,s*w*.22,0,0,MAT.black,.015,1)});
  const ch=[],cd=[],cc=[0xd33a2e,0x1f5fae,0x1d1e20,0x2e8a4a,0xf1efe8];
  for(let i=0;i<seats;i++){const a=(i+.5)/seats*PI*2,cx=Math.cos(a),cz=Math.sin(a),px=cx*(w/2-t-.3),pz=cz*(d/2-t-.26);
    for(let k=0;k<3;k++){const n=4+Math.floor(r()*9);ch.push({p:[px-(k-1)*.05*cz,.73+n*.005,pz+(k-1)*.05*cx],s:[1,n,1],c:cc[(i+k)%5]})}
    [-1,1].forEach(s=>cd.push({p:[cx*(w/2-t-.5)-s*.035*cz,.731,cz*(d/2-t-.42)+s*.035*cx],r:[0,-a+.1*s,0],c:0xfafafa}));
    const c=new THREE.Group();c.position.set(cx*(w/2+.36),0,cz*(d/2+.36));c.rotation.y=Math.atan2(-cx,-cz);g.add(c);F.pokerChair(c,{m:it.cm})}
  for(let i=0;i<5;i++)cd.push({p:[(i-2)*.075,.731,0],c:0xfafafa});for(let k=0;k<3;k++)ch.push({p:[(k-1)*.06,.73+.04,.14],s:[1,8,1],c:cc[k]});
  inst(g,cylGeo(.02,.02,.01,12),MAT.inst,ch);inst(g,geo('card',()=>new THREE.BoxGeometry(.063,.002,.088)),MAT.inst,cd);add(g,cylGeo(.025,.025,.006,12),MAT.white,.2,.733,.12)};
F.pokerChair=(g,it)=>{const m=mat(it,'leather');cyl(g,.26,.025,0,0,0,MAT.black,20,.22);cyl(g,.03,.4,0,.025,0,MAT.chrome,10);box(g,.3,.04,.3,0,.4,0,MAT.black);
  rb(g,.5,.1,.5,0,.44,0,m,.04);rb(g,.46,.5,.09,0,.54,-.22,m,.05).rotation.x=-.1;[-1,1].forEach(s=>rb(g,.07,.18,.4,s*.215,.5,-.02,m,.03,1))};

// ----- academia
F.treadmill=(g,it)=>{const w=it.w||.85,d=it.d||2,b=MAT.black;rb(g,w,.14,d,0,.03,0,b,.03,1);box(g,w-.22,.012,d-.4,0,.17,.08,MAT.rubber);[-1,1].forEach(s=>box(g,.08,.012,d-.4,s*(w/2-.08),.17,.08,MAT.gray2));
  rb(g,w-.1,.12,.35,0,.17,-d/2+.3,b,.04);[-1,1].forEach(s=>rod(g,.025,1.2,s*(w/2-.05),.75,-d/2+.22,b,-.2,0,10));
  const cs=rb(g,w,.34,.06,0,1.22,-d/2+.1,b,.02,1);cs.rotation.x=-.5;rb(g,w*.55,.2,.01,0,1.3,-d/2+.16,MAT.monitor,.004,1).rotation.x=-.5;
  [-1,1].forEach(s=>rod(g,.016,.5,s*(w/2-.05),1.1,-d/2+.5,MAT.gray2,HP,0,10));rod(g,.016,w-.1,0,1.1,-d/2+.75,MAT.gray2,0,HP,10)};
F.bike=(g,it)=>{const b=MAT.black;rb(g,.5,.05,.08,0,0,.45,b,.02,1);rb(g,.5,.05,.08,0,0,-.45,b,.02,1);box(g,.08,.06,1.0,0,.05,0,b);
  bar(g,.03,[0,.1,-.15],[0,.82,-.3],b,10);bar(g,.03,[0,.1,.15],[0,1.0,.4],b,10);bar(g,.025,[0,.45,-.22],[0,.55,.3],b,10);
  add(g,cylGeo(.25,.25,.05,28),MAT.steel,0,.3,.42).rotation.z=HP;add(g,torGeo(.25,.02),b,0,.3,.42).rotation.y=HP;box(g,.06,.26,.42,0,.4,.3,b);
  rb(g,.17,.06,.28,0,.85,-.3,MAT.leatherDark,.025,1);
  rod(g,.018,.5,0,1.03,.4,MAT.chrome,0,HP,8);[-1,1].forEach(s=>rod(g,.018,.3,s*.25,1.03,.55,MAT.chrome,HP,0,8));rb(g,.14,.08,.04,0,1.08,.44,MAT.tv,.01,1).rotation.x=-.4;
  [-1,1].forEach(s=>{rod(g,.012,.17,s*.07,.3,.05,MAT.gray2,s*.7,0);rb(g,.04,.015,.09,s*.1,.3+s*.06,.05+s*.05,MAT.rubber,.005,1)})};
F.powerRack=(g,it)=>{const w=it.w||1.3,d=it.d||1.3,h=it.h||2.2,b=MAT.black;box(g,w-.1,.02,d-.1,0,0,0,MAT.rubber);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>box(g,.075,h,.075,a*(w/2-.04),0,c*(d/2-.04),MAT.rackSteel));
  [-1,1].forEach(c=>box(g,w,.075,.075,0,h-.075,c*(d/2-.04),b));[-1,1].forEach(a=>box(g,.075,.075,d,a*(w/2-.04),h-.075,0,b));
  rod(g,.016,w-.15,0,h-.2,-d/2+.04,b,0,HP,10);[-1,1].forEach(a=>box(g,.1,.1,.12,a*(w/2-.04),1.0,d/2+.03,b));[-1,1].forEach(a=>box(g,.03,.03,d-.1,a*(w/2-.04),.65,0,b));
  rod(g,.015,2.2,0,1.1,d/2+.02,MAT.chrome,0,HP,10);
  const pl=[];[-1,1].forEach(s=>{pl.push({p:[s*.72,1.1,d/2+.02],r:[0,0,HP],c:0x1d1e20});pl.push({p:[s*.78,1.1,d/2+.02],r:[0,0,HP],s:[.85,1,.85],c:0xa8332a});pl.push({p:[s*.84,1.1,d/2+.02],r:[0,0,HP],s:[.7,1,.7],c:0x1d1e20});
    [.5,.9].forEach((y,i)=>{rod(g,.014,.3,s*(w/2-.04),y,-d/2-.17,b,HP,0,8);pl.push({p:[s*(w/2-.04),y,-d/2-.12],r:[HP,0,0],s:[1-i*.15,1,1-i*.15],c:0x1d1e20});pl.push({p:[s*(w/2-.04),y,-d/2-.18],r:[HP,0,0],s:[.8-i*.15,1,.8-i*.15],c:0x1d1e20})})});
  inst(g,cylGeo(.225,.225,.045,24),MAT.inst,pl)};
F.bench=(g,it)=>{const b=MAT.black,m=MAT.leatherDark;rb(g,.3,.07,.72,0,.44,.22,m,.025);const p=pivot(g,0,.44,-.14,.55);rb(p,.3,.07,.56,0,0,-.28,m,.025);
  box(g,.06,.42,.06,0,0,.3,b);box(g,.4,.04,.08,0,0,.3,b);box(g,.06,.3,.06,0,0,-.3,b);box(g,.5,.04,.1,0,0,-.3,b);box(g,.06,.06,.66,0,.1,0,b);bar(g,.02,[0,.3,-.3],[0,.6,-.42],b)};
F.dumbbells=(g,it)=>{const w=it.w||1.3,b=MAT.black;[-1,1].forEach(s=>{const x=s*(w/2-.03);rod(g,.02,.8,x,.4,.14,b,.35,0,8);rod(g,.02,.8,x,.4,-.14,b,-.35,0,8);box(g,.08,.04,.6,x,0,0,b)});
  const heads=[],hd=[];for(let r=0;r<2;r++){const y=r?.69:.35,zr=r?.1:.17;[-1,1].forEach(s=>box(g,w-.1,.03,.03,0,y-.03,s*zr,b));
    for(let i=0;i<6;i++){const x=-w/2+.14+i*(w-.28)/5,sc=.7+i*.1+r*.25;hd.push({p:[x,y+.035*sc,0],r:[HP,0,0]});[-1,1].forEach(s=>heads.push({p:[x,y+.04*sc,s*.085],r:[HP,0,0],s:[sc,1,sc]}))}}
  inst(g,cylGeo(.014,.014,.2,8),MAT.chrome,hd);inst(g,cylGeo(.04,.04,.05,6),MAT.rubber,heads)};

// ----- cinema e estúdio
F.cinemaSeat=(g,it)=>{const n=it.ns||1,arm=.16,sw=it.w?Math.max(.55,(it.w-(n+1)*arm)/n):.7,w=n*sw+(n+1)*arm,d=.95,m=mat(it,'leather');
  for(let i=0;i<=n;i++){const x=-w/2+arm/2+i*(sw+arm);rb(g,arm,.6,d-.1,x,0,-.03,m,.04);add(g,torGeo(.045,.01),MAT.chrome,x,.605,.25).rotation.x=HP;add(g,cylGeo(.04,.04,.01,14),MAT.rubber,x,.6,.25)}
  for(let i=0;i<n;i++){const x=-w/2+arm+sw/2+i*(sw+arm);rb(g,sw,.3,d-.15,x,0,0,m,.03,1);rb(g,sw,.14,.52,x,.3,.08,m,.06);
    const p=pivot(g,x,.3,-d/2+.2,-.22);rb(p,sw,.7,.18,0,0,0,m,.07);rb(p,sw-.06,.18,.2,0,.68,-.02,m,.07);
    const f=pivot(g,x,.3,d/2-.08,-.6);rb(f,sw-.04,.4,.1,0,-.4,0,m,.04,1)}};
F.screen=(g,it)=>{const w=it.w,h=it.h||w*.5625,y=it.y??.6;rb(g,w+.1,h+.1,.05,0,y-.05,0,MAT.black,.01,1);box(g,w,h,.01,0,y,.026,MAT.tvScreen);box(g,w+.1,.03,.055,0,y-.08,0,MAT.gray2)};
F.projector=(g,it)=>{const y=it.y??2.35,top=2.7;rod(g,.015,top-y-.14,0,(top+y+.14)/2,0,MAT.black);box(g,.12,.02,.12,0,top-.02,0,MAT.black);rb(g,.4,.13,.33,0,y,0,MAT.white,.02,1);
  add(g,cylGeo(.045,.05,.05,16),MAT.black,.1,y+.07,.165).rotation.x=HP;add(g,cylGeo(.03,.03,.005,14),MAT.glassDark,.1,y+.07,.19).rotation.x=HP;
  const v=[];for(let i=0;i<4;i++)v.push({p:[-.1+i*.03,y+.135,0],s:[.008,.004,.26]});inst(g,BOX,MAT.gray2,v)};
F.podTable=(g,it)=>{const r=it.w/2,n=it.seats||4;cyl(g,r,.05,0,.7,0,MAT.walnut,40,r*.98);cyl(g,.1,.7,0,0,0,MAT.black,16,.08);cyl(g,.35,.03,0,0,0,MAT.black,28);
  rb(g,.36,.05,.26,0,.75,0,MAT.black,.01,1);const kn=[];for(let i=0;i<8;i++)kn.push({p:[-.12+(i%4)*.08,.805,-.05+Math.floor(i/4)*.1]});inst(g,cylGeo(.012,.012,.015,8),MAT.gray2,kn);
  for(let i=0;i<n;i++){const a=i/n*PI*2+PI/4,cx=Math.cos(a),cz=Math.sin(a);
    const c=new THREE.Group();c.position.set(cx*(r+.45),0,cz*(r+.45));c.rotation.y=Math.atan2(-cx,-cz);g.add(c);F.officeChair(c,{m:'leatherDark'});
    const bx=cx*(r-.06),bz=cz*(r-.06),jx=cx*(r-.2),jz=cz*(r-.2),mx=cx*(r+.12),mz=cz*(r+.12);
    bar(g,.012,[bx,.75,bz],[jx,1.15,jz],MAT.black);bar(g,.012,[jx,1.15,jz],[mx,1.05,mz],MAT.black);sph(g,.02,jx,1.15,jz,MAT.black);
    bar(g,.025,[mx,1.05,mz],[mx+cx*.03,.97,mz+cz*.03],MAT.black,12);sph(g,.045,mx+cx*.03,.96,mz+cz*.03,MAT.rubber);
    const hx=Math.cos(a+.55)*(r-.3),hz=Math.sin(a+.55)*(r-.3);tor(g,.085,.012,hx,.765,hz,MAT.black,true,PI).rotation.set(HP,0,-a);
    [-1,1].forEach(s=>add(g,cylGeo(.04,.04,.03,12),MAT.black,hx+s*.085*Math.cos(a),.74,hz-s*.085*Math.sin(a)))}};
F.camera=(g,it)=>{const h=it.h||1.45,b=MAT.black;for(let i=0;i<3;i++){const a=i/3*PI*2+PI/6;bar(g,.012,[Math.cos(a)*.3,0,Math.sin(a)*.3],[0,h-.1,0],b)}cyl(g,.03,.14,0,h-.14,0,b,10);box(g,.12,.05,.14,0,h,0,b);
  rb(g,.17,.12,.22,0,h+.05,0,b,.015,1);add(g,cylGeo(.045,.04,.14,16),b,0,h+.11,.18).rotation.x=HP;add(g,cylGeo(.035,.035,.004,16),MAT.glassDark,0,h+.11,.252).rotation.x=HP;
  rb(g,.1,.07,.01,-.1,h+.07,-.02,MAT.monitor,.004,1).rotation.y=.6;sph(g,.008,.05,h+.17,-.11,MAT.redOn);box(g,.06,.04,.06,0,h+.17,.02,b)};
F.softbox=(g,it)=>{const b=MAT.black,h=1.1;for(let i=0;i<3;i++){const a=i/3*PI*2+PI/6;bar(g,.01,[Math.cos(a)*.35,0,Math.sin(a)*.35],[0,h,0],b)}cyl(g,.014,.85,0,h-.05,0,b,8);
  const p=pivot(g,0,1.9,0,.3);add(p,cylGeo(.42,.08,.4,4),b,0,0,0).rotation.set(HP,PI/4,0);box(p,.56,.56,.02,0,-.28,.21,MAT.lightOn);bar(g,.012,[0,1.9,0],[0,1.9,-.14],b)};

// ----- exterior e plantas
F.lounger=(g,it)=>{const w=it.w||.7,d=it.d||1.9,t=MAT.teak;[-1,1].forEach(s=>box(g,.05,.08,d,s*(w/2-.03),.2,0,t));legs(g,w,d,.2,.02,t,.08);
  const sl=[],n=Math.floor(d*.66/.07);for(let i=0;i<n;i++)sl.push({p:[0,.265,d/2-.06-i*.07],s:[w-.1,.02,.045]});inst(g,BOX,t,sl);
  rb(g,w-.1,.07,d*.62,0,.28,d/2-d*.31-.02,MAT.linen,.03);
  const p=pivot(g,0,.28,-d/2+d*.34,.75);box(p,w-.1,.03,d*.36,0,0,-d*.18,t);rb(p,w-.1,.07,d*.34,0,.03,-d*.18,MAT.linen,.03);
  add(g,cylGeo(.06,.06,.3,12),MAT.orange,0,.37,d*.12).rotation.z=HP};
F.umbrella=(g,it)=>{const r=it.w/2,key=it.m||'linen',cm=CANM[key]||(CANM[key]=MT(MAT[key]?hex(MAT[key]):0xe6dfd1,'stripes',{roughness:.9,side:DS}));
  cyl(g,.3,.06,0,0,0,MAT.concrete,24,.28);box(g,.5,.05,.5,0,0,0,MAT.concrete);cyl(g,.025,2.25,0,.06,0,MAT.teak,10);
  add(g,geo('can'+r,()=>new THREE.CylinderGeometry(.03,r,.5,8,1,true)),cm,0,2.45,0);
  const ribs=[],L=Math.hypot(r-.03,.5);for(let i=0;i<8;i++){const a=i/8*PI*2;ribs.push({p:[Math.cos(a)*r/2,2.44,Math.sin(a)*r/2],q:qDir(new THREE.Vector3(Math.cos(a)*(r-.03),-.5,Math.sin(a)*(r-.03))),s:[1,L,1]})}
  inst(g,cylGeo(.008,.008,1,6),MAT.teak,ribs);tor(g,r,.012,0,2.2,0,cm);sph(g,.03,0,2.73,0,MAT.teak)};
F.plant=(g,it)=>{const h=it.h||1.6,r=rng(h*37+1),pm=mat(it,'pot');cyl(g,.2,.42,0,0,0,pm,20,.24);tor(g,.24,.02,0,.42,0,pm);cyl(g,.22,.02,0,.4,0,MAT.soil,20);
  const st=[],lv=[];const leaf=(a,L,tilt,big,c)=>{const dir=new THREE.Vector3(Math.sin(tilt)*Math.cos(a),Math.cos(tilt),Math.sin(tilt)*Math.sin(a));
    st.push({p:[dir.x*L/2,.42+dir.y*L/2,dir.z*L/2],q:qDir(dir),s:[1,L,1]});
    const ld=new THREE.Vector3(Math.cos(a),-.5,Math.sin(a));lv.push({p:[dir.x*L+ld.x*.12*big,.42+dir.y*L-.02,dir.z*L+ld.z*.12*big],q:qDir(ld,FWD),s:[big*.13,big*.035,big*.2],c})};
  for(let i=0;i<7;i++)leaf(i/7*PI*2+r()*.5,h*(.4+r()*.3),.25+r()*.3,1+r()*.4,i%2?0x3d6a39:0x4f8040);
  for(let i=0;i<6;i++)leaf(i/6*PI*2+.4+r()*.5,h*(.22+r()*.2),.6+r()*.35,.8+r()*.3,i%2?0x5c8b45:0x3d6a39);
  for(let i=0;i<3;i++)leaf(i/3*PI*2+1+r()*.5,h*(.55+r()*.15),.1+r()*.15,.9,0x4f8040);
  inst(g,cylGeo(.008,.008,1,6),MAT.plant,st);inst(g,SPH,MAT.leafI,lv)};
F.palm=(g,it)=>{const h=it.h||2.2,r=rng(h*53+1),pm=mat(it,'pot');cyl(g,.26,.5,0,0,0,pm,20,.3);tor(g,.3,.025,0,.5,0,pm);cyl(g,.28,.02,0,.48,0,MAT.soil,20);
  cyl(g,.065,h-.9,0,.5,0,MAT.trunk,10,.045);const fr=[],top=h-.42;
  for(let i=0;i<11;i++){const a=i/11*PI*2+r()*.3,tilt=.8+r()*.5,L=1.0+r()*.5;fr.push({p:[0,top,0],r:[-(HP-tilt),HP-a,0,'YXZ'],s:[1,1,L],c:i%2?0x3f7a3c:0x5a9a48})}
  for(let i=0;i<4;i++){const a=i/4*PI*2+.3;fr.push({p:[0,top+.02,0],r:[-(HP-.25),HP-a,0,'YXZ'],s:[.7,.8,.7],c:0x6aa650})}
  inst(g,FROND(),MAT.leafI,fr)};
F.floorLamp=(g,it)=>{const b=MAT.black;cyl(g,.17,.03,0,0,0,b,24);rod(g,.012,1.7,0,.88,0,b);add(g,torGeo(.5,.012,HP,8,16),b,0,1.73,.5).rotation.set(0,-HP,HP);
  rod(g,.012,.4,0,2.23,.7,b,HP,0);rod(g,.004,.14,0,2.16,.9,b);add(g,cylGeo(.18,.2,.25,24,true),MAT.shade,0,1.96,.9);sph(g,.035,0,1.98,.9,MAT.lightOn)};
F.pendant=(g,it)=>{const w=it.w||1.2,y=it.y??1.85,top=2.7;rod(g,.004,top-y-.05,-w/2+.12,(top+y)/2,0,MAT.black);rod(g,.004,top-y-.05,w/2-.12,(top+y)/2,0,MAT.black);rb(g,w,.05,.09,0,y,0,MAT.black,.01,1);box(g,w-.06,.006,.06,0,y-.004,0,MAT.lightOn);box(g,.3,.03,.1,0,top-.03,0,MAT.black)};
F.spa=(g,it)=>{const r=it.w/2;add(g,cylGeo(r*.98,r,.78,40,true),MAT.travDS,0,.39,0);cyl(g,r,.08,0,0,0,MAT.trav,40,r*.98);tor(g,r-.03,.05,0,.78,0,MAT.trav);
  cyl(g,r-.08,.56,0,.1,0,MAT.spaInner,40);tor(g,r-.24,.1,0,.46,0,MAT.spaInner);cyl(g,r-.07,.02,0,.68,0,MAT.water,40);box(g,.8,.2,.4,0,0,r+.2,MAT.trav);box(g,.8,.4,.2,0,0,r+.1,MAT.trav)};
F.coatRack=(g,it)=>{const b=MAT.black;cyl(g,.18,.025,0,0,0,b,20,.14);cyl(g,.016,1.75,0,.025,0,b,10);const hk=[],tips=[];
  for(let i=0;i<5;i++){const a=i/5*PI*2;hk.push({p:[Math.cos(a)*.1,1.7,Math.sin(a)*.1],r:[Math.sin(a)*.9,0,-Math.cos(a)*.9]});tips.push({p:[Math.cos(a)*.19,1.78,Math.sin(a)*.19],s:[.018,.018,.018]})}
  inst(g,cylGeo(.008,.008,.25,8),b,hk);inst(g,SPH,b,tips);
  rb(g,.34,.82,.13,.14,.82,.1,MAT.charcoal,.05);rb(g,.4,.08,.15,.14,1.6,.1,MAT.charcoal,.03,1);rb(g,.06,.5,.04,-.12,1.15,.12,MAT.terracotta,.015,1).rotation.z=.1;
  cyl(g,.07,.06,0,1.78,0,MAT.sand,16,.09);cyl(g,.16,.015,0,1.76,0,MAT.sand,20)};

// ----- garagem
F.car=(g,it)=>{const w=it.w,d=it.d,m=mat(it,'car'),bh=.52,by=.3;rb(g,w,bh,d,0,by,0,m,.08);rb(g,w*.9,.5,d*.46,0,by+bh-.06,-d*.06,m,.12);
  box(g,w*.9+.012,.26,d*.46-.1,0,by+bh+.06,-d*.06,MAT.glassDark);box(pivot(g,0,by+bh-.02,d*.17,-.62),w*.84,.5,.03,0,0,0,MAT.glassDark);box(pivot(g,0,by+bh-.02,-d*.29,.7),w*.84,.44,.03,0,0,0,MAT.glassDark);
  box(pivot(g,0,by+bh-.02,d*.17,-.62),w*.9,.06,.06,0,-.02,-.02,m);
  const tr=[],rm=[];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{tr.push({p:[a*(w/2-.1),.34,b*(d/2-.85)],r:[0,0,HP]});rm.push({p:[a*(w/2-.1),.34,b*(d/2-.85)],r:[0,0,HP]})});
  inst(g,cylGeo(.34,.34,.22,20),MAT.tire,tr);inst(g,cylGeo(.2,.2,.235,16),MAT.chrome,rm);
  [-1,1].forEach(s=>{box(g,.3,.1,.03,s*(w/2-.25),.75,d/2-.01,MAT.lightOn);box(g,.26,.08,.03,s*(w/2-.22),.78,-d/2-.01,MAT.redOn);box(g,.06,.08,.14,s*(w*.45+.03),1.02,d*.18,m)});
  box(g,w*.45,.12,.02,0,.62,d/2,MAT.tv);box(g,w*.25,.1,.01,0,.42,d/2+.002,MAT.white);box(g,w*.2,.08,.01,0,.5,-d/2-.002,MAT.white);
  if(it.suv||(it.h||0)>1.6){[-1,1].forEach(s=>box(g,.04,.04,d*.4,s*w*.35,by+bh+.5,-d*.05,MAT.black))}};
F.bikeRack=(g,it)=>{const w=it.w||1.2,b=MAT.black;rb(g,w,.05,.06,0,1.85,-.02,b,.01,1);
  [-1,1].forEach(s=>{const x=s*w/4;add(g,torGeo(.06,.01,PI,8,12),b,x,1.78,.08).rotation.set(0,-HP,PI);
    const bk=new THREE.Group();bk.position.set(x,.87,.55);bk.rotation.x=-HP;g.add(bk);
    [.55,-.5].forEach(z=>{add(bk,torGeo(.33,.02,PI*2,8,28),MAT.tire,0,.33,z).rotation.y=HP;add(bk,cylGeo(.3,.3,.012,24),MAT.gray,0,.33,z).rotation.z=HP});
    const BB=[0,.28,-.1],HT=[0,.95,.42],ST=[0,.95,-.3],FH=[0,.33,.55],RH=[0,.33,-.5];
    bar(bk,.014,HT,BB,b);bar(bk,.014,BB,ST,b);bar(bk,.014,HT,ST,b);bar(bk,.012,BB,RH,b);bar(bk,.012,ST,RH,b);bar(bk,.012,HT,FH,b);
    rod(bk,.012,.5,0,1.0,.42,b,0,HP);rb(bk,.1,.04,.26,0,.95,-.3,MAT.leatherDark,.015,1)})};

window.FURN={F,MAT,M,T,rbGeo};
})();
