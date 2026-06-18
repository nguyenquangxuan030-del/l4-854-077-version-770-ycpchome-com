(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var searchInput = document.getElementById('site-search');
  var searchResults = document.querySelector('[data-search-results]');
  var clearSearch = document.querySelector('[data-clear-search]');

  if (searchInput && searchResults) {
    var cards = Array.prototype.slice.call(searchResults.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;

    function runSearch() {
      var query = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', query && text.indexOf(query) === -1);
      });
    }

    searchInput.addEventListener('input', runSearch);

    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        searchInput.value = '';
        runSearch();
        searchInput.focus();
      });
    }

    runSearch();
  }

  var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  filterScopes.forEach(function (scope) {
    var wrap = scope.parentElement;
    var year = 'all';
    var region = 'all';
    var cards = Array.prototype.slice.call(wrap.querySelectorAll('.movie-card'));

    function setActive(selector, value) {
      Array.prototype.slice.call(scope.querySelectorAll(selector)).forEach(function (button) {
        var key = button.getAttribute(selector.replace('[', '').replace(']', '').split('=')[0]);
        button.classList.toggle('active', key === value);
      });
    }

    function applyFilters() {
      cards.forEach(function (card) {
        var okYear = year === 'all' || card.getAttribute('data-year') === year;
        var okRegion = region === 'all' || card.getAttribute('data-region') === region;
        card.classList.toggle('hidden-card', !(okYear && okRegion));
      });
    }

    Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]')).forEach(function (button) {
      button.addEventListener('click', function () {
        year = button.getAttribute('data-filter-year');
        setActive('[data-filter-year]', year);
        applyFilters();
      });
    });

    Array.prototype.slice.call(scope.querySelectorAll('[data-filter-region]')).forEach(function (button) {
      button.addEventListener('click', function () {
        region = button.getAttribute('data-filter-region');
        setActive('[data-filter-region]', region);
        applyFilters();
      });
    });
  });
})();
