(function () {
  var root = document.documentElement;
  var label = document.querySelector('[data-theme-label]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (label) label.textContent = theme;
  }

  applyTheme(root.getAttribute('data-theme') || 'dark');

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // "Typing" effect for the prompt line. Skipped when the user prefers reduced motion.
  var typed = document.querySelector('[data-type]');
  var reveal = document.querySelector('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!typed) return;
  var text = typed.getAttribute('data-type');

  if (reduce) {
    typed.textContent = text;
    if (reveal) reveal.classList.add('show');
    return;
  }

  var i = 0;
  (function tick() {
    typed.textContent = text.slice(0, ++i);
    if (i < text.length) {
      setTimeout(tick, 90);
    } else if (reveal) {
      reveal.classList.add('show');
    }
  })();
})();
