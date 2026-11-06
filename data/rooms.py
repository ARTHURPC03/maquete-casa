import json,sys,math
def I(t,n,w=1,d=1,x=0,z=0,r=0,k=None,q=1,ref=False,**kw):
    o=dict(t=t,n=n,w=w,d=d,x=x,z=z)
    if r:o['r']=round(r,1)
    if k:o['k']=k
    if q!=1:o['q']=q
    if ref:o['ref']=True
    o.update(kw);return o
def P(n,k,q=1):  # item só de preço, sem desenho
    return I('none',n,k=k,q=q)
def face(x,z):   # rotação para o objeto em (x,z) olhar para o centro
    return -math.degrees(math.atan2(-x,-z))
R=[]
def room(id,floor,name,x,z,dim,area,note,base=(),opts=(),rot=0,fl=None,df=None,fix=()):
    o=dict(id=id,floor=floor,name=name,x=x,z=z,rot=rot,dim=dim,area=area,note=note,base=list(base),opts=list(opts))
    if fix:o['fix']=[dict(i,ref=True) for i in fix]
    if fl:o['fl']=fl
    if df:o['def']=df
    R.append(o)
def opt(id,name,desc,items,foto=None):
    o=dict(id=id,name=name,desc=desc,items=items)
    if foto:o['foto']=foto
    return o
# ================= GARAGEM
room('gar','garagem','Garagem',13.1,15.6,'11,9 × 6,7 m',80,
 'Porcelanato bege. Cabem 3 carros. Depósito embaixo da escada, porta de vidro para o hall.',
 base=[I('car','Porsche (visto no vídeo)',1.95,4.5,x=-4.3,z=0.6,ref=True)],
 opts=[opt('org','Garagem organizada','Três vagas livres e uma parede de armários para ferramentas, malas e equipamento de gravação.',[
   I('car','Vaga 1',1.95,4.5,x=-4.3,z=0.6,ref=True),I('car','Vaga 2',1.95,4.5,x=-1.1,z=0.6,ref=True),I('car','Vaga 3',1.95,4.5,x=2.1,z=0.6,ref=True),
   I('cabinet','Armário de garagem com portas',2.4,0.55,x=-3.6,z=-3.05,h=2.1),
   I('steelShelf','Estante de aço para caixas',1.8,0.5,x=-0.9,z=-3.05,h=2.0)])],
 fl=dict(w=11.9,d=6.7,m='porcBege'))
# ================= TÉRREO
pk=lambda x,z:[I('poker','Mesa de poker oval 9 lugares',2.4,1.25,x=x,z=z,k='poker'),P('Cadeiras giratórias para o poker','pokerChair',9),
               I('pendant','Pendente linear sobre a mesa',1.8,0.1,x=x,z=z,k='pendente')]
room('jogos','terreo','Salão de jogos',13.15,15.2,'11,7 × 6,7 m',78,
 'Porcelanato branco polido, janelas em faixa com persiana rolô e split. Uma viga e um pilar dividem o salão em dois vãos de ~5,8 m. Nos vídeos o salão tinha o bilhar, o ping-pong e dois cabideiros. TV com rack não aparece aqui: ela está na sala de estar do 1º pavimento.',
 base=[I('poolTable','Mesa de bilhar (vista no vídeo)',2.5,1.4,x=-3.0,ref=True),I('pingpong','Mesa de ping-pong (vista no vídeo)',2.74,1.53,x=3.1,ref=True),
       I('coatRack','Cabideiros de pé (vistos no vídeo)',0.4,0.4,x=5.4,z=-2.9,ref=True),I('coatRack','Cabideiro (visto)',0.4,0.4,x=5.0,z=-3.0,ref=True)],
 opts=[
  opt('pokertv','Poker + TV + academia','Como vocês pensaram: academia na ponta esquerda, duas mesas de poker no meio e uma sala de TV na ponta direita. As mesas de 2,4 m cabem lado a lado com 1 m de circulação.',[
    I('rug','Piso de borracha da academia (m²)',3.4,6.4,x=-4.1,m='rubber',k='pisoBorracha',q=22),
    I('treadmill','Esteira',0.85,2.0,x=-5.1,z=-1.6,k='esteira'),I('bike','Bicicleta de spinning',0.55,1.1,x=-3.9,z=-2.3,k='bike'),
    I('powerRack','Gaiola / power rack',1.3,1.3,x=-3.6,z=1.7,k='powerRack'),I('bench','Banco regulável',0.4,1.3,x=-4.9,z=1.4,k='banco'),
    I('dumbbells','Kit de halteres com suporte',1.3,0.45,x=-5.55,z=-0.1,r=-90,k='halteres'),I('mirror','Espelho de parede',2.6,0.03,x=-5.82,z=1.2,r=-90,k='espelho'),
    *pk(0,-1.6),*pk(0,1.6),
    I('slat','Painel ripado de madeira (marcenaria)',3.2,0.04,x=5.8,z=0,r=90,h=2.6),
    I('tv','TV 85" na parede',1.9,0.05,x=5.76,z=0,r=90,y=0.75,k='tv85'),
    I('sofaL','Sofá modular em L',3.0,2.1,x=3.3,z=0.2,r=-90,m='boucle',k='sofaL'),
    I('coffee','Mesa de centro de travertino',1.0,0.6,x=4.8,z=0.1,round=True,k='mesaCentro'),
    I('rug','Tapete 2 × 3 m',3.0,2.4,x=4.4,z=0.1,m='sand',k='tapete23'),
    I('bar','Bar com prateleiras iluminadas (marcenaria)',2.0,0.5,x=3.8,z=-3.05),
    I('fridge','Adega climatizada',0.6,0.6,x=5.3,z=-3.0,h=0.85,m='black',k='adega'),
    I('palm','Palmeira em vaso',0.6,0.6,x=5.4,z=2.9,k='planta')],foto='salao'),
  opt('cinepoker','Cinema + poker','Meio salão vira cinema (tela de 120", duas fileiras de poltronas reclináveis, painéis acústicos e blackout) e a outra metade fica com as duas mesas de poker. A academia vai para a sala de vidro.',[
    I('screen','Tela de projeção 120"',2.66,0.05,x=-5.78,z=0,r=-90,y=0.55,k='tela120'),I('projector','Projetor 4K a laser',0.4,0.35,x=-1.2,z=0,k='projetor'),
    P('Soundbar / receiver Dolby Atmos','soundbar'),
    I('cinemaSeat','Poltronas de cinema (fileira 1)',2.98,0.95,x=-3.0,z=0,r=90,ns=3,k='cinemaSeat',q=3),
    I('cinemaSeat','Poltronas de cinema (fileira 2)',2.98,0.95,x=-1.5,z=0,r=90,ns=3,k='cinemaSeat',q=3),
    I('acoustic','Painéis acústicos (m²)',5.4,0.05,x=-3.0,z=-3.3,k='painelAcustico',q=10,h=1.8),
    I('curtain','Cortina blackout nas janelas',5.4,0.06,x=-3.0,z=3.25,r=180,k='cortina',q=2),
    I('rug','Carpete do cinema',5.2,6.2,x=-3.0,z=0,m='charcoal',k='tapete34',q=2),
    *pk(3.1,-1.6),*pk(3.1,1.6),
    I('bar','Bar com prateleiras iluminadas (marcenaria)',2.0,0.5,x=4.6,z=-3.05),I('fridge','Adega climatizada',0.6,0.6,x=5.5,z=2.9,h=0.85,m='black',k='adega')],foto='salao2'),
  opt('hoje','Manter bilhar e ping-pong','Se o bilhar e o ping-pong ficarem com a casa, só entram uma TV e um sofá para quem assiste.',[
    I('poolTable','Mesa de bilhar (vista no vídeo)',2.5,1.4,x=-3.0,ref=True),I('pingpong','Mesa de ping-pong (vista no vídeo)',2.74,1.53,x=3.1,ref=True),
    I('sofa','Sofá 3 lugares',2.3,0.95,x=-3.0,z=2.55,r=180,k='sofa3'),I('tv','TV 75" na parede',1.7,0.05,x=-3.0,z=-3.3,y=0.9,k='tv75'),
    I('stool','Banquetas altas',0.4,0.4,x=2.4,z=-2.8,k='banqueta'),I('stool','Banquetas altas',0.4,0.4,x=3.1,z=-2.8),I('stool','Banquetas altas',0.4,0.4,x=3.8,z=-2.8),P('(+2 banquetas)','banqueta',2),
    I('fridge','Adega climatizada',0.6,0.6,x=5.3,z=-3.0,h=0.85,m='black',k='adega')])],
 df='pokertv',fl=dict(w=11.7,d=6.7,m='porcBranco'))
