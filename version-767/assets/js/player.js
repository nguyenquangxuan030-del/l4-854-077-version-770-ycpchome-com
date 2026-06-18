(function () {
  var video = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-play-trigger]');

  if (!video || !trigger) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var prepared = false;
  var hlsInstance = null;

  function attachStream() {
    if (prepared) {
      return Promise.resolve();
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function () {
          resolve();
        });
      });
    }

    video.src = stream;
    return Promise.resolve();
  }

  function playVideo() {
    trigger.hidden = true;
    attachStream().then(function () {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          trigger.hidden = false;
        });
      }
    });
  }

  trigger.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
})();
