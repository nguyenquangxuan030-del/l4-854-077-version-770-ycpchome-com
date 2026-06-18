(function () {
  window.initMoviePlayer = function (src) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var startButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
    var loaded = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    startButtons.forEach(function (button) {
      button.addEventListener('click', attach);
    });

    video.addEventListener('click', function () {
      if (!loaded) {
        attach();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
