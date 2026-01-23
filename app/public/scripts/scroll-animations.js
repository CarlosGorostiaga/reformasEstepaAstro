/**
 * Inicializa las animaciones de scroll usando Intersection Observer
 */
export function initScrollAnimations() {
  // Respeta accesibilidad: si el usuario pide menos animaciones, no animamos.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    document
      .querySelectorAll('.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-fade-in, .animate-scale')
      .forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // performance: una vez y listo
      }
    }
  }, observerOptions);

  // Observa TODAS tus clases de animación
  const selector = [
    '.animate-on-scroll',
    '.animate-slide-left',
    '.animate-slide-right',
    '.animate-fade-in',
    '.animate-scale'
  ].join(',');

  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => observer.observe(el));

  // Opcional: log
  // console.log(`🎬 Animando ${elements.length} elementos`);
}
