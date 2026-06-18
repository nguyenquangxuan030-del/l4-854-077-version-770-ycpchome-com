
(function () {
    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot) {
                var dotIndex = Number(dot.getAttribute('data-hero-dot'));
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });
        if (previous) {
            previous.addEventListener('click', function () {
                activate(activeIndex - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                activate(activeIndex + 1);
                start();
            });
        }
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-local-search]');
            var year = panel.querySelector('[data-year-filter]');
            var count = panel.querySelector('[data-filter-count]');
            var list = document.querySelector('[data-search-list]');
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
            if (!cards.length) {
                return;
            }
            if (input && input.hasAttribute('data-autofill-query')) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q') || '';
                if (query) {
                    input.value = query;
                }
            }

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var selectedYear = normalize(year ? year.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-category')
                    ].join(' '));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
                    var show = matchesQuery && matchesYear;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
