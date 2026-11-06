"""Monta data/prices.json (faixa bom/premium por chave k) e data/deals.json a partir de data/fontes/*.json.
bom = o mais barato entre a pesquisa geral e as ofertas (Leroy, Tok&Stok, lojas); premium = linha alta da pesquisa geral.
Uso: python3 tools/prices.py"""
import json, os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F=lambda n:json.load(open(os.path.join(R,'data/fontes',n))) if os.path.exists(os.path.join(R,'data/fontes',n)) else None
geral=F('precos.json') or []; leroy=F('leroy.json') or []; lojas=F('lojas.json') or {'lojas':[],'produtos':[]}
# chave -> item da pesquisa geral (fator converte a unidade da loja para a unidade do item no projeto)
G={'sofa3':'Sofá 3 lugares de sala','sofaRet':'Sofá retrátil/reclinável 3 lugares','sofaL':'Sofá modular grande em L para sala de TV',
 'poltrona':'Poltrona de sala','mesaCentro':'Mesa de centro','aparador':'Aparador/buffet','rack':'Rack para TV','tapete23':'Tapete 2x3 m','tapete34':'Tapete 3x4 m',
 'mesaJantar8':'Mesa de jantar 8 lugares','cadeiraJantar':'Cadeira de jantar (unidade)','camaKing':'Cama box king com colchão (conjunto)',
 'camaQueen':'Cama box queen com colchão (conjunto)','cabeceira':'Cabeceira estofada king','criado':'Criado-mudo','escrivaninha':'Escrivaninha',
 'cadeiraErgo':'Cadeira ergonômica de escritório','banqueta':'Banqueta alta','cortina':'Cortina blackout/voil sob medida','pendente':'Luminária pendente',
 'luminariaPiso':'Luminária de piso','quadro':'Quadros/decoração','planta':'Vasos e plantas grandes','tv65':'TV 65"','tv75':'TV 75"','tv85':'TV 85"',
 'projetor':'Projetor 4K laser ultra-curta distância','tela120':'Tela de projeção 120"','soundbar':'Soundbar Dolby Atmos','cinemaSeat':'Poltrona de cinema reclinável',
 'painelAcustico':('Painel acústico',{'bom':2.0,'premium':2.78}),'poker':'Mesa de poker profissional 8-10 jogadores (oval','pokerChair':'Cadeira para mesa de poker',
 'adega':'Frigobar/adega climatizada','geladeira':'Geladeira inverse/french door','cervejeira':'Cervejeira','secadora':'Secadora de roupa','espreguicadeira':'Espreguiçadeira (área externa)',
 'guardaSol':'Guarda-sol com base','sofaExt':'Sofá externo','poltronaExt':'Poltrona externa','mesaCentroExt':'Mesa de centro externa','esteira':'Esteira',
 'bike':'Bicicleta ergométrica/spinning','powerRack':'Estação de musculação ou gaiola (power rack)','banco':'Banco regulável','halteres':'Kit de halteres com suporte',
 'pisoBorracha':'Piso de borracha','espelho':'Espelho grande de parede','sm7b':'Microfone Shure SM7B','rodecaster':'Interface/mesa RØDECaster Pro II',
 'braco':'Braço articulado de microfone','camera':'Câmera Sony ZV-E10 ou equivalente','luzEstudio':'Iluminação LED de estúdio','mesaPodcast':'Mesa de podcast para 4 pessoas',
 'fone':'Fone de monitoração'}
# chave -> item da Leroy (fator de unidade)
L={'sofaL':'Sofá em L','tv85':'TV 85"','banqueta':'Banquetas','adega':'Adega','pokerChair':'Cadeiras giratórias','esteira':'Esteira','bike':'Bike','powerRack':'Rack@Academia',
 'espelho':'Espelho@Academia','painelAcustico':('Painéis acústicos',1/1.68),'cortina':'Cortina blackout','tapete34':'Tapete 3x4','sofa3':'Sofá@Salas','poltrona':'Poltrona@Salas',
 'mesaCentro':'Mesa de centro@Salas','tapete23':'Tapete 2x3','luminariaPiso':'Luminária de piso','pendente':'Pendente','aparador':'Aparador','rack':'Rack@Salas',
 'mesaJantar8':'Mesa 8 lugares','cadeiraJantar':'Cadeiras@Jantar','camaQueen':'Cama box queen + colchão','cabeceira':'Cabeceira king','criado':'Criado-mudo',
 'escrivaninha':'Escrivaninha','espreguicadeira':'Espreguiçadeira','guardaSol':'Guarda-sol','sofaExt':'Sofá externo','poltronaExt':'Poltrona externa',
 'mesaCentroExt':'Mesa de centro externa','cervejeira':'Cervejeira','secadora':'Secadora','quadro':'Quadros','estanteAco':'Estante de aço'}
def find_geral(name,tier):
    for x in geral:
        if x['item'].startswith(name) and x['tier']==tier: return x
def find_leroy(spec):
    nm,amb=(spec.split('@')+[None])[:2]
    for x in leroy:
        if x.get('item','').startswith(nm) and (amb is None or x.get('ambiente','').startswith(amb)): return x
def rec(x,fac=1,loja=None):
    if not x or x.get('preco') is None: return None
    return {'p':round(x['preco']*fac,2),'loja':loja or x.get('loja'),'produto':x.get('produto'),'url':x.get('url'),'acesso':x.get('acesso')}
out={'_acesso':'05 e 06/11/2026'}
for k in ('estanteAco','cadeiraTrabalho'): G.setdefault(k,'__nenhum__')
for k,spec in G.items():
    nm,fac=(spec if isinstance(spec,tuple) else (spec,{}))
    b=rec(find_geral(nm,'bom'),fac.get('bom',1)); p=rec(find_geral(nm,'premium'),fac.get('premium',1))
    ls=L.get(k)
    if ls:
        lnm,lf=(ls if isinstance(ls,tuple) else (ls,1)); lx=find_leroy(lnm); lr=rec(lx,lf,'Leroy Merlin')
        if lr and (b is None or lr['p']<b['p']): b=lr
    for x in lojas.get('produtos',[]):
        if x.get('k')==k:
            r=rec(x,x.get('fac',1))
            if r and (b is None or r['p']<b['p']): b=r
    if p is None: p=b
    out[k]={'bom':b,'premium':p}
json.dump(out,open(os.path.join(R,'data/prices.json'),'w'),ensure_ascii=False)
deals={'lojas':lojas.get('lojas',[]),'produtos':[dict(x,loja=x.get('loja','Leroy Merlin')) for x in leroy]+lojas.get('produtos',[])}
deals['produtos']=[x for x in deals['produtos'] if x.get('preco')]
deals['produtos'].sort(key=lambda x:(x.get('ambiente') or '',-(x.get('desconto_pct') or 0)))
json.dump(deals,open(os.path.join(R,'data/deals.json'),'w'),ensure_ascii=False)
miss=[k for k,v in out.items() if k!='_acesso' and not v['bom']]
print('chaves com preço:',len(out)-1-len(miss),'sem:',miss,'| ofertas:',len(deals['produtos']))
