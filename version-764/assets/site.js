(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = scope.querySelector("[data-filter-input]");
      var sort = scope.querySelector("[data-sort-select]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
      var grid = root.querySelector(".movie-grid") || root.querySelector(".ranking-list");
      if (!grid) {
        return;
      }
      var activeCategory = "all";
      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }
      function apply() {
        var query = normalize(input ? input.value : "");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var category = card.getAttribute("data-category") || "";
          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchCategory = activeCategory === "all" || category === activeCategory;
          card.style.display = matchText && matchCategory ? "" : "none";
        });
      }
      function sortCards() {
        if (!sort) {
          return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var mode = sort.value;
        cards.sort(function (a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (mode === "title") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
          }
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      }
      if (input) {
        input.addEventListener("input", apply);
        var params = new URLSearchParams(window.location.search);
        var preset = params.get("q");
        if (preset) {
          input.value = preset;
        }
      }
      if (sort) {
        sort.addEventListener("change", sortCards);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          activeCategory = button.getAttribute("data-filter-button") || "all";
          apply();
        });
      });
      sortCards();
      apply();
    });
  }

  function attachStream(video, source) {
    if (video._streamReady) {
      return;
    }
    video._streamReady = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
      video._hls = hls;
    }
  }

  window.setupMoviePlayer = function (videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    function start() {
      attachStream(video, source);
      if (overlay) {
        overlay.hidden = true;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
