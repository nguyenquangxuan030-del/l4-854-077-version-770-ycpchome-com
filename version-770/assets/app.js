(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          play();
        });
      });

      show(0);
      play();
    });

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var year = area.querySelector("[data-filter-year]");
      var type = area.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
      var empty = area.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-video]");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        attached = true;
      }

      function start() {
        attach();
        player.classList.add("is-playing");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!attached) {
            start();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