pod=[I('rug','Tapete redondo',2.8,2.8,z=0.3,round=True,m='olive',k='tapete23'),
     I('podTable','Mesa de podcast redonda com 4 microfones',1.4,1.4,z=0.3,seats=4,k='mesaPodcast'),
     P('Cadeiras para o podcast','cadeiraErgo',4),P('Microfones Shure SM7B','sm7b',4),P('Braços articulados','braco',4),
     P('Mesa de som RØDECaster Pro II','rodecaster'),P('Fones de monitoração','fone',4)]
for (cx,cz) in [(-2.1,2.0),(0,2.7),(2.1,2.0)]:
    pod.append(I('camera','Câmera no tripé',0.4,0.4,x=cx,z=cz,r=face(cx,cz-0.3),k='camera' if cx==-2.1 else None,**({'q':3} if cx==-2.1 else {})))
for (cx,cz) in [(-2.4,-1.0),(2.4,-1.0)]:
    pod.append(I('softbox','Luz de estúdio (softbox)',0.6,0.6,x=cx,z=cz,r=face(cx,cz-0.3),k='luzEstudio' if cx<0 else None))
for a in (-45,0,45):
    rr=math.radians(a);pod.append(I('acoustic','Painéis acústicos na parede de pedra (m²)',1.9,0.05,x=3.05*math.sin(rr),z=-3.05*math.cos(rr),r=-a,h=1.8,k='painelAcustico' if a==0 else None,**({'q':10} if a==0 else {})))
for a in (130,180,230):
    rr=math.radians(a);pod.append(I('curtain','Cortina blackout no vidro',2.4,0.06,x=3.15*math.sin(rr),z=-3.15*math.cos(rr),r=-a,k='cortina' if a==180 else None,**({'q':3} if a==180 else {})))
pod+= [I('neon','Letreiro neon',1.0,0.03,z=-3.2,y=1.9),I('palm','Planta grande',0.6,0.6,x=2.5,z=-1.9,k='planta')]
cin=[I('screen','Tela de projeção 120"',2.66,0.05,z=-3.05,y=0.55,k='tela120'),I('projector','Projetor 4K a laser',0.4,0.35,z=2.2,k='projetor'),P('Soundbar / receiver Dolby Atmos','soundbar'),
     I('cinemaSeat','Poltronas de cinema (fileira 1)',2.98,0.95,z=-0.3,r=180,ns=3,k='cinemaSeat',q=3),
     I('cinemaSeat','Poltronas de cinema (fileira 2)',2.98,0.95,z=1.3,r=180,ns=3,k='cinemaSeat',q=3),
     I('rug','Tapete grande',5.2,5.2,round=True,m='charcoal',k='tapete34')]
for a in (120,180,240,60,300):
    rr=math.radians(a);cin.append(I('curtain','Cortina blackout de veludo',2.6,0.06,x=3.2*math.sin(rr),z=-3.2*math.cos(rr),r=-a,m='charcoal',k='cortina' if a==180 else None,**({'q':4} if a==180 else {})))
gymR=[I('rug','Piso de borracha (m²)',4.4,4.4,round=True,m='rubber',k='pisoBorracha',q=15),I('treadmill','Esteira',0.85,2.0,x=-2.0,z=0.4,k='esteira'),
      I('bike','Bicicleta de spinning',0.55,1.1,x=-0.9,z=1.9,k='bike'),I('powerRack','Gaiola / power rack',1.3,1.3,x=1.2,z=-1.4,k='powerRack'),
      I('bench','Banco regulável',0.4,1.3,x=1.5,z=0.9,k='banco'),I('dumbbells','Kit de halteres com suporte',1.3,0.45,x=2.3,z=1.7,r=-30,k='halteres'),
      I('mirror','Espelho',2.4,0.03,z=-3.1,k='espelho')]
room('redonda','terreo','Sala redonda (sob a piscina)',25.6,18.9,'Ø 7 m',38.5,
 'Fica meio nível abaixo do salão, embaixo da piscina. Vinílico amadeirado, vidro curvo com cortina voil, parede de pedra nos fundos e split. A planta chama de academia. Está vazia.',
 opts=[opt('podcast','Estúdio de podcast','Mesa redonda para 4, três câmeras, duas luzes, painéis acústicos na parede de pedra e blackout no vidro. O vidro curvo vira cenário de fundo quando a cortina está aberta.',pod,foto='redonda'),
       opt('cinema','Cinema privativo','Blackout de veludo em todo o vidro, tela de 120" na parede de pedra e 6 poltronas reclináveis.',cin,foto='redonda2'),
       opt('academia','Academia (uso original)','Do jeito que a planta previu.',gymR)],
 df='podcast',fl=dict(w=6.9,d=6.9,m='vinilico',circle=True))
