// public/scripts/projects-gallery.js
// JS puro + JSDoc para que VSCode no se queje con TS

function initGallery() {
  const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
  const projectCards = Array.from(document.querySelectorAll('.project-card'));

  /** @type {HTMLInputElement|null} */
  const searchInput = document.getElementById('search-input');

  /** @type {HTMLElement|null} */
  const noResults = document.getElementById('no-results');

  /** @type {HTMLButtonElement|null} */
  const resetBtn = document.getElementById('reset-filter');

  let currentFilter = 'all';

  function applyFilters() {
    const searchTerm = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase();
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const title = card.getAttribute('data-title') || '';

      const matchesFilter = currentFilter === 'all' || category === currentFilter;
      const matchesSearch = title.includes(searchTerm);

      /** @type {HTMLElement} */
      const el = /** @type {any} */ (card);

      if (matchesFilter && matchesSearch) {
        el.style.display = 'block';
        visibleCount++;
      } else {
        el.style.display = 'none';
      }
    });

    if (noResults) {
      if (visibleCount === 0) noResults.classList.remove('hidden');
      else noResults.classList.add('hidden');
    }
  }

  // Filtros
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active-style'));
      chip.classList.add('active-style');
      currentFilter = chip.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentFilter = 'all';
      if (filterChips[0]) filterChips[0].dispatchEvent(new Event('click'));
    });
  }

  // ===== Modal =====
  /** @type {HTMLElement|null} */
  const modal = document.getElementById('project-modal');
  /** @type {HTMLElement|null} */
  const backdrop = document.getElementById('project-modal-backdrop');
  /** @type {HTMLButtonElement|null} */
  const closeBtn = document.getElementById('modal-close');

  /** @type {HTMLElement|null} */
  const titleEl = document.getElementById('modal-title');
  /** @type {HTMLElement|null} */
  const descEl = document.getElementById('modal-desc');
  /** @type {HTMLElement|null} */
  const tagEl = document.getElementById('modal-tag');

  /** @type {HTMLImageElement|null} */
  const imgEl = document.getElementById('modal-image');
  /** @type {HTMLElement|null} */
  const thumbsEl = document.getElementById('modal-thumbs');
  /** @type {HTMLButtonElement|null} */
  const prevBtn = document.getElementById('modal-prev');
  /** @type {HTMLButtonElement|null} */
  const nextBtn = document.getElementById('modal-next');
  /** @type {HTMLElement|null} */
  const counterEl = document.getElementById('modal-counter');

  /** @type {string[]} */
  let currentImages = [];
  let currentIndex = 0;

  function isOpen() {
    return !!(modal && !modal.classList.contains('hidden'));
  }

  function renderModal() {
    if (!imgEl || !currentImages.length) return;

    imgEl.src = currentImages[currentIndex];
    if (counterEl) counterEl.textContent = String(currentIndex + 1) + ' / ' + String(currentImages.length);

    if (thumbsEl) {
      thumbsEl.innerHTML = '';
      currentImages.slice(0, 9).forEach((src, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'aspect-[4/3] rounded-xl overflow-hidden border transition ' +
          (i === currentIndex ? 'border-[#cd5a37]' : 'border-zinc-200 hover:border-zinc-400');

        btn.innerHTML =
          '<img src="' + src + '" alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />';

        btn.addEventListener('click', () => {
          currentIndex = i;
          renderModal();
        });

        thumbsEl.appendChild(btn);
      });
    }
  }

  function openModal(project) {
    if (!modal) return;

    if (titleEl) titleEl.textContent = project.title || 'Proyecto';
    if (descEl) descEl.textContent = project.description || '';
    if (tagEl) tagEl.textContent = project.tag || 'Proyecto';

    currentImages = (project.images && project.images.length) ? project.images : [project.cover];
    currentIndex = 0;

    renderModal();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function prev() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderModal();
  }

  function next() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderModal();
  }

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const raw = card.getAttribute('data-project');
      if (!raw) return;
      try {
        const project = JSON.parse(raw);
        openModal(project);
      } catch (_) {}
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        /** @type {HTMLElement} */ (/** @type {any} */ (card)).click();
      }
    });
  });

  if (backdrop) backdrop.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  applyFilters();
}

// Inicial + compat con Astro view transitions
initGallery();
document.addEventListener('astro:after-swap', initGallery);
