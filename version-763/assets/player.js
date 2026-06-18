
import { H as Hls } from './hls-vendor-dru42stk.js';

function setMessage(shell, message) {
    var element = shell.querySelector('[data-player-message]');
    if (element) {
        element.textContent = message || '';
    }
}

function initializePlayer(shell) {
    var video = shell.querySelector('video[data-src]');
    if (!video) {
        return;
    }
    var source = video.getAttribute('data-src');
    if (!source) {
        setMessage(shell, '当前影片暂无可用播放源。');
        return;
    }
    if (video.dataset.initialized === 'true') {
        video.play().catch(function () {});
        return;
    }
    video.dataset.initialized = 'true';
    setMessage(shell, '正在加载播放源…');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            setMessage(shell, '');
            video.play().catch(function () {});
        }, { once: true });
    } else if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setMessage(shell, '');
            video.play().catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setMessage(shell, '播放源加载失败，请刷新页面或更换浏览器。');
                hls.destroy();
            }
        });
        video._hlsInstance = hls;
    } else {
        setMessage(shell, '当前浏览器不支持 HLS 播放。');
    }
}

function bindPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));
    shells.forEach(function (shell) {
        var overlay = shell.querySelector('[data-play-overlay]');
        var video = shell.querySelector('video[data-src]');
        function play() {
            shell.classList.add('is-playing');
            initializePlayer(shell);
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', bindPlayers);