room('vidro','terreo','Sala de vidro',27.9,11.0,'4,3 × 4,9 m',21,
 'Vazia, com portas de correr de vidro para o deck e o jardim e uma parede inteira de espelho, o que já ajuda a ser academia.',
 fix=[I('mirrorWall','Parede de espelho (já tem)',4.0,0.02,x=-2.12,z=0,r=-90,h=2.5)],
 opts=[opt('edicao','Ilha de edição / escritório','Duas estações para editar os vídeos, estante e um sofá para reunião. Faz par com o estúdio da sala redonda.',[
         I('desk','Escrivaninha',1.6,0.75,x=-0.95,z=-1.7,k='escrivaninha',q=2),I('desk','Escrivaninha',1.6,0.75,x=0.95,z=-1.7),
         I('officeChair','Cadeira ergonômica',0.6,0.6,x=-0.95,z=-0.95,r=180,k='cadeiraErgo',q=2),I('officeChair','Cadeira ergonômica',0.6,0.6,x=0.95,z=-0.95,r=180),
         I('shelf','Estante',1.8,0.4,x=1.9,z=0.4,r=90,h=1.9),I('sofa','Sofá 2 lugares',1.8,0.9,x=0.3,z=1.6,r=180,k='sofa3'),
         I('rug','Tapete 2 × 3 m',2.8,2.0,x=0.3,z=1.0,k='tapete23'),I('plant','Planta',0.5,0.5,x=1.8,z=2.0,k='planta')]),
       opt('gym','Academia com vista','Se o salão ficar com o cinema, a academia vem para cá, de frente para o jardim.',[
         I('rug','Piso de borracha (m²)',4.0,4.6,m='rubber',k='pisoBorracha',q=18),I('treadmill','Esteira',0.85,2.0,x=-1.3,z=0.6,r=180,k='esteira'),
         I('bike','Bicicleta de spinning',0.55,1.1,x=-0.1,z=1.4,r=180,k='bike'),I('powerRack','Gaiola / power rack',1.3,1.3,x=1.2,z=-1.4,k='powerRack'),
         I('bench','Banco regulável',0.4,1.3,x=1.3,z=0.7,k='banco'),I('dumbbells','Kit de halteres com suporte',1.3,0.45,x=-1.0,z=-2.15,k='halteres'),
         ],foto='vidro')],
 df='edicao',rot=42,fl=dict(w=4.3,d=4.9,m='porcBranco'))
room('sauna','terreo','Sauna e banheiro',23.4,8.2,'4,8 + 3,5 m²',11,
 'Sauna de 4,81 m², hall de 2,75 m² e banheiro de 3,51 m² pela prancha de detalhe. Não aparece nos vídeos. Nada a comprar.',rot=42)
# ================= 1º PAVIMENTO
room('tv','p1','Sala de TV',5.0,11.15,'3,85 × 3,52 m',13.5,
 'Paredes cinza e persiana de madeira. No vídeo só tinha uma mesinha de rattan.',
 opts=[opt('tv','Sala de TV','Sofá retrátil de frente para uma TV de 65".',[
         I('sofa','Sofá retrátil 3 lugares',2.4,1.0,z=0.95,r=180,m='charcoal',k='sofaRet'),I('rack','Rack baixo',1.8,0.45,z=-1.5,k='rack'),
         I('tv','TV 65"',1.45,0.05,z=-1.68,y=0.85,k='tv65'),I('coffee','Mesa de centro',0.9,0.6,z=-0.2,k='mesaCentro'),
         I('rug','Tapete 2 × 2,5 m',2.5,2.0,z=0.1,k='tapete23'),I('floorLamp','Luminária de piso',0.4,0.4,x=1.55,z=1.25,k='luminariaPiso')]),
       opt('office','Escritório','Mesa voltada para a janela, cadeira boa e estante.',[
         I('desk','Escrivaninha',1.6,0.75,z=-1.3,k='escrivaninha'),I('officeChair','Cadeira ergonômica',0.6,0.6,z=-0.55,r=180,k='cadeiraErgo'),
         I('shelf','Estante',1.8,0.4,x=-1.7,z=0.3,r=-90),I('armchair','Poltrona de leitura',0.8,0.8,x=1.2,z=1.0,r=200,k='poltrona'),I('rug','Tapete',2.0,1.6,z=0.3,k='tapete23')])],
 df='tv',fl=dict(w=3.85,d=3.52,m='porcBranco'))
room('estar','p1','Sala de estar',10.1,11.35,'5,85 × 4,1 m',24,
 'Sanca de gesso de 4,25 × 3,20 m no centro e painel de madeira com TV. No vídeo já tinha um sofá redondo de rattan.',
 fix=[I('slat','Painel de madeira da TV (já tem)',3.0,0.04,z=-1.95,h=2.4),I('tv','TV no painel (vista no vídeo)',1.6,0.05,z=-1.9,y=0.95)],
 base=[I('rattanRound','Sofá redondo de rattan (visto no vídeo)',2.2,2.2,x=-1.2,z=0.6,ref=True),I('rack','Rack branco (visto)',2.2,0.45,z=-1.68,m='white',ref=True),
       I('coffee','Mesa de centro de madeira (vista)',1.2,0.7,x=0.5,z=-0.3,m='walnut',ref=True),I('armchair','Poltronas de rattan (vistas)',0.75,0.75,x=1.9,z=0.6,r=200,m='rattan',ref=True),
       I('armchair','Poltrona de rattan (vista)',0.75,0.75,x=2.4,z=-0.6,r=240,m='rattan',ref=True)],
 opts=[opt('estar','Estar com sofá em L','Sofá modular de bouclé virado para o painel da TV, duas poltronas de couro e mesa redonda de travertino.',[
         I('rack','Rack branco (visto)',2.2,0.45,z=-1.68,m='white',ref=True),
         I('sofaL','Sofá modular em L',3.2,2.0,z=0.95,r=180,m='boucle',k='sofaL'),I('coffee','Mesa de centro de travertino',1.0,1.0,z=-0.45,round=True,k='mesaCentro'),
         I('armchair','Poltronas de couro',0.8,0.82,x=-2.2,z=-0.5,r=-90,k='poltrona',q=2),I('armchair','Poltronas de couro',0.8,0.82,x=2.2,z=-0.5,r=90),
         I('rug','Tapete 3 × 4 m',4.0,3.0,z=0.1,m='sand',k='tapete34'),I('floorLamp','Luminária de piso',0.4,0.4,x=2.5,z=1.5,k='luminariaPiso'),
         I('palm','Palmeira em vaso',0.6,0.6,x=-2.55,z=1.6,k='planta')],foto='estar')],
 df='estar',fl=dict(w=5.85,d=4.1,m='porcBranco'))
room('jantar','p1','Jantar',10.1,17.15,'5,7 × 3,9 m',22,
 'Faixa da frente com janelão para o mar, cortineiro na fachada inteira e ar-condicionado cassete. Já tinha uma mesa longa com 8 cadeiras.',
 base=[I('dining','Mesa de jantar com 8 cadeiras (vista no vídeo)',2.4,1.0,seats=8,ref=True)],
 opts=[opt('jantar','Jantar para 8','Mesa de nogueira com cadeiras de palhinha, pendente linear e buffet. Se a mesa do vídeo ficar com a casa, desconte a mesa e as cadeiras.',[
         I('dining','Mesa de jantar 8 lugares',2.6,1.05,seats=8,cm='walnut',cs='linen',k='mesaJantar8'),P('Cadeiras de jantar','cadeiraJantar',8),
         I('pendant','Pendente linear',1.8,0.1,k='pendente'),I('rack','Buffet / aparador',2.0,0.45,z=-1.7,h=0.75,k='aparador'),
         I('art','Quadro grande',1.4,0.03,z=-1.93,y=1.25,m='terracotta',k='quadro'),I('palm','Planta grande',0.6,0.6,x=2.5,z=-1.5,k='planta')])],
 df='jantar',fl=dict(w=5.7,d=3.9,m='porcBranco'))
