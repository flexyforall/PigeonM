// Coverage planner: space list and map layer toggles.
(function () {
  const spaces = document.querySelectorAll('.space');
  const title = document.querySelector('[data-setup-title]');

  spaces.forEach((space) => {
    space.addEventListener('click', () => {
      spaces.forEach((s) => {
        s.classList.remove('is-active');
        s.setAttribute('aria-selected', 'false');
      });
      space.classList.add('is-active');
      space.setAttribute('aria-selected', 'true');
      if (title) title.textContent = space.querySelector('.space__title').textContent;
    });
  });

  const plan = document.querySelector('[data-plan]');

  // Keep the 596px floor plan centred in the free space left of the setup card,
  // shrinking it when the map is narrower than the design.
  const sheet = plan.querySelector('.plan');
  const fitPlan = () => {
    const room = plan.clientWidth - 4 - 330 - 4; // map width minus the setup card
    const scale = Math.min(1, (room - 56) / 596);
    sheet.style.left = `${(room - 596) / 2 + 3}px`;
    sheet.style.transform = scale < 1 ? `scale(${scale})` : '';
  };
  new ResizeObserver(fitPlan).observe(plan);
  fitPlan();

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
  // Parts of an advantage icon pop in one by one in random order.
  function popIcon(icon, delay = 0) {
    const parts = Array.from(icon.children).sort(() => Math.random() - 0.5);
    parts.forEach((part, i) => part.style.setProperty('--pd', `${delay + i * 90}ms`));
    icon.classList.add('is-in');
  }

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

  // Hero headline: a caret runs through the whole headline and paints the
  // semi-transparent text white.
  async function typeHeadline() {
    const inner = document.querySelector('.hero__inner');
    const heading = inner.querySelector('.hero__title');
    const caret = inner.querySelector('.hero__caret');
    const ghost = heading.querySelector('.ghost');

    // Caret offset from the design, measured against the second line.
    const caretDy = caret.offsetTop - ghost.offsetTop;

    const text = heading.textContent;
    heading.textContent = '';
    const chars = Array.from(text).map((c) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = c;
      heading.appendChild(span);
      return span;
    });

    const place = (x, top) => {
      caret.style.left = `${x + 1}px`;
      caret.style.top = `${top + caretDy}px`;
    };

    place(chars[0].offsetLeft, chars[0].offsetTop);
    caret.classList.add('blink');
    inner.classList.add('is-typing');
    await wait(350);
    caret.classList.remove('blink');

    for (const ch of chars) {
      ch.classList.add('on');
      place(ch.offsetLeft + ch.offsetWidth, ch.offsetTop);
      await wait(ch.textContent === ' ' ? 40 : 20 + Math.random() * 12);
    }
    caret.classList.add('blink'); // keeps blinking at the end of the headline
  }

  // Squares in the access-point icon keep fading out and back in at random.
  function twinkle(grid) {
    const dots = Array.from(grid.querySelectorAll('i'));
    setInterval(() => {
      const off = grid.querySelectorAll('i.is-off').length;
      const dot = dots[Math.floor(Math.random() * dots.length)];
      if (dot.classList.contains('is-off') || off < dots.length * 0.35) {
        dot.classList.toggle('is-off');
      }
    }, 140);
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

  // Page loader: progress follows real asset loading, then the green panel
  // grows to full screen and lifts off the page. Resolves when the page starts to show.
  function runLoader() {
    const loader = document.querySelector('.loader');
    if (!loader) return Promise.resolve();

    const panel = loader.querySelector('.loader__panel');
    const value = loader.querySelector('.loader__value');

    root.classList.add('is-loading');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    loader.querySelectorAll('.loader__line').forEach((line, i) => {
      setTimeout(() => line.classList.add('is-in'), 150 + i * 220);
    });

    // Progress source: page images + fonts; window load completes it.
    const images = Array.from(document.images).filter((img) => !loader.contains(img));
    const total = images.length + 1;
    let loaded = 0;
    const done = () => { loaded = Math.min(total, loaded + 1); };
    images.forEach((img) => {
      if (img.complete) loaded++;
      else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(done);
    if (document.readyState === 'complete') loaded = total;
    else window.addEventListener('load', () => { loaded = total; }, { once: true });

    const MIN_TIME = 2600; // never faster than this, so the sequence reads
    const MAX_TIME = 9000; // never hang on a slow asset
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const start = performance.now();
    let last = start;
    let shown = 0;

    return new Promise((resolve) => {
      const tick = (now) => {
        const elapsed = now - start;
        const dt = Math.min(64, now - last);
        last = now;
        const real = elapsed > MAX_TIME ? 100 : (loaded / total) * 100;
        const goal = Math.min(real, ease(Math.min(1, elapsed / MIN_TIME)) * 100);
        // critically damped follow: no jumps when an asset finishes loading
        shown += (goal - shown) * (1 - Math.exp(-dt / 140));
        if (goal - shown < 0.15) shown = goal;

        value.textContent = `${Math.floor(shown)}%`;
        panel.style.setProperty('--progress', (shown / 100).toFixed(4));

        if (shown < 100) requestAnimationFrame(tick);
        else finish();
      };
      requestAnimationFrame(tick);

      async function finish() {
        value.textContent = 'Ready';
        await wait(450);
        panel.classList.add('is-wide');
        await wait(900);
        panel.classList.add('is-full');
        await wait(1000);
        loader.classList.add('is-leaving');
        setTimeout(resolve, 450); // start the page animations as it uncovers
        await wait(1050);
        loader.remove();
        root.classList.remove('is-loading');
      }
    });
  }

  async function init() {
    const loaded = runLoader();
    if (document.fonts) await document.fonts.ready;

    document.querySelectorAll('[data-reveal]').forEach(splitLines);
    document.querySelectorAll('.card-slot').forEach((el, i) => el.style.setProperty('--i', i));
    startMarquee();

    await loaded;

    // Hero plays once the loader lifts.
    const lead = document.querySelector('.hero__lead');
    const cta = document.querySelector('.hero [data-rise]');
    // Supporting text and button appear together with the headline.
    typeHeadline();
    reveal(lead, 500);
    setTimeout(() => cta.classList.add('is-in'), 1100);

    // Other sections play once when they scroll into view.
    const sections = {
      '.advantages'(section) {
        section.querySelectorAll('.advantage').forEach((card, i) => {
          popIcon(card.querySelector('[data-pop]'), i * 160);
          card.querySelectorAll('[data-reveal]').forEach((el, j) => reveal(el, 250 + i * 120 + j * 90));
        });
      },
      '.cards'(section) {
        section.querySelectorAll('.card-slot').forEach((slot) => slot.classList.add('is-in'));
      },
      '.intro'(section) {
        section.querySelectorAll('[data-reveal]').forEach((el) => reveal(el));
        section.classList.add('is-in');
      },
      '.options'(section) {
        section.querySelectorAll('.space__title').forEach((el, i) => reveal(el, i * 70));
        section.querySelectorAll('.setup [data-reveal]').forEach((el, i) => reveal(el, 200 + i * 90));
        const grid = section.querySelector('.ap__grid');
        revealDots(grid, 400, 700);
        setTimeout(() => twinkle(grid), 1300);
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
