const PACT = {
  expiresAt: '2026-10-14T23:59:59-03:00',
  checkoutUrl: 'https://multipro-indol.vercel.app/api/pacto/checkout',
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const deadline = new Date(PACT.expiresAt).getTime();
const heroClock = $('#clock');
const topClock = $('#clock-top');
const barClock = $('#clock-bar');

const twoDigits = n => String(n).padStart(2, '0');

function closePact() {
  document.body.dataset.pact = 'closed';

  const notice = $('#urgency-title');
  if (notice) notice.textContent = 'Este pacto foi encerrado';

  if (heroClock) {
    heroClock.innerHTML =
      '<p class="pact-closed">As três casas cumpriram o prazo combinado. ' +
      'Chame no WhatsApp para saber da próxima.</p>';
  }

  if (topClock) topClock.textContent = 'Encerrado';
  if (barClock) barClock.textContent = 'Encerrado';
}

function tick() {
  const remaining = deadline - Date.now();

  if (!Number.isFinite(deadline)) return;
  if (remaining <= 0) { closePact(); return true; }

  const seconds = Math.floor(remaining / 1000) % 60;
  const minutes = Math.floor(remaining / 60000) % 60;
  const hours   = Math.floor(remaining / 3600000) % 24;
  const days    = Math.floor(remaining / 86400000);

  if (heroClock) {
    $$('[data-unit]', heroClock).forEach(el => {
      const value = { day: days, hour: hours, min: minutes, sec: seconds }[el.dataset.unit];
      el.textContent = twoDigits(value);
    });
  }

  const short = days > 0
    ? `${days}d ${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
    : `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;

  if (topClock) topClock.textContent = short;
  if (barClock) barClock.textContent = short;

  return false;
}

if (Number.isFinite(deadline)) {
  if (!tick()) {
    const id = setInterval(() => { if (tick()) clearInterval(id); }, 1000);
  }
}

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px 18% 0px' });

$$('.reveal').forEach(el => observer.observe(el));

const seal = $('#seal');

if (seal) {
  const sealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      setTimeout(() => {
        $('#stamp', seal)?.classList.add('sealed');
        seal.classList.add('sealed');
        const notice = $('#seal-notice', seal);
        if (notice) notice.textContent = 'Pacto selado, agora escolha o seu';
      }, reducedMotion ? 0 : 420);

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.55 });

  sealObserver.observe(seal);
}

function revealNow(target) {
  if (!target) return;
  const elements = [target, ...$$('.reveal', target)].filter(e => e.classList.contains('reveal'));
  elements.forEach(e => { e.classList.add('visible'); observer.unobserve(e); });
}

$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const id = link.getAttribute('href').slice(1);
    if (id) revealNow(document.getElementById(id));
  });
});

const readingBar = $('#progress');

if (readingBar) {
  let scheduled = false;

  const measure = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    const read  = total > 0 ? Math.min(scrollY / total, 1) : 0;
    readingBar.style.transform = `scaleX(${read})`;
    scheduled = false;
  };

  addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(measure);
  }, { passive: true });

  measure();
}

const picker = $('#package');
const form   = $('#form');

$$('[data-pick]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const key = btn.dataset.pick;

    if (picker) picker.value = key;

    revealNow(document.getElementById('sign'));
    form?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });

    setTimeout(() => {
      const empty = $$('#form input').find(i => !i.value);
      empty?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 700);
  });
});

const message = $('#message');

function warn(text, type = 'error') {
  if (!message) return;
  message.textContent = text;
  message.className = `message message-${type}`;
  message.hidden = false;
}

function clearWarning() {
  if (message) message.hidden = true;
  $$('.field-error').forEach(el => el.classList.remove('field-error'));
}

form?.addEventListener('submit', async e => {
  e.preventDefault();
  clearWarning();

  if (document.body.dataset.pact === 'closed') {
    return warn('Este pacto já foi encerrado. Chame no WhatsApp para saber da próxima.');
  }

  const data = Object.fromEntries(new FormData(form));
  data.nome     = data.nome.trim().replace(/\s+/g, ' ');
  data.mundo    = data.mundo.trim().toLowerCase();
  data.nick     = data.nick.trim();
  data.email    = data.email.trim();
  data.telefone = data.telefone.trim();

  const digits = data.telefone.replace(/\D/g, '');

  const issues = [];
  if (!/^\p{L}[\p{L}\s'.-]{1,}$/u.test(data.nome)) issues.push(['nome', 'Informe o seu nome.']);
  if (!/^[a-z]{2}\d{1,4}$/.test(data.mundo)) issues.push(['mundo', 'Informe o mundo como aparece no jogo, por exemplo br143.']);
  if (data.nick.length < 2)           issues.push(['nick',  'Informe o seu nick exatamente como está no jogo.']);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) issues.push(['email', 'Informe um e-mail válido para receber a confirmação.']);
  if (digits.length < 10 || digits.length > 13) issues.push(['telefone', 'Informe o seu WhatsApp com DDD, por exemplo (48) 98824-2773.']);

  if (issues.length) {
    const [field, msg] = issues[0];
    const el = form.elements[field];
    el?.classList.add('field-error');
    el?.focus();
    return warn(msg);
  }

  const button = $('#submit');
  button?.setAttribute('aria-busy', 'true');
  const label = button?.textContent;
  if (button) button.textContent = 'Preparando o pagamento…';

  try {
    const response = await fetch(PACT.checkoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.init_point) {
      throw new Error(body.error || 'Não conseguimos abrir o pagamento agora.');
    }

    location.href = body.init_point;
  } catch (error) {
    warn(error.message);
  } finally {
    button?.removeAttribute('aria-busy');
    if (button && label) button.textContent = label;
  }
});

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();
