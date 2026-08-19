# Tribal Shop

Vitrine estática de serviços de Tribal Wars. Sem backend, sem checkout: cada card
leva o cliente ao canal oficial de venda do serviço.

## O que subir para o servidor

```
index.html
css/output.css
js/app.js
img/
favicon-32.png
icon-512.png
apple-touch-icon.png
```

`node_modules/`, `package.json` e `css/input.css` são só de desenvolvimento, não vão para o ar.
Peso total do que o navegador baixa: cerca de 2,9 MB, com todas as imagens dos cards em `loading="lazy"`.

## Editar

Cada serviço é um `<article class="card">` dentro de `#grid`, no `index.html`.
Para adicionar um serviço novo, copie um card existente e ajuste:

- `data-cat` — categoria do filtro: `automatize`, `evolua`, `aprenda` ou `recursos`
- imagem em `img/` (o card corta em 4:3 a partir do topo)
- `data-art="img/arquivo.jpg"` no botão "Ver arte" abre a arte inteira em lightbox
- link do botão final, com UTM: `?utm_source=tribalshop&utm_medium=vitrine&utm_campaign=<slug>`

Links de WhatsApp usam mensagem pré-preenchida:
`https://wa.me/55DDNUMERO?text=<mensagem codificada em URL>`

Ao mudar o número de serviços, atualize também o contador "8 serviços ativos" no hero.

## Recompilar o CSS

Necessário sempre que você mexer em classes Tailwind no HTML.

```bash
npm install     # só na primeira vez
npm run css     # gera css/output.css minificado
npm run watch   # recompila sozinho enquanto você edita
```

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `index.html` | Página inteira: header, hero, catálogo, como funciona, FAQ, footer |
| `js/app.js` | Filtros de categoria e lightbox das artes |
| `css/input.css` | Tema (cores `ink`/`gold`) e componentes (`.card`, `.chip`, `.btn-gold`, `.mark`) |
| `css/output.css` | Gerado. Não editar à mão |
| `img/` | Artes dos serviços. `.webp` são geradas, `.jpg` são as originais |
| `favicon-32.png`, `icon-512.png`, `apple-touch-icon.png` | Moeda TS, gerada por `artes/gerar.cjs` |

A marca (moeda dourada com "TS") é a classe `.mark`, montada em CSS — não é imagem.
O `padding-top: 0.108em` nela corrige a métrica da Bebas Neue, que sem isso deixa o texto
desalinhado dentro do círculo.

## Artes

Ficam em `../artes/`, geradas a partir de `_gerador.html`:

```bash
node artes/gerar.cjs
```

Isso produz:

- `artes/*.png` — 1080×1080 para WhatsApp e redes (Multi Pro, Compra de Contas, Mar de Bárbaras)
- `site/img/multipro-card.webp` e `marbb-card.webp` — banners dos cards do site

Cada `<section class="art">` no `_gerador.html` é uma arte; o `id` dela é mapeado para o
arquivo de saída na lista `ALVOS` dentro de `gerar.cjs`. As imagens de origem (logos do
Multi Pro e do BB Pro) ficam em `artes/fontes/`, fora da pasta que vai para o ar.

O script depende do Playwright. Os caminhos do Playwright e do Chromium estão no topo de
`gerar.cjs` — ajuste se mudar de máquina.
