const PACTO = {
  expiraEm: '2026-10-14T23:59:59-03:00',
  loteTotal: 50,
  loteAssinados: 12,
  checkoutUrl: 'https://multipro-indol.vercel.app/api/pacto/checkout',
};

const $  = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

const prazo = new Date(PACTO.expiraEm).getTime();
const relogioHero = $('#relogio');
const relogioTopo = $('#relogio-topo');
const relogioBarra = $('#relogio-barra');

const doisDigitos = n => String(n).padStart(2, '0');

function encerrarPacto() {
  document.body.dataset.pacto = 'encerrado';

  const aviso = $('#urgencia-titulo');
  if (aviso) aviso.textContent = 'Este pacto foi encerrado';

  if (relogioHero) {
    relogioHero.innerHTML =
      '<p class="pacto-encerrado">As três casas cumpriram o prazo combinado. ' +
      'Chame no WhatsApp para saber da próxima.</p>';
  }

  if (relogioTopo) relogioTopo.textContent = 'Encerrado';
  if (relogioBarra) relogioBarra.textContent = 'Encerrado';
}

function tique() {
  const resta = prazo - Date.now();

  if (!Number.isFinite(prazo)) return;
  if (resta <= 0) { encerrarPacto(); return true; }

  const seg  = Math.floor(resta / 1000) % 60;
  const min  = Math.floor(resta / 60000) % 60;
  const hora = Math.floor(resta / 3600000) % 24;
  const dia  = Math.floor(resta / 86400000);

  if (relogioHero) {
    $$('[data-unidade]', relogioHero).forEach(el => {
      const v = { dia, hora, min, seg }[el.dataset.unidade];
      el.textContent = doisDigitos(v);
    });
  }

  const curto = dia > 0
    ? `${dia}d ${doisDigitos(hora)}:${doisDigitos(min)}:${doisDigitos(seg)}`
    : `${doisDigitos(hora)}:${doisDigitos(min)}:${doisDigitos(seg)}`;

  if (relogioTopo)  relogioTopo.textContent = curto;
  if (relogioBarra) relogioBarra.textContent = curto;

  return false;
}

if (Number.isFinite(prazo)) {
  if (!tique()) {
    const id = setInterval(() => { if (tique()) clearInterval(id); }, 1000);
  }
}

const restantes = Math.max(PACTO.loteTotal - PACTO.loteAssinados, 0);
const proporcao = PACTO.loteTotal > 0
  ? Math.min(PACTO.loteAssinados / PACTO.loteTotal, 1)
  : 0;

const loteRestam = $('#lote-restam');
const loteCheio  = $('#lote-cheio');
const loteNota   = $('#lote-nota');
const loteTrilho = $('#lote-trilho');

if (loteRestam) {
  loteRestam.textContent = restantes === 1
    ? 'resta 1 pacto'
    : `restam ${restantes} pactos`;
}

if (loteNota) {
  loteNota.textContent =
    `${PACTO.loteAssinados} de ${PACTO.loteTotal} pactos deste lote já foram assinados.`;
}

if (loteTrilho) {
  loteTrilho.setAttribute('aria-valuenow', String(PACTO.loteAssinados));
  loteTrilho.setAttribute('aria-valuemax', String(PACTO.loteTotal));
  loteTrilho.setAttribute('aria-valuetext',
    `${PACTO.loteAssinados} de ${PACTO.loteTotal} pactos assinados`);
}

function encherLote() {
  if (loteCheio) loteCheio.style.width = `${proporcao * 100}%`;
}

const olho = new IntersectionObserver((entradas, obs) => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;

    entrada.target.classList.add('visivel');
    if (entrada.target.id === 'urgencia') encherLote();

    obs.unobserve(entrada.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px 18% 0px' });

$$('.reveal').forEach(el => olho.observe(el));

const lacre = $('#lacre');

if (lacre) {
  const olhoSelo = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;

      setTimeout(() => {
        $('#selo', lacre)?.classList.add('selado');
        lacre.classList.add('selado');
        const aviso = $('#lacre-aviso', lacre);
        if (aviso) aviso.textContent = 'Pacto selado, agora escolha o seu';
      }, semMovimento ? 0 : 420);

      obs.unobserve(entrada.target);
    });
  }, { threshold: 0.55 });

  olhoSelo.observe(lacre);
}

