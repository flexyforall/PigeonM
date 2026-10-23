// Coverage planner: space tabs and map layer toggles.
(function () {
  const tabs = document.querySelectorAll('.tab');
  const title = document.querySelector('[data-setup-title]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      if (title) title.textContent = tab.querySelector('.tab__title').textContent;
    });
  });

  const plan = document.querySelector('[data-plan]');

  // Shrink the 959px floor-plan drawing to fit when the map is narrower than the design.
  const canvas = plan.querySelector('.plan__canvas');
  const fitCanvas = () => {
    const scale = Math.min(1, plan.clientWidth / canvas.offsetWidth);
    canvas.style.transform = scale < 1 ? `scale(${scale})` : '';
  };
  new ResizeObserver(fitCanvas).observe(plan);
  fitCanvas();

  document.querySelectorAll('.legend__item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      plan.classList.toggle('hide-' + btn.dataset.layer, !on);
    });
  });
})();

// Entrance and ambient animations (only when <html> has the `anim` class).
(function () {
  const root = document.documentElement;
  if (!root.classList.contains('anim')) return;
  root.classList.add('anim-ready');

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Split a text-only element into lines that can rise from their baseline.
  function splitLines(el) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    const words = text.split(' ').map((word, i) => {
      if (i) el.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.textContent = word;
      el.appendChild(span);
      return span;
    });

    const lines = [];
    let top = null;
    words.forEach((span) => {
      if (span.offsetTop !== top) {
        top = span.offsetTop;
        lines.push([]);
      }
      lines[lines.length - 1].push(span.textContent);
    });

    el.textContent = '';
    lines.forEach((line, i) => {
      const outer = document.createElement('span');
      outer.className = 'line';
      const inner = document.createElement('span');
      inner.className = 'line__inner';
      inner.style.setProperty('--li', i);
      inner.textContent = line.join(' ');
      outer.appendChild(inner);
      el.appendChild(outer);
    });
    el.classList.add('is-split');
  }

  function reveal(el, delay = 0) {
    el.style.setProperty('--d', `${delay + (Number(el.dataset.reveal) || 0)}ms`);
    el.classList.add('is-in');
    const last = el.querySelector('.line:last-child .line__inner');
    if (last) {
      last.addEventListener('transitionend', () => el.classList.add('is-done'), { once: true });
    }
  }

  // Squares of a dot icon appear one by one in random order.
  function revealDots(icon, delay = 0, duration = 800) {
    const dots = Array.from(icon.querySelectorAll('i'));
    for (let i = dots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dots[i], dots[j]] = [dots[j], dots[i]];
    }
    const step = duration / dots.length;
    dots.forEach((dot, i) => dot.style.setProperty('--dd', `${Math.round(delay + i * step)}ms`));
    icon.classList.add('is-in');
  }

  // Hero headline: a caret with a trailing green highlight runs through the whole
  // headline and paints the semi-transparent text white.
  async function typeHeadline() {
    const inner = document.querySelector('.hero__inner');
    const heading = inner.querySelector('.hero__title');
    const caret = inner.querySelector('.hero__caret');
    const highlight = inner.querySelector('.hero__highlight');
    const ghost = heading.querySelector('.ghost');

    // Vertical offsets from the design, measured against the second line.
    const lineTop2 = ghost.offsetTop;
    const caretDy = caret.offsetTop - lineTop2;
    const highlightDy = highlight.offsetTop - lineTop2;
    const trail = 136; // highlight length behind the caret, as in the design

    const text = heading.textContent;
    heading.textContent = '';
    const chars = Array.from(text).map((c) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = c;
      heading.appendChild(span);
      return span;
    });

    let lineTop = null;
    let lineStart = 0;
    const place = (x, top) => {
      const lineChanged = top !== lineTop;
      if (lineChanged) {
        lineTop = top;
        lineStart = x;
      }
      caret.style.left = `${x + 1}px`;
      caret.style.top = `${top + caretDy}px`;
      const left = Math.max(lineStart, x - trail);
      highlight.classList.toggle('is-moving', !lineChanged);
      highlight.style.top = `${top + highlightDy}px`;
      highlight.style.left = `${left}px`;
      highlight.style.width = `${x - left}px`;
    };

    place(chars[0].offsetLeft, chars[0].offsetTop);
    caret.classList.add('blink');
    inner.classList.add('is-typing');
    await wait(900);
    caret.classList.remove('blink');

    for (const ch of chars) {
      ch.classList.add('on');
      if (ch.offsetTop !== lineTop) place(ch.offsetLeft, ch.offsetTop); // new line starts at its first letter
      place(ch.offsetLeft + ch.offsetWidth, ch.offsetTop);
      await wait(ch.textContent === ' ' ? 60 : 34 + Math.random() * 24);
    }

    // Highlight folds into the caret, which keeps blinking at the end of the headline.
    const end = parseFloat(caret.style.left) - 1;
    highlight.classList.remove('is-moving');
    highlight.classList.add('is-closing');
    highlight.style.left = `${end}px`;
    highlight.style.width = '0px';
    caret.classList.add('blink');
    await wait(250);
  }

  // Endless right-to-left logo strip.
  function startMarquee() {
    const strip = document.querySelector('.logos');
    const set = document.createElement('div');
    set.className = 'logos__set';
    set.append(...strip.children);
    const track = document.createElement('div');
    track.className = 'logos__track';
    track.appendChild(set);
    strip.appendChild(track);
    strip.classList.add('is-marquee');

    const width = set.offsetWidth;
    const copies = Math.ceil(window.screen.width / width) + 1;
    for (let i = 0; i < copies; i++) {
      const clone = set.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
    track.style.setProperty('--marquee-shift', `${-width}px`);
    track.style.setProperty('--marquee-duration', `${width / 45}s`); // ~45px per second
  }

  async function init() {
    if (document.fonts) await document.fonts.ready;

    document.querySelectorAll('[data-reveal]').forEach(splitLines);
    document.querySelectorAll('.segment').forEach((el, i) => el.style.setProperty('--i', i));
    startMarquee();

    // Hero plays on load.
    const lead = document.querySelector('.hero__lead');
    const cta = document.querySelector('.hero [data-rise]');
    typeHeadline().then(() => {
      reveal(lead);
      setTimeout(() => cta.classList.add('is-in'), 350);
    });

    // Other sections play once when they scroll into view.
    const sections = {
      '.advantages'(section) {
        section.querySelectorAll('.advantage').forEach((card, i) => {
          revealDots(card.querySelector('[data-dots]'), i * 160, 800);
          card.querySelectorAll('[data-reveal]').forEach((el, j) => reveal(el, 250 + i * 120 + j * 90));
        });
      },
      '.segments'(section) {
        section.querySelectorAll('.segment').forEach((card, i) => {
          card.querySelectorAll('[data-reveal]').forEach((el, j) => reveal(el, i * 70 + j * 80));
        });
        section.classList.add('is-in');
      },
      '.intro'(section) {
        section.querySelectorAll('[data-reveal]').forEach((el) => reveal(el));
        section.classList.add('is-in');
      },
      '.coverage'(section) {
        section.querySelectorAll('.tab__title').forEach((el, i) => reveal(el, i * 60));
        section.querySelectorAll('.setup [data-reveal]').forEach((el, i) => reveal(el, 200 + i * 90));
        revealDots(section.querySelector('.ap__grid'), 400, 700);
      },
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          entry.target._play(entry.target);
        });
      },
      { rootMargin: '0px 0px -20% 0px' }
    );
    Object.entries(sections).forEach(([selector, play]) => {
      const section = document.querySelector(selector);
      section._play = play;
      observer.observe(section);
    });
  }

  init();
})();
