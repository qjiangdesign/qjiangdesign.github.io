/* Progressive motion: content remains visible when scripts or observers fail. */
(() => {
  const home = document.querySelector('.qje-home');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!home || reduced.matches || document.body.classList.contains('elementor-editor-active') || location.search.includes('elementor-preview')) return;
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const running = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reduced.matches) return;
      const animation = entry.target.animate([
        { opacity: 0.25, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
      running.add(animation);
      animation.finished.catch(() => {}).finally(() => running.delete(animation));
    });
  }, { threshold: 0.08 });
  home.querySelectorAll('.qje-intro, .qje-row, .qje-exploration > .elementor-widget-heading, .qje-about').forEach(el => observer.observe(el));
  reduced.addEventListener('change', () => {
    if (reduced.matches) { observer.disconnect(); running.forEach(animation => animation.cancel()); }
  });
})();
