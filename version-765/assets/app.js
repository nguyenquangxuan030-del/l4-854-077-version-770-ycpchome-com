(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    root.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });

    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var search = qs('[data-filter-search]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var category = qs('[data-filter-category]', panel);
      var cards = qsa('[data-movie-card]', scope);

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var query = normalize(search && search.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var selectedCategory = normalize(category && category.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre')
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
            ok = false;
          }
          if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
            ok = false;
          }
          card.classList.toggle('is-filter-hidden', !ok);
        });
      }

      [search, type, year, category].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
