// public/scripts/projects-gallery.js
(function () {
  function initGallery() {
    // ====== Elements ======
    var filterChips = document.querySelectorAll('.filter-chip');
    var projectCards = document.querySelectorAll('.project-card');
    var searchInput = document.getElementById('search-input');
    var noResults = document.getElementById('no-results');
    var resetBtn = document.getElementById('reset-filter');

    // Modal
    var modal = document.getElementById('project-modal');
    var backdrop = document.getElementById('project-modal-backdrop');
    var closeBtn = document.getElementById('modal-close');
    var closeBtn2 = document.getElementById('modal-close-2');

    var tagEl = document.getElementById('modal-tag');
    var titleEl = document.getElementById('modal-title');
    var descEl = document.getElementById('modal-desc');

    var imageEl = document.getElementById('modal-image');
    var thumbsEl = document.getElementById('modal-thumbs');
    var counterEl = document.getElementById('modal-counter');

    var prevBtn = document.getElementById('modal-prev');
    var nextBtn = document.getElementById('modal-next');

    // Safety: if not on the page
    if (!modal || !imageEl || !thumbsEl || !counterEl) return;

    // ====== State ======
    var currentFilter = 'all';
    var currentImages = [];
    var currentIndex = 0;
    var modalOpen = false;

    // ====== Helpers ======
    function lockBodyScroll() {
      // store scroll position and lock
      var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.dataset.scrollY = String(scrollY);
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    }

    function unlockBodyScroll() {
      var scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      delete document.body.dataset.scrollY;
      window.scrollTo(0, scrollY);
    }

    function safeJSONParse(str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    }

    function setModalImage(idx) {
      if (!currentImages.length) return;

      // clamp
      if (idx < 0) idx = currentImages.length - 1;
      if (idx >= currentImages.length) idx = 0;

      currentIndex = idx;
      imageEl.src = currentImages[currentIndex] || '';
      // keep alt coherent
      imageEl.alt = (titleEl && titleEl.textContent) ? titleEl.textContent : 'Proyecto';

      // counter
      counterEl.textContent = (currentIndex + 1) + ' / ' + currentImages.length;

      // thumbs active state
      var thumbs = thumbsEl.querySelectorAll('[data-thumb-index]');
      thumbs.forEach(function (t) {
        t.classList.remove('ring-2', 'ring-[#cd5a37]');
        t.classList.add('opacity-80');
      });

      var active = thumbsEl.querySelector('[data-thumb-index="' + currentIndex + '"]');
      if (active) {
        active.classList.add('ring-2', 'ring-[#cd5a37]');
        active.classList.remove('opacity-80');
        // ensure visible in mobile horizontal scroll
        if (active.scrollIntoView) {
          active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }

    function renderThumbs(images) {
      thumbsEl.innerHTML = '';
      images.forEach(function (src, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-thumb-index', String(idx));
        btn.className =
          // size good for both modes (mobile horizontal + desktop grid)
          'relative overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200 aspect-[4/3] ' +
          'min-w-[110px] sm:min-w-0 ' +
          'opacity-80 hover:opacity-100 transition';

        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Miniatura ' + (idx + 1);
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = 'w-full h-full object-cover';

        btn.appendChild(img);

        btn.addEventListener('click', function () {
          setModalImage(idx);
        });

        thumbsEl.appendChild(btn);
      });
    }

    function openModal(project) {
      if (!project) return;

      // Fill header
      if (tagEl) tagEl.textContent = project.tag || 'Proyecto';
      if (titleEl) titleEl.textContent = project.title || 'Proyecto';
      if (descEl) descEl.textContent = project.description || '';

      currentImages = Array.isArray(project.images) && project.images.length ? project.images : [project.cover].filter(Boolean);
      currentIndex = 0;

      renderThumbs(currentImages);
      setModalImage(0);

      // show modal
      modal.classList.remove('hidden');
      modalOpen = true;

      lockBodyScroll();

      // focus close button for accessibility
      if (closeBtn && closeBtn.focus) closeBtn.focus();
    }

    function closeModal() {
      if (!modalOpen) return;
      modal.classList.add('hidden');
      modalOpen = false;

      // cleanup
      currentImages = [];
      currentIndex = 0;
      imageEl.src = '';
      thumbsEl.innerHTML = '';
      counterEl.textContent = '';

      unlockBodyScroll();
    }

    // ====== Filters/Search ======
    function applyFilters() {
      var term = '';
      if (searchInput && typeof searchInput.value === 'string') term = searchInput.value.toLowerCase();

      var visibleCount = 0;

      projectCards.forEach(function (card) {
        var category = card.getAttribute('data-category') || '';
        var title = card.getAttribute('data-title') || '';

        var matchesFilter = (currentFilter === 'all') || (category === currentFilter);
        var matchesSearch = title.indexOf(term) !== -1;

        if (matchesFilter && matchesSearch) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResults) {
        if (visibleCount === 0) noResults.classList.remove('hidden');
        else noResults.classList.add('hidden');
      }
    }

    // ====== Events ======
    filterChips.forEach(function (chip, idx) {
      chip.addEventListener('click', function () {
        filterChips.forEach(function (c) {
          c.classList.remove('active-style');
        });
        chip.classList.add('active-style');
        currentFilter = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      });

      // default active (if not set by SSR)
      if (idx === 0 && chip.classList.contains('active-style')) {
        currentFilter = chip.getAttribute('data-filter') || 'all';
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        currentFilter = 'all';
        // click first chip if exists
        if (filterChips[0] && filterChips[0].click) filterChips[0].click();
        else applyFilters();
      });
    }

    // open modal from card
    function attachCard(card) {
      function handler() {
        var raw = card.getAttribute('data-project') || '';
        var project = safeJSONParse(raw);
        openModal(project);
      }

      card.addEventListener('click', handler);

      // keyboard support
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    }

    projectCards.forEach(attachCard);

    // close modal actions
    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

    // prev/next
    if (prevBtn) prevBtn.addEventListener('click', function () { setModalImage(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { setModalImage(currentIndex + 1); });

    // esc + arrows
    document.addEventListener('keydown', function (e) {
      if (!modalOpen) return;

      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'ArrowLeft') {
        setModalImage(currentIndex - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        setModalImage(currentIndex + 1);
        return;
      }
    });

    // swipe on image (mobile)
    var startX = 0;
    var startY = 0;
    var touching = false;

    imageEl.addEventListener('touchstart', function (e) {
      if (!modalOpen) return;
      if (!e.touches || !e.touches.length) return;
      touching = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    imageEl.addEventListener('touchend', function (e) {
      if (!modalOpen || !touching) return;
      touching = false;

      if (!e.changedTouches || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;

      // ignore vertical swipes
      if (Math.abs(dy) > Math.abs(dx)) return;

      // threshold
      if (dx > 40) setModalImage(currentIndex - 1);
      else if (dx < -40) setModalImage(currentIndex + 1);
    }, { passive: true });

    // initial
    applyFilters();
  }

  // Run now
  initGallery();

  // Astro view transitions
  document.addEventListener('astro:after-swap', initGallery);
})();