room('estar2','p1','Estar da frente',16.0,17.15,'5,9 × 3,9 m',23,
 'Mesma faixa envidraçada do jantar, com vista do mar. No vídeo tinha 2 poltronas laranja e um baú de madeira.',
 base=[I('armchair','Poltronas laranja (vistas no vídeo)',0.8,0.8,x=-1.2,z=1.0,m='orange',ref=True),I('armchair','Poltronas laranja (vistas no vídeo)',0.8,0.8,x=0.4,z=1.0,m='orange',ref=True),
       I('box','Baú de madeira (visto no vídeo)',1.0,0.5,x=2.3,z=-1.4,h=0.45,m='walnut',ref=True)],
 opts=[opt('lounge','Lounge da vista','Sofá de linho de frente para o mar, duas poltronas de couro, mesa de travertino e luz baixa para a noite.',[
         I('sofa','Sofá 3 lugares de linho',2.6,0.95,x=-0.3,z=-0.9,m='linen',k='sofa3'),
         I('armchair','Poltronas de couro',0.8,0.82,x=-1.7,z=1.0,r=160,k='poltrona',q=2),I('armchair','Poltronas de couro',0.8,0.82,x=1.1,z=1.0,r=200),
         I('coffee','Mesa de centro de travertino',1.1,0.7,x=-0.3,z=0.1,k='mesaCentro'),I('rug','Tapete 2,5 × 3,5 m',3.5,2.5,x=-0.3,z=0.05,m='sand',k='tapete34'),
         I('side','Mesa lateral',0.45,0.45,x=1.3,z=-1.0),I('floorLamp','Luminária de piso',0.4,0.4,x=-1.9,z=-1.4,k='luminariaPiso'),
         I('palm','Palmeira em vaso',0.6,0.6,x=2.5,z=-1.3,k='planta')])],
 df='lounge',fl=dict(w=5.9,d=3.9,m='porcBranco'))
room('gourmet','p1','Área gourmet',18.99,6.48,'ala inclinada',None,
 'Virada para a piscina. Bancada de madeira com cuba, churrasqueira embutida, armários aéreos e split já instalados.',
 fix=[I('counter','Bancada de madeira com cuba (já tem)',2.6,0.65,z=-1.55,m='walnut',top='walnut',sink=-0.6,upper=True),I('bbq','Churrasqueira embutida (já tem)',1.0,0.6,x=1.8,z=-1.5)],
 base=[I('dining','Mesa redonda de vidro com 4 cadeiras (vista)',1.1,1.1,x=0.4,z=0.6,seats=4,ref=True),I('stool','Banquetas brancas (vistas)',0.4,0.4,x=-0.9,z=-0.95,m='white',ref=True),I('stool','Banqueta branca (vista)',0.4,0.4,x=-0.3,z=-0.95,m='white',ref=True)],
 opts=[opt('gourmet','Gourmet completa','Mantém a mesa redonda e as banquetas que já estão lá e ganha uma cervejeira ao lado da churrasqueira.',[
         I('dining','Mesa redonda de vidro com 4 cadeiras (vista)',1.1,1.1,x=0.4,z=0.6,seats=4,ref=True),I('stool','Banquetas brancas (vistas)',0.4,0.4,x=-0.9,z=-0.95,m='white',ref=True),I('stool','Banqueta branca (vista)',0.4,0.4,x=-0.3,z=-0.95,m='white',ref=True),
         I('fridge','Cervejeira',0.6,0.65,x=2.75,z=-1.5,h=1.5,m='black',k='cervejeira')])],
 df='gourmet',rot=42)
room('cozinha','p1','Cozinha',21.23,4.33,'ala inclinada',None,
 'Em U, armários cinza e tampo de quartzo. Cooktop de 5 bocas, forno e micro embutidos. Bar de madeira com 2 banquetas vermelhas e passa-prato para a gourmet.',
 fix=[I('counter','Bancada em U, armário cinza e tampo de quartzo (já tem)',3.2,0.62,z=-1.45,cook=0.4,sink=-0.9,upper=True),I('counter','Bancada lateral (já tem)',0.62,2.0,x=-1.9,z=-0.2),
      I('tall','Torre de forno e micro embutidos (já tem)',0.7,0.62,x=1.95,z=-1.45),I('counter','Bar de madeira maciça (já tem)',1.9,0.6,z=0.55,m='walnut',top='walnut')],
 base=[I('stool','Banquetas vermelhas do bar (vistas)',0.4,0.4,x=-0.35,z=1.05,m='redStool',ref=True),I('stool','Banqueta vermelha (vista)',0.4,0.4,x=0.35,z=1.05,m='redStool',ref=True)],
 opts=[opt('coz','Já está completa','A cozinha já vem montada: bancada em U, cooktop de 5 bocas, forno e micro embutidos e bar com 2 banquetas. A geladeira inox fica na copa de apoio, ao lado.',[
         I('stool','Banquetas vermelhas do bar (vistas)',0.4,0.4,x=-0.35,z=1.05,m='redStool',ref=True),I('stool','Banqueta vermelha (vista)',0.4,0.4,x=0.35,z=1.05,m='redStool',ref=True)])],
 df='coz',rot=42)
room('servico','p1','Copa de apoio e lavanderia',23.76,2.06,'fim da ala',None,
 'Copa de apoio branca, com a geladeira inox french door, coifa e pia. Depois vem o corredor envidraçado, a lavanderia (tanque, armários brancos e máquina) e um quarto de serviço pequeno.',
 fix=[I('counter','Bancada branca da copa (já tem)',2.4,0.62,z=-1.1,m='white',sink=0.5,upper=True),I('fridge','Geladeira inox french door (vista no vídeo)',0.9,0.75,x=-1.7,z=-1.05)],
 opts=[opt('serv','Secadora','Se a máquina da lavanderia for só lavadora, entra uma secadora.',[I('washer','Secadora de roupa',0.6,0.65,x=1.6,z=0.6,k='secadora')])],
 df='serv',rot=42)
room('entrada','p1','Varanda de entrada',5.0,17.1,'3,9 × 3,2 m',9,
 'Coberta, com travertino e guarda-corpo de vidro. A escada externa de 38 degraus sobe da rua até aqui.',
 opts=[opt('ent','Entrada','Banco de madeira, palmeira grande e capacho.',[I('box','Banco de madeira',1.4,0.4,z=-1.0,h=0.45,m='teak'),
        I('palm','Palmeira em vaso',0.6,0.6,x=-1.4,z=-0.9,k='planta'),I('rug','Capacho',1.2,0.8,x=0.9,z=1.0,m='sand')])],
 df='ent',fl=dict(w=3.9,d=3.2,m='trav'))
