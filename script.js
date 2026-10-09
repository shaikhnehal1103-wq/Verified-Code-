const card = document.getElementById('card');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const otp = document.getElementById('otp');
const loader = document.getElementById('loader');
const success = document.getElementById('success');
const ringBar = document.getElementById('ringBar');
const percent = document.getElementById('percent');
const confetti = document.getElementById('confetti');
const resend = document.getElementById('resend');
const resendBtn = document.getElementById('resendBtn');
const pointerLight = document.getElementById('pointerLight');
const digits = Array.from(document.querySelectorAll('.digit'));

const RING_LENGTH = 238.76; // 2 * PI * r (r = 38)
let busy = false;

/* cursor glow */
window.addEventListener('mousemove', (e) => {
  pointerLight.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

/* typing */
digits.forEach((box, i) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/\D/g, '').slice(-1);
    box.classList.toggle('filled', box.value !== '');

    if (box.value && i < digits.length - 1) {
      digits[i + 1].focus();
    }
    if (digits.every((d) => d.value)) {
      startVerify();
    }
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      digits[i - 1].focus();
      digits[i - 1].value = '';
      digits[i - 1].classList.remove('filled');
    }
    if (e.key === 'ArrowLeft' && i > 0) digits[i - 1].focus();
    if (e.key === 'ArrowRight' && i < digits.length - 1) digits[i + 1].focus();
  });

  box.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, digits.length);
    if (!pasted) return;

    pasted.split('').forEach((ch, n) => {
      digits[n].value = ch;
      digits[n].classList.add('filled');
    });
    if (pasted.length === digits.length) {
      startVerify();
    } else {
      digits[pasted.length].focus();
    }
  });
});

/* helpers */
function swapText(el, text) {
  el.classList.add('fade');
  setTimeout(() => {
    el.textContent = text;
    el.classList.remove('fade');
  }, 200);
}

function show(section) {
  [otp, loader, success].forEach((s) => s.classList.remove('is-active'));
  section.classList.add('is-active');
}

function scatterBoxes() {
  digits.forEach((box) => {
    const x = (Math.random() - 0.5) * 190;
    const y = (Math.random() - 0.5) * 150;
    const r = (Math.random() - 0.5) * 70;
    box.style.setProperty('--x', `${x}px`);
    box.style.setProperty('--y', `${y}px`);
    box.style.setProperty('--r', `${r}deg`);
  });
  otp.classList.add('scatter');
}

/* flow */
function startVerify() {
  if (busy) return;
  busy = true;
  digits.forEach((d) => d.blur());
  scatterBoxes();

  setTimeout(() => otp.classList.add('leaving'), 1100);

  setTimeout(() => {
    swapText(title, 'Verifying...');
    swapText(subtitle, 'Securely checking your credentials.');
    show(loader);
    runProgress(2400);
  }, 1500);
}

function runProgress(duration) {
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    percent.textContent = Math.round(eased * 100);
    ringBar.style.strokeDashoffset = RING_LENGTH * (1 - eased);

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(showSuccess, 250);
    }
  }
  requestAnimationFrame(tick);
}

function showSuccess() {
  swapText(title, 'Access Granted');
  swapText(subtitle, 'Welcome back. Redirecting to your vault...');
  resend.classList.add('hidden');
  card.classList.add('granted');
  show(success);
  setTimeout(burst, 350);
}

function burst() {
  const colors = ['#7c5cd6', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'];
  confetti.innerHTML = '';

  for (let i = 0; i < 26; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = colors[i % colors.length];
    confetti.appendChild(dot);

    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 60;

    dot.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.4)`,
          opacity: 0,
        },
      ],
      {
        duration: 900 + Math.random() * 500,
        easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
        fill: 'forwards',
      }
    );
  }
}

/* resend just clears the boxes and refocuses */
resendBtn.addEventListener('click', () => {
  if (busy) return;
  digits.forEach((d) => {
    d.value = '';
    d.classList.remove('filled');
  });
  digits[0].focus();

  resendBtn.textContent = 'Sent!';
  setTimeout(() => (resendBtn.textContent = 'Resend'), 1800);
});

digits[0].focus();