function revelarAgora(destino) {
  if (!destino) return;
  const alvos = [destino, ...$$('.reveal', destino)].filter(e => e.classList.contains('reveal'));
  alvos.forEach(e => { e.classList.add('visivel'); olho.unobserve(e); });
  if ($('#urgencia', destino) || destino.id === 'urgencia') encherLote();
}

$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const id = link.getAttribute('href').slice(1);
    if (id) revelarAgora(document.getElementById(id));
  });
});

if (loteCheio) setTimeout(encherLote, 600);

const barraLeitura = $('#progresso');

if (barraLeitura) {
  let agendado = false;

  const medir = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    const lido  = total > 0 ? Math.min(scrollY / total, 1) : 0;
    barraLeitura.style.transform = `scaleX(${lido})`;
    agendado = false;
  };

  addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(medir);
  }, { passive: true });

  medir();
}

const seletor = $('#pacote');
const forma   = $('#forma');

$$('[data-escolhe]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const chave = btn.dataset.escolhe;

    if (seletor) seletor.value = chave;

    revelarAgora(document.getElementById('assinar'));
    forma?.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth', block: 'center' });

    setTimeout(() => {
      const vazio = $$('#forma input').find(i => !i.value);
      vazio?.focus({ preventScroll: true });
    }, semMovimento ? 0 : 700);
  });
});

const recado = $('#recado');

function avisar(texto, tipo = 'erro') {
  if (!recado) return;
  recado.textContent = texto;
  recado.className = `recado recado-${tipo}`;
  recado.hidden = false;
}

function limparAviso() {
  if (recado) recado.hidden = true;
  $$('.campo-erro').forEach(el => el.classList.remove('campo-erro'));
}

forma?.addEventListener('submit', async e => {
  e.preventDefault();
  limparAviso();

  if (document.body.dataset.pacto === 'encerrado') {
    return avisar('Este pacto já foi encerrado. Chame no WhatsApp para saber da próxima.');
  }

  const dados = Object.fromEntries(new FormData(forma));
  dados.nome     = dados.nome.trim().replace(/\s+/g, ' ');
  dados.mundo    = dados.mundo.trim().toLowerCase();
  dados.nick     = dados.nick.trim();
  dados.email    = dados.email.trim();
  dados.telefone = dados.telefone.trim();

  const digitos = dados.telefone.replace(/\D/g, '');

  const problemas = [];
  if (!/^\p{L}[\p{L}\s'.-]{1,}$/u.test(dados.nome)) problemas.push(['nome', 'Informe o seu nome.']);
  if (!/^[a-z]{2}\d{1,4}$/.test(dados.mundo)) problemas.push(['mundo', 'Informe o mundo como aparece no jogo, por exemplo br143.']);
  if (dados.nick.length < 2)           problemas.push(['nick',  'Informe o seu nick exatamente como está no jogo.']);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dados.email)) problemas.push(['email', 'Informe um e-mail válido para receber a confirmação.']);
  if (digitos.length < 10 || digitos.length > 13) problemas.push(['telefone', 'Informe o seu WhatsApp com DDD, por exemplo (48) 98824-2773.']);

  if (problemas.length) {
    const [campo, msg] = problemas[0];
    const el = forma.elements[campo];
    el?.classList.add('campo-erro');
    el?.focus();
    return avisar(msg);
  }

  const botao = $('#enviar');
  botao?.setAttribute('aria-busy', 'true');
  const rotulo = botao?.textContent;
  if (botao) botao.textContent = 'Preparando o pagamento…';

  try {
    const resposta = await fetch(PACTO.checkoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    const corpo = await resposta.json().catch(() => ({}));

    if (!resposta.ok || !corpo.init_point) {
      throw new Error(corpo.error || 'Não conseguimos abrir o pagamento agora.');
    }

    location.href = corpo.init_point;
  } catch (erro) {
    avisar(erro.message);
  } finally {
    botao?.removeAttribute('aria-busy');
    if (botao && rotulo) botao.textContent = rotulo;
  }
});

const ano = $('#ano');
if (ano) ano.textContent = new Date().getFullYear();