pis=[]
for a,x,z in [(20,-4.6,-1.4),(-20,-4.5,1.2),(-20,4.6,-1.4),(20,4.5,1.2)]:
    pis.append(I('lounger','Espreguiçadeiras de teca',0.7,1.9,x=x,z=z,r=a+(90 if x<0 else -90),k='espreguicadeira' if (x,z)==(-4.6,-1.4) else None,**({'q':4} if (x,z)==(-4.6,-1.4) else {})))
pis+=[I('umbrella','Guarda-sol com base',2.6,2.6,x=-4.4,z=3.0,k='guardaSol'),I('side','Mesa lateral externa',0.45,0.45,x=-4.9,z=-0.1,m='teak',k='mesaCentroExt'),
      I('palm','Palmeiras em vaso',0.6,0.6,x=4.0,z=-3.6,k='planta',q=2),I('palm','Palmeira',0.6,0.6,x=-4.0,z=-3.6)]
room('piscina','p1','Deck da piscina',25.6,18.9,'Ø 6,7 m',53,
 'Piscina redonda de borda infinita (53 m²) com spa acoplado, borda de travertino, deck de madeira e guarda-corpo de vidro. Fica em cima da sala redonda.',
 opts=[opt('deck','Deck mobiliado','Quatro espreguiçadeiras de teca, guarda-sol e palmeiras em vaso.',pis)],df='deck')
# ================= 2º PAVIMENTO
room('master','p2','Suíte master',10.25,11.45,'5,86 × 3,7 m',22,
 'Piso de madeira, painel ripado de TV, escrivaninha, closet branco e banheiro com box grande e bancada preta. Portas de correr para o terraço.',
 base=[I('bed','Cama king (vista no vídeo)',1.93,2.03,z=-0.75,ref=True),I('desk','Escrivaninha (vista no vídeo)',1.4,0.6,x=-2.3,z=0.9,ref=True,mon=False)],
 opts=[opt('master','Suíte master','Cama king com cabeceira alta de linho, criados de nogueira, poltrona de couro e tapete grande.',[
         I('bed','Cama box king com colchão',1.93,2.03,z=-0.75,hbm='sand',k='camaKing'),P('Cabeceira estofada king','cabeceira'),
         I('nightstand','Criados-mudos',0.5,0.4,x=-1.35,z=-1.55,k='criado',q=2),I('nightstand','Criado-mudo',0.5,0.4,x=1.35,z=-1.55),
         I('desk','Escrivaninha (vista no vídeo)',1.4,0.6,x=-2.3,z=0.9,ref=True,mon=False),
         I('armchair','Poltrona de leitura de couro',0.8,0.82,x=2.2,z=1.0,r=210,k='poltrona'),I('floorLamp','Luminária de piso',0.4,0.4,x=2.6,z=0.3,k='luminariaPiso'),
         I('rug','Tapete 2,5 × 3,5 m',3.5,2.5,z=0.1,m='sand',k='tapete34'),I('art','Quadro sobre a cama',1.2,0.03,z=-1.88,y=1.35,m='olive',k='quadro')],foto='master')],
 df='master',fl=dict(w=5.86,d=3.7,m='madeira'))
room('closet','p2','Closet e banho master',5.0,12.2,'3,85 × 5,3 m',None,'Closet branco e banheiro da master já prontos. Nada a comprar.',fl=dict(w=3.85,d=5.3,m='madeira'))
ter=[I('sofa','Sofá externo 3 lugares',2.2,0.9,x=-4.0,z=-0.9,m='linen',fm='teak',k='sofaExt'),
     I('ropeChair','Poltronas de corda',0.75,0.75,x=-2.4,z=0.4,r=-120,k='poltronaExt',q=2),I('ropeChair','Poltrona de corda',0.75,0.75,x=-5.6,z=0.4,r=120),
     I('coffee','Mesa de centro de teca',1.0,0.6,x=-4.0,z=0.2,m='teak',k='mesaCentroExt'),I('rug','Tapete externo',3.0,2.2,x=-4.0,z=0.0,m='rope'),
     I('lounger','Espreguiçadeiras',0.7,1.9,x=1.0,z=0.6,k='espreguicadeira',q=2),I('lounger','Espreguiçadeira',0.7,1.9,x=2.2,z=0.6),
     I('umbrella','Guarda-sol',2.6,2.6,x=1.6,z=-1.0,k='guardaSol'),
     I('palm','Palmeiras em vaso',0.6,0.6,x=-7.4,z=-1.5,k='planta',q=2),I('palm','Palmeira',0.6,0.6,x=4.2,z=-1.6)]
room('terraco','p2','Terraço com jacuzzi',11.0,17.05,'16 × 4,1 m',66,
 'Deck de madeira em cima da frente do 1º pavimento, com guarda-corpo de vidro, vista do mar e, na ponta, um pergolado de madeira com jacuzzi. Sai do hall de pé-direito duplo e da suíte master.',
 fix=[I('pergola','Pergolado de madeira (já tem)',3.0,3.4,x=6.3,z=0.1),I('spa','Jacuzzi (já tem)',2.0,2.0,x=6.3,z=0.1),
      I('railing','Guarda-corpo de vidro (já tem)',16,0.02,x=0,z=2.03),I('railing','Guarda-corpo de vidro',4.1,0.02,x=-8.0,z=0,r=90)],
 opts=[opt('ter','Lounge externo','Sofá de teca, poltronas de corda, espreguiçadeiras de frente para o mar e palmeiras em vaso. A jacuzzi e o pergolado já existem.',ter,foto='terraco')],df='ter',fl=dict(w=16,d=4.1,m='deck'))
room('office2','p2','Saleta perto da escada',18.6,7.9,'~2 × 3 m',None,
 'Cômodo pequeno de madeira com painéis cinza e porta de vidro para uma sacada sobre a piscina. A função não ficou clara no vídeo.',
 opts=[opt('of','Escritório','Mesa, cadeira e prateleiras.',[I('desk','Escrivaninha',1.4,0.7,z=-0.4,k='escrivaninha'),I('officeChair','Cadeira ergonômica',0.6,0.6,z=0.3,r=180,k='cadeiraErgo')])],
 df='of',rot=44,fl=dict(w=2.0,d=2.6,m='madeira'))
