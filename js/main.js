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
  document.querySelectorAll('.legend__item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      plan.classList.toggle('hide-' + btn.dataset.layer, !on);
    });
  });
})();
