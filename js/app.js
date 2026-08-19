/* Tribal Shop — filtros de categoria e lightbox de artes */

document.getElementById('ano').textContent = new Date().getFullYear();

/* ── filtros ── */
const grid = document.getElementById('grid');
const cards = [...grid.children];
const vazio = document.getElementById('vazio');

/* contador do hero acompanha o número real de cards */
document.getElementById('qtd-servicos').textContent = cards.length;

document.getElementById('filtros').addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;

  const cat = btn.dataset.filter;
  document.querySelectorAll('#filtros .chip').forEach(c => c.setAttribute('aria-pressed', c === btn));

  let visiveis = 0;
  cards.forEach(card => {
    const mostra = cat === 'all' || card.dataset.cat === cat;
    card.classList.toggle('hidden', !mostra);
    visiveis += mostra;
  });

  grid.classList.toggle('hidden', !visiveis);
  vazio.classList.toggle('hidden', !!visiveis);
});

/* ── lightbox ── */
const lb = document.getElementById('lightbox');
const lbBody = document.getElementById('lb-body');

const fecharLb = () => {
  lb.classList.replace('flex', 'hidden');
  lbBody.replaceChildren();
  document.body.style.overflow = '';
};

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-art]');
  if (!btn) return;

  const img = new Image();
  img.src = btn.dataset.art;
  img.alt = '';
  img.className = 'max-h-[86vh] w-auto max-w-full rounded-xl object-contain';

  lbBody.replaceChildren(img);
  lb.classList.replace('hidden', 'flex');
  document.body.style.overflow = 'hidden';
});

document.getElementById('lb-close').addEventListener('click', fecharLb);
lb.addEventListener('click', e => e.target === lb && fecharLb());
document.addEventListener('keydown', e => e.key === 'Escape' && !lb.classList.contains('hidden') && fecharLb());