for sid,(x,z),nome,obs,kind in [
  ('sa',(21.3,8.3),'Suíte A','Cama de casal com cabeceira, escrivaninha clara com suporte de TV, guarda-roupa de espelho, closet corredor, banheiro com box e sacada sobre a piscina.','casal'),
  ('sb',(25.8,4.1),'Suíte B','No vídeo tinha só o colchão. Painel de TV e escrivaninha em madeira clara, papel de parede listrado, closet corredor e banheiro com claraboia.','nova'),
  ('sc',(29.1,1.5),'Suíte C','Duas camas de solteiro, criado-mudo, escrivaninha e cadeira já no vídeo. Closet e banheiro com box. Boa para hóspedes.','solteiro')]:
    desk=I('desk','Escrivaninha com suporte de TV (vista)',1.2,0.5,x=1.35,z=1.3,r=180,ref=True,mon=False)
    if kind=='casal':
        base=[I('bed','Cama queen com cabeceira (vista)',1.6,2.0,z=-0.6,ref=True),desk]
        items=[I('bed','Cama queen com cabeceira (vista)',1.6,2.0,z=-0.6,ref=True),desk,I('nightstand','Criados-mudos',0.45,0.4,x=-1.1,z=-1.4,k='criado',q=2),
               I('nightstand','Criado-mudo',0.45,0.4,x=1.1,z=-1.4),I('armchair','Poltrona',0.75,0.78,x=-1.3,z=1.2,r=150,k='poltrona'),I('rug','Tapete 2 × 3 m',2.6,2.0,z=0,k='tapete23')]
        desc='Mantém a cama e a escrivaninha; entram criados, poltrona e tapete.'
    elif kind=='nova':
        base=[I('bed','Colchão no chão (visto)',1.58,1.98,z=-0.6,ref=True,hb=False),desk]
        items=[I('bed','Cama box queen com colchão',1.58,1.98,z=-0.6,k='camaQueen'),P('Cabeceira estofada','cabeceira'),desk,
               I('nightstand','Criados-mudos',0.45,0.4,x=-1.1,z=-1.4,k='criado',q=2),I('nightstand','Criado-mudo',0.45,0.4,x=1.1,z=-1.4),
               I('chair','Cadeira da escrivaninha',0.48,0.5,x=1.35,z=0.75,k='cadeiraJantar'),I('rug','Tapete 2 × 3 m',2.6,2.0,z=0,k='tapete23')]
        desc='Cama box queen com cabeceira, criados, cadeira e tapete.'
    else:
        base=[I('bed','Camas de solteiro (vistas)',0.9,1.9,x=-0.8,z=-0.5,ref=True,hb=False),I('bed','Cama de solteiro (vista)',0.9,1.9,x=0.8,z=-0.5,ref=True,hb=False),desk]
        items=base+[I('armchair','Poltrona',0.75,0.78,x=-1.3,z=1.2,r=150,k='poltrona'),I('rug','Tapete 2 × 3 m',2.6,2.0,z=0,k='tapete23')]
        desc='Quarto de hóspedes: mantém as camas e ganha poltrona e tapete.'
    room(sid,'p2',nome,x,z,'~3,7 × 3,9 m',14,obs,base=base,opts=[opt(sid+'o',nome,desc,items)],df=sid+'o',rot=44,fl=dict(w=3.7,d=3.9,m='madeira'))
# ================= PLANO ENXUTO (aluguel de 1–2 anos, eventos, Instagram) =================
# Regra: gastar onde tem evento e câmera; quarto no básico; nada sob medida; aproveitar o que já está na casa.
def enx(room_id,name,desc,items):
    r=next(r for r in R if r['id']==room_id); r['opts'].insert(0,opt(room_id+'_enx',name,desc,items)); r['def']=room_id+'_enx'
pkx=lambda x,z:[I('poker','Mesa de poker oval 9 lugares',2.4,1.25,x=x,z=z,k='poker'),P('Cadeiras estofadas para o poker','cadeiraJantar',9),
                I('pendant','Pendente sobre a mesa',1.8,0.1,x=x,z=z,k='pendente')]
enx('jogos','Poker para eventos','Duas mesas de poker para torneio de 18 pessoas, a sinuca que já está lá no meio e um canto de TV para quem está fora da mesa. O ping-pong vai para a garagem. Cadeira estofada em vez de giratória de couro, porque são 18.',[
    *pkx(-3.4,-1.6),*pkx(-3.4,1.6),
    I('poolTable','Mesa de sinuca (já está lá)',2.5,1.4,x=0.9,z=0,r=90,ref=True),
    I('tv','TV 85" na parede',1.9,0.05,x=5.76,z=0,r=90,y=0.75,k='tv85'),
    I('sofaL','Sofá em L',3.0,2.1,x=3.6,z=0.2,r=-90,m='leatherDark',k='sofaL'),
    I('rug','Tapete 2 × 3 m',3.0,2.4,x=4.5,z=0.1,m='sand',k='tapete23'),
    I('rack','Aparador como bar',1.6,0.45,x=0.9,z=-3.1,h=0.85,k='aparador'),
    I('fridge','Adega climatizada',0.6,0.6,x=2.1,z=-3.05,h=0.85,m='black',k='adega'),
    I('palm','Palmeira em vaso',0.6,0.6,x=5.4,z=2.9,k='planta')])
podx=[I('rug','Tapete redondo',2.8,2.8,z=0.3,round=True,m='olive',k='tapete23'),
      I('podTable','Mesa de podcast para 4',1.4,1.4,z=0.3,seats=4,k='mesaPodcast'),P('Cadeiras','cadeiraErgo',4),
      P('Microfones Shure SM7B (2 agora, 4 depois)','sm7b',2),P('Braços articulados','braco',2),P('Mesa de som RØDECaster Pro II','rodecaster'),
      I('softbox','Kit de luz de estúdio',0.6,0.6,x=-2.4,z=-1.0,r=face(-2.4,-1.3),k='luzEstudio'),I('softbox','Luz',0.6,0.6,x=2.4,z=-1.0,r=face(2.4,-1.3)),
      I('acoustic','Painéis acústicos na parede de pedra (m²)',2.6,0.05,z=-3.05,h=1.8,k='painelAcustico',q=6),
      I('curtain','Cortina blackout no vidro',2.4,0.06,z=3.15,r=180,k='cortina',q=3),
      I('neon','Letreiro neon (marca de vocês)',1.0,0.03,z=-3.2,y=1.9)]
enx('redonda','Estúdio enxuto','Estúdio para gravar com o que importa: som bom (2 microfones e mesa de som), luz e tratamento acústico. Grava com os iPhones no começo e a câmera entra depois, se o conteúdo pedir.',podx)
enx('vidro','Sala de reunião','Para reunião de negócio: mesa para 8 com TV de 65" para apresentação. A parede de espelho fica atrás de quem apresenta, e a sala abre para o jardim.',[
    I('dining','Mesa de reunião para 8',2.2,1.0,seats=8,cm='black',cs='charcoal',k='mesaJantar8'),P('Cadeiras estofadas','cadeiraJantar',8),
    I('tv','TV 65" para apresentação',1.45,0.05,z=-2.4,y=0.9,k='tv65')])
