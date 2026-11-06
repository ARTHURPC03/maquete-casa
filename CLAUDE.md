# Maquete da casa do Cacupé — guia para o Claude

Maquete 3D da casa (4 andares) com propostas de mobília, orçamento e fotos de antes e depois.
Site público: https://arthurpc03.github.io/maquete-casa/ (GitHub Pages, publicado a partir da branch `main`).

## Como o projeto funciona

- `src/template.html` é a página inteira: Three.js r147 por CDN, HUD, painel, orçamento e as telas de
  fotos e ofertas. Os dados entram nos marcadores `/*MODEL*/null`, `/*ROOMS*/null` etc.
- `src/furniture.js` é a biblioteca de móveis 3D feita com primitivas. Cada tipo (`sofa`, `bed`, `poker`,
  `cinemaSeat`, `treadmill`...) é uma função `F.tipo(g, item)`. A frente do móvel aponta para +z, o centro fica
  na origem e a base em y=0.
- `data/rooms.py` gera `data/rooms.json`: cômodos, posição em metros, opções de proposta e móveis.
  **Edite o `.py`, não o `.json`.**
- `data/prices.json` tem o preço por chave (`k` de cada item): faixa `bom` e `premium`, com loja, URL e data.
  `data/deals.json` traz as ofertas de Black Friday mostradas na tela "Ofertas".
- `data/fotos.json` mais `fotos/*.jpg`: os pares antes/depois. O "antes" é um quadro dos vídeos da visita;
  o "depois" foi gerado por IA a partir dele.
- `data/model.json` e `data/tex/*.png`: paredes e planta de cada andar, extraídas do PDF da planta (escala 1:50).
  Só mexa nisso se a planta mudar (`tools/extract.py` e depois `tools/build.py`).

## Fluxo para qualquer mudança

```bash
python3 data/rooms.py data/rooms.json     # se mexeu nos cômodos ou móveis
python3 tools/build_site.py               # gera index.html e furniture.js na raiz
python3 -m http.server 8765               # abrir http://localhost:8765 para conferir
git add -A && git commit -m "..." && git push   # o GitHub Pages republica em ~1 min
```

## Coordenadas

- x/z em metros, no mesmo referencial para todos os andares. A escada interna fica em x≈15–19, z≈9.5–12.4.
- Os andares ficam em y = 0 (garagem), 3 (térreo), 6 (1º pavimento) e 9 (2º pavimento).
- Cada cômodo tem um centro (`x`, `z`) e um `rot` (graus). Os itens usam coordenadas locais do cômodo.
- A ala inclinada usa `rot` de 42° no térreo e no 1º pavimento e de 44° no 2º. No local, +x corre ao longo da ala
  e +z aponta para a fachada da piscina e do mar.
- `r` do item gira o móvel em graus: `r=90` vira a frente para −x e `r=-90` para +x.

## Para adicionar um móvel

Em `data/rooms.py`, dentro da opção do cômodo:

```python
I('sofa','Sofá 3 lugares',2.4,0.95,x=0,z=1.0,r=180,m='linen',k='sofa3')
```

O `k` liga o item ao `data/prices.json`. Um item só de orçamento, sem desenho, usa `P(nome, k, q)`.

## Pedidos

Pedidos de mudança chegam como issues com o rótulo `pedido` (botão "Pedir mudança" no site). Para atender:
leia a issue, faça a mudança, rode o fluxo acima, faça o push e comente na issue com o link de onde ela aparece.

## Regras

- Preço só entra com a página da loja (URL e data). Nada de média de mercado.
- Não publique a planta original em PDF nem os vídeos. Eles têm nome e endereço do proprietário.
