(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var current = 0;
      var show = function (index) {
        current = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5600);
    }

    var input = document.querySelector("[data-search-input]");
    var clear = document.querySelector("[data-search-clear]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var empty = document.querySelector("[data-empty-state]");
    if (input && cards.length) {
      var filter = function () {
        var q = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var hay = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var hit = !q || hay.indexOf(q) !== -1;
          card.classList.toggle("hidden-by-search", !hit);
          if (hit) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      input.addEventListener("input", filter);
      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          filter();
          input.focus();
        });
      }
    }
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var shell = document.getElementById("playerShell");
    var start = document.getElementById("playerStart");
    if (!video || !shell || !start || !streamUrl) {
      return;
    }
    var attached = false;
    var attach = function () {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    };
    var begin = function () {
      attach();
      shell.classList.add("is-playing");
      start.style.display = "none";
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          start.style.display = "flex";
          shell.classList.remove("is-playing");
        });
      }
    };
    start.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  };
})();