enx('estar','Estar das fotos','Mantém o sofá redondo de rattan e o painel de TV e completa com tapete, duas poltronas de couro e mesa de centro. É o canto que mais aparece em foto. Quadro com tema de dinheiro na parede lateral.',[
    I('rattanRound','Sofá redondo de rattan (já está lá)',2.2,2.2,x=-1.2,z=0.6,ref=True),I('rack','Rack branco (já está lá)',2.2,0.45,z=-1.68,m='white',ref=True),
    I('rug','Tapete 3 × 4 m',4.0,3.0,z=0.1,m='sand',k='tapete34'),I('armchair','Poltronas de couro',0.8,0.82,x=1.9,z=0.5,r=200,k='poltrona',q=2),
    I('armchair','Poltrona de couro',0.8,0.82,x=2.3,z=-0.7,r=240),I('coffee','Mesa de centro',0.85,0.85,x=0.4,z=-0.2,round=True,k='mesaCentro'),
    I('palm','Palmeira em vaso',0.6,0.6,x=-2.55,z=-1.4,k='planta')])
enx('jantar','Jantar como está','A mesa longa com 8 cadeiras já está na casa. Entra só um pendente. Se o dono levar a mesa, use a opção completa.',[
    I('dining','Mesa de jantar com 8 cadeiras (já está lá)',2.4,1.0,seats=8,ref=True),I('pendant','Pendente',1.8,0.1,k='pendente')])
enx('estar2','Lounge da vista','Sofá de frente para o mar, as poltronas laranja que já estão lá, mesa de centro e tapete.',[
    I('sofa','Sofá 3 lugares',2.4,0.95,x=-0.3,z=-0.9,m='linen',k='sofa3'),
    I('armchair','Poltronas laranja (já estão lá)',0.8,0.8,x=-1.6,z=1.0,r=160,m='orange',ref=True),I('armchair','Poltrona laranja',0.8,0.8,x=1.0,z=1.0,r=200,m='orange',ref=True),
    I('coffee','Mesa de centro',0.85,0.85,x=-0.3,z=0.1,round=True,k='mesaCentro'),I('rug','Tapete 2 × 3 m',3.0,2.0,x=-0.3,z=0.05,m='sand',k='tapete23')])
enx('tv','Escritório','Um posto de trabalho com cadeira boa. A TV fica no salão e no estar, então aqui não precisa.',[
    I('desk','Escrivaninha',1.2,0.6,z=-1.3,k='escrivaninha'),I('officeChair','Cadeira de escritório Insight',0.6,0.6,z=-0.6,r=180,k='cadeiraTrabalho')])
enx('gourmet','Gourmet como está','Mesa redonda e banquetas já estão lá. Entra só a cervejeira.',[
    I('dining','Mesa redonda de vidro com 4 cadeiras (já está lá)',1.1,1.1,x=0.4,z=0.6,seats=4,ref=True),
    I('stool','Banquetas brancas (já estão lá)',0.4,0.4,x=-0.9,z=-0.95,m='white',ref=True),I('stool','Banqueta branca',0.4,0.4,x=-0.3,z=-0.95,m='white',ref=True),
    I('fridge','Cervejeira',0.6,0.65,x=2.75,z=-1.5,h=1.5,m='black',k='cervejeira')])
enx('servico','Fica para depois','Varal agora. A secadora entra só se fizer falta.',[])
enx('entrada','Entrada','Uma palmeira grande na porta.',[I('palm','Palmeira em vaso',0.6,0.6,x=-1.4,z=-0.9,k='planta')])
pisx=[]
for a,x,z in [(20,-4.6,-1.4),(-20,-4.5,1.2),(-20,4.6,-1.4),(20,4.5,1.2)]:
    pisx.append(I('lounger','Espreguiçadeiras de alumínio',0.7,1.9,x=x,z=z,r=a+(90 if x<0 else -90),k='espreguicadeira' if (x,z)==(-4.6,-1.4) else None,**({'q':4} if (x,z)==(-4.6,-1.4) else {})))
pisx+=[I('umbrella','Guarda-sol',2.6,2.6,x=-4.4,z=3.0,k='guardaSol'),I('palm','Palmeiras em vaso',0.6,0.6,x=4.0,z=-3.6,k='planta',q=2),I('palm','Palmeira',0.6,0.6,x=-4.0,z=-3.6)]
enx('piscina','Deck pronto para foto','Quatro espreguiçadeiras de alumínio (aguentam sol, chuva e cachorro), guarda-sol e palmeiras.',pisx)
enx('master','Master no básico','Cama king com colchão, cabeceira e dois criados. A escrivaninha e o painel já estão lá.',[
    I('bed','Cama box king com colchão',1.93,2.03,z=-0.75,hbm='sand',k='camaKing'),P('Cabeceira king','cabeceira'),
    I('nightstand','Criados-mudos',0.5,0.4,x=-1.35,z=-1.55,k='criado',q=2),I('nightstand','Criado-mudo',0.5,0.4,x=1.35,z=-1.55),
    I('desk','Escrivaninha (já está lá)',1.4,0.6,x=-2.3,z=0.9,ref=True,mon=False)])
enx('sb','Suíte B no básico','Cama box queen com colchão e dois criados. A escrivaninha já está lá.',[
    I('bed','Cama box queen com colchão',1.58,1.98,z=-0.6,k='camaQueen'),I('nightstand','Criados-mudos',0.45,0.4,x=-1.1,z=-1.4,k='criado',q=2),
    I('nightstand','Criado-mudo',0.45,0.4,x=1.1,z=-1.4),I('desk','Escrivaninha (já está lá)',1.2,0.5,x=1.35,z=1.3,r=180,ref=True,mon=False)])
for sid,desc in [('sa','Já tem cama, escrivaninha e guarda-roupa. Nada a comprar.'),('sc','Já tem as duas camas de solteiro, escrivaninha e criado. Nada a comprar.')]:
    r=next(r for r in R if r['id']==sid); enx(sid,'Como está',desc,[dict(i) for i in r['base']])
enx('terraco','Lounge da jacuzzi','Sofá e poltronas externas de alumínio, mesa de centro e espreguiçadeiras de frente para o mar. A jacuzzi e o pergolado já existem.',[
    I('sofa','Sofá externo 3 lugares',2.2,0.9,x=-4.0,z=-0.9,m='linen',fm='teak',k='sofaExt'),
    I('ropeChair','Poltronas externas',0.75,0.75,x=-2.4,z=0.4,r=-120,k='poltronaExt',q=2),I('ropeChair','Poltrona externa',0.75,0.75,x=-5.6,z=0.4,r=120),
    I('coffee','Mesa de centro externa',1.0,0.6,x=-4.0,z=0.2,m='teak',k='mesaCentroExt'),
    I('lounger','Espreguiçadeiras',0.7,1.9,x=1.0,z=0.6,k='espreguicadeira',q=2),I('lounger','Espreguiçadeira',0.7,1.9,x=2.2,z=0.6),
    I('palm','Palmeiras em vaso',0.6,0.6,x=-7.4,z=-1.5,k='planta',q=2),I('palm','Palmeira',0.6,0.6,x=4.2,z=-1.6)])
