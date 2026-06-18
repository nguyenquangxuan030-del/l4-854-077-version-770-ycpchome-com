(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function openNavigation() {
        var toggle = $('.nav-toggle');
        var links = $('.nav-links');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function setupLiveFilters() {
        $all('[data-live-filter]').forEach(function (panel) {
            var input = $('[data-filter-input]', panel);
            var chips = $all('[data-filter-chip]', panel);
            var cards = $all('[data-card]', panel);
            var chipValue = '';

            function update() {
                var query = normalize(input ? input.value : '');
                var chip = normalize(chipValue);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var passText = !query || haystack.indexOf(query) !== -1;
                    var passChip = !chip || haystack.indexOf(chip) !== -1;
                    card.classList.toggle('is-filter-hidden', !(passText && passChip));
                });
            }

            if (input) {
                input.addEventListener('input', update);
            }
            chips.forEach(function (chipButton) {
                chipButton.addEventListener('click', function () {
                    chips.forEach(function (button) {
                        button.classList.remove('is-active');
                    });
                    chipButton.classList.add('is-active');
                    chipValue = chipButton.getAttribute('data-filter-chip') || '';
                    update();
                });
            });
        });
    }

    function setupPlayer() {
        $all('[data-player]').forEach(function (player) {
            var video = $('video[data-video]', player);
            var button = $('[data-play-button]', player);
            if (!video || !button) {
                return;
            }

            function prepare() {
                var url = video.getAttribute('data-video');
                if (!url) {
                    return;
                }
                if (player.getAttribute('data-ready') === 'true') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    player.hlsPlayer = hls;
                } else {
                    video.src = url;
                }
                player.setAttribute('data-ready', 'true');
            }

            function play() {
                prepare();
                button.classList.add('is-hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    }

    function cardMarkup(movie) {
        return '<a class="movie-card poster-card" href="' + escapeHtml(movie.url) + '" data-card data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml((movie.tags || []).join(' ')) + '">' +
            '<span class="poster-cover">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="cover-shade"></span>' +
                '<span class="play-circle">▶</span>' +
                '<span class="score-pill">★ ' + escapeHtml(movie.rating) + '</span>' +
            '</span>' +
            '<span class="poster-body">' +
                '<strong>' + escapeHtml(movie.title) + '</strong>' +
                '<span class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>' +
            '</span>' +
        '</a>';
    }

    function setupSearchPage() {
        var page = $('[data-search-page]');
        var data = window.movieIndexData || [];
        if (!page || !data.length) {
            return;
        }
        var input = $('[data-search-input]', page);
        var region = $('[data-search-region]', page);
        var year = $('[data-search-year]', page);
        var results = $('[data-search-results]', page);

        function render() {
            var query = normalize(input ? input.value : '');
            var regionValue = normalize(region ? region.value : '');
            var yearValue = normalize(year ? year.value : '');
            var html = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.year,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine,
                    movie.category
                ].join(' '));
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!regionValue || haystack.indexOf(regionValue) !== -1) &&
                    (!yearValue || String(movie.year) === yearValue);
            }).map(cardMarkup).join('');
            results.innerHTML = html || '<div class="empty-state">没有找到匹配影片，可尝试更换关键词。</div>';
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        render();
    }

    openNavigation();
    setupHero();
    setupLiveFilters();
    setupPlayer();
    setupSearchPage();
})();
