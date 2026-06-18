(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-filter-type]');
    var genreFilter = document.querySelector('[data-filter-genre]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(typeFilter && typeFilter.value);
      var genreValue = normalize(genreFilter && genreFilter.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var matchGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1 || normalize(card.dataset.tags).indexOf(genreValue) !== -1;
        var visible = matchKeyword && matchType && matchGenre;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, typeFilter, genreFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initPlayer() {
    var video = document.querySelector('video[data-stream]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-stream');
    var overlay = document.querySelector('[data-play-overlay]');
    var loader = document.querySelector('[data-video-loader]');

    function hideLoader() {
      if (loader) {
        loader.classList.add('is-hidden');
      }
    }

    function showMessage(message) {
      if (loader) {
        loader.textContent = message;
        loader.classList.remove('is-hidden');
      }
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoader);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          showMessage('网络波动，正在重连');
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          showMessage('播放恢复中');
          hls.recoverMediaError();
        } else {
          showMessage('播放遇到问题');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', hideLoader, { once: true });
    } else {
      showMessage('播放环境不支持');
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        overlay.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initSearch();
    initPlayer();
  });
})();