enx('office2','Vazia por enquanto','Fica livre e só ganha uso se aparecer necessidade.',[])
enx('gar','Garagem','Três vagas, o ping-pong guardado e uma estante de aço.',[
    I('car','Vaga 1',1.95,4.5,x=-4.3,z=0.6,ref=True),I('car','Vaga 2',1.95,4.5,x=-1.1,z=0.6,ref=True),I('car','Vaga 3',1.95,4.5,x=2.1,z=0.6,ref=True),
    I('pingpong','Ping-pong guardado (já está na casa)',2.74,1.53,x=4.6,z=-2.2,r=90,ref=True),
    I('steelShelf','Estante de aço',1.8,0.5,x=-0.9,z=-3.05,h=2.0,k='estanteAco')])
# ---- sem vasos e plantas em nenhum plano (pedido do Arthur, 06/11); no lugar, quadros com tema de dinheiro e estações de trabalho
for r in R:
    for o in r['opts']: o['items']=[i for i in o['items'] if i['t'] not in ('palm','plant')]
def add(room_id,opt_id,items):
    r=next(r for r in R if r['id']==room_id);next(o for o in r['opts'] if o['id']==opt_id)['items'].extend(items)
Q='Quadro decorativo tema dinheiro'
add('jogos','jogos_enx',[I('art',Q+' (salão)',1.2,0.03,x=-3.4,z=-3.3,y=1.35,m='felt',k='quadro',q=3),I('art',Q,1.2,0.03,x=3.6,z=-3.3,y=1.35,m='felt'),
                         I('art',Q,1.2,0.03,x=-5.82,z=0,r=-90,y=1.35,m='felt')])
add('estar','estar_enx',[I('art',Q,1.4,0.03,x=-2.9,z=0,r=-90,y=1.3,m='felt',k='quadro')])
add('vidro','vidro_enx',[I('art',Q,1.2,0.03,x=2.12,z=0,r=90,y=1.35,m='felt',k='quadro')])
add('master','master_enx',[I('art',Q+' sobre a cama',1.2,0.03,z=-1.88,y=1.35,m='felt',k='quadro')])
r=next(r for r in R if r['id']=='tv'); o=next(o for o in r['opts'] if o['id']=='tv_enx')
o['name']='Escritório para 2'; o['desc']='Duas estações de trabalho lado a lado, de frente para a janela, com cadeira boa e espaço para computador e monitor. Os computadores vocês já têm.'
o['items']=[I('desk','Mesas de trabalho',1.4,0.7,x=-0.8,z=-1.35,k='escrivaninha',q=2),I('desk','Mesa de trabalho',1.4,0.7,x=0.8,z=-1.35),
            I('officeChair','Cadeiras de escritório Insight',0.6,0.6,x=-0.8,z=-0.6,r=180,k='cadeiraTrabalho',q=2),I('officeChair','Cadeira Insight',0.6,0.6,x=0.8,z=-0.6,r=180),
            I('art',Q,1.0,0.03,x=1.9,z=0.4,r=90,y=1.35,m='felt',k='quadro')]
r=next(r for r in R if r['id']=='office2'); o=next(o for o in r['opts'] if o['id']=='office2_enx')
o['name']='Estação de trabalho'; o['desc']='Mais um posto para trabalhar ou editar, perto da escada e com sacada para a piscina.'
o['items']=[I('desk','Mesa de trabalho',1.4,0.7,z=-0.4,k='escrivaninha'),I('officeChair','Cadeira de escritório Insight',0.6,0.6,z=0.3,r=180,k='cadeiraTrabalho')]
# ---- ajustes do Luiz (áudio de 06/11 01:17): hall do 2º vira escritório, jacuzzi na ponta esquerda (lado da suíte)
room('hall2','p2','Hall do pé-direito alto',16.1,13.72,'5,8 × 2,5 m',15,
 'Onde a escada chega no 2º pavimento, ao lado da entrada da suíte master: pé-direito bem alto, piso de madeira e uma parede de vidro (blindex) para o terraço e o mar.',
 fix=[I('glassWall','Parede de vidro / blindex (já tem)',5.8,0.03,z=1.27,h=4.6)],
 opts=[opt('hall2_enx','Escritório no hall','Três estações de trabalho de frente para o vidro e para o mar, com persiana elétrica no blindex para controlar o sol e gravar call sem reflexo.',[
   I('desk','Mesas de trabalho',1.4,0.7,x=-1.9,z=0.45,r=180,k='escrivaninha',q=3),I('desk','Mesa de trabalho',1.4,0.7,x=0,z=0.45,r=180),I('desk','Mesa de trabalho',1.4,0.7,x=1.9,z=0.45,r=180),
   I('officeChair','Cadeiras de escritório Insight',0.6,0.6,x=-1.9,z=-0.3,k='cadeiraTrabalho',q=3),I('officeChair','Cadeira Insight',0.6,0.6,x=0,z=-0.3),I('officeChair','Cadeira Insight',0.6,0.6,x=1.9,z=-0.3),
   I('none','Persiana elétrica no blindex (sob medida, pedir orçamento; desenhada enrolada)'),
   I('art',Q,1.2,0.03,x=0,z=-1.22,y=1.35,m='felt',k='quadro')])],
 df='hall2_enx',fl=dict(w=5.8,d=2.55,m='madeira'))
t=next(r for r in R if r['id']=='terraco')
for i in t['fix']:
    if i['t'] in ('pergola','spa'): i['x']=-i['x']
for o in t['opts']:
    for i in o['items']:
        i['x']=-i.get('x',0)
        if i.get('r'): i['r']=-i['r']
t['note']=t['note'].replace('na ponta, um pergolado','na ponta esquerda, do lado da suíte master (junto do closet e do banheiro), um pergolado')
# sala de TV do 1º fica livre no enxuto (o escritório principal agora é o hall do 2º); o escritório para 2 vira alternativa
tv=next(r for r in R if r['id']=='tv'); o=next(o for o in tv['opts'] if o['id']=='tv_enx'); o['id']='tv_office'
tv['opts'].insert(0,opt('tv_enx','Livre por enquanto','O escritório principal fica no hall do 2º pavimento. Esta sala fica livre: vira apoio de evento, quarto de hóspede improvisado ou um segundo escritório depois.',[])); tv['def']='tv_enx'
so=next(r for r in R if r['id']=='office2'); o=next(o for o in so['opts'] if o['id']=='office2_enx'); o['items']=[]; o['name']='Vazia por enquanto'; o['desc']='O escritório fica no hall, ao lado. Esta saleta fica livre.'
# peças repetidas só para o desenho: escondidas da lista (o preço vai na primeira, com q)
for r in R:
    for o in r['opts']:
        priced={i['t'] for i in o['items'] if i.get('k')}
        for i in o['items']:
            if not i.get('k') and not i.get('ref') and i['t'] in priced: i['dup']=True
json.dump(R,open(sys.argv[1],'w'),ensure_ascii=False)
ks=sorted({i['k'] for r in R for o in r['opts'] for i in o['items'] if i.get('k')})
print(len(R),'cômodos; chaves de preço:',len(ks));print(' '.join(ks))
