(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function(dot) {
        var dotIndex = Number(dot.getAttribute('data-hero-dot'));
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function(panel) {
    var container = panel.parentElement;
    var list = container ? container.querySelector('[data-filter-list]') : null;
    if (!list) {
      list = document;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-year-filter]');
    var region = panel.querySelector('[data-region-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var empty = container ? container.querySelector('[data-empty-result]') : null;

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var shown = 0;

      cards.forEach(function(card) {
        var text = card.getAttribute('data-title') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var visible = matchKeyword && matchYear && matchRegion && matchType;
        card.classList.toggle('hidden-card', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    [input, year, region, type].forEach(function(element) {
      if (element) {
        element.addEventListener('input', filterCards);
        element.addEventListener('change', filterCards);
      }
    });
  });
}());
