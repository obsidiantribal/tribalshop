document.getElementById('year').textContent = new Date().getFullYear();

const grid = document.getElementById('grid');
const cards = [...grid.children];
const empty = document.getElementById('empty');

document.getElementById('service-count').textContent = cards.length;

document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;

  const category = btn.dataset.filter;
  document.querySelectorAll('#filters .chip').forEach(c => c.setAttribute('aria-pressed', c === btn));

  let visible = 0;
  cards.forEach(card => {
    const shown = category === 'all' || card.dataset.cat === category;
    card.classList.toggle('hidden', !shown);
    visible += shown;
  });

  grid.classList.toggle('hidden', !visible);
  empty.classList.toggle('hidden', !!visible);
});

const lb = document.getElementById('lightbox');
const lbBody = document.getElementById('lb-body');

const closeLb = () => {
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

document.getElementById('lb-close').addEventListener('click', closeLb);
lb.addEventListener('click', e => e.target === lb && closeLb());
document.addEventListener('keydown', e => e.key === 'Escape' && !lb.classList.contains('hidden') && closeLb());
