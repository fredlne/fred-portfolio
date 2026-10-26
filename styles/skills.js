document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.skills-item');
  items.forEach(item => {
    const level = Math.max(0, Math.min(100, Number(item.dataset.level) || 0));
    item.style.setProperty('--level', `${level}%`);
  });
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  items.forEach(item => observer.observe(item));
});