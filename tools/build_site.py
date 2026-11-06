"""Monta o site: injeta dados no src/template.html e grava index.html + furniture.js na raiz do projeto.
Uso: python3 tools/build_site.py   (rode a partir da raiz do projeto)"""
import json, base64, os, shutil
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda p, d=None: json.load(open(os.path.join(R, p))) if os.path.exists(os.path.join(R, p)) else d
model = J('data/model.json')
tex = {f: "data:image/png;base64," + base64.b64encode(open(os.path.join(R, 'data/tex', f + '.png'), 'rb').read()).decode() for f in model['floors']}
rooms = J('data/rooms.json')
prices = J('data/prices.json', {})
deals = J('data/deals.json', {"lojas": [], "produtos": []})
photos = J('data/fotos.json', [])
extra = J('data/extra.json', {})
extra['slab_tex'] = {f: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(R,'data/tex',f+'_slab.png'),'rb').read()).decode()
                     for f in model['floors'] if os.path.exists(os.path.join(R,'data/tex',f+'_slab.png'))}
if os.path.exists(os.path.join(R,'data/tex/p1_deck.png')):
    extra['deck_tex'] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(R,'data/tex/p1_deck.png'),'rb').read()).decode()
h = open(os.path.join(R, 'src/template.html')).read()
for k, v in [('MODEL', model), ('TEX', tex), ('ROOMS', rooms), ('PRICES', prices), ('DEALS', deals), ('PHOTOS', photos), ('EXTRA', extra)]:
    h = h.replace(f'/*{k}*/null', json.dumps(v, ensure_ascii=False, separators=(',', ':')))
open(os.path.join(R, 'index.html'), 'w').write(h)
shutil.copy(os.path.join(R, 'src/furniture.js'), os.path.join(R, 'furniture.js'))
print('index.html', len(h) // 1024, 'KB')
