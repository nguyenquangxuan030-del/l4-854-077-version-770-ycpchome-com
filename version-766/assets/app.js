(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function rootPrefix() {
        return document.body.getAttribute("data-prefix") || "";
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        if (slides.length) {
            showSlide(0);
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var movieCards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
        var pageSearch = document.querySelector("[data-page-search]");
        if (pageSearch && movieCards.length) {
            pageSearch.addEventListener("input", function () {
                var value = pageSearch.value.trim().toLowerCase();
                movieCards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    card.classList.toggle("hidden-card", value && haystack.indexOf(value) === -1);
                });
            });
        }

        var searchBoxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));
        var movies = window.SEARCH_MOVIES || [];
        searchBoxes.forEach(function (box) {
            var panel = box.parentElement ? box.parentElement.querySelector("[data-search-results]") : null;
            if (!panel) {
                return;
            }
            box.addEventListener("input", function () {
                var query = box.value.trim().toLowerCase();
                if (!query) {
                    panel.classList.remove("is-open");
                    panel.innerHTML = "";
                    return;
                }
                var prefix = rootPrefix();
                var results = movies.filter(function (movie) {
                    return [movie.title, movie.year, movie.type, movie.region, movie.genre].join(" ").toLowerCase().indexOf(query) !== -1;
                }).slice(0, 10);
                panel.innerHTML = results.map(function (movie) {
                    return '<a class="search-item" href="' + prefix + movie.url + '">' +
                        '<img src="' + prefix + movie.img + '" alt="' + escapeHtml(movie.title) + '">' +
                        '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
                        '<small>' + escapeHtml(movie.year + " · " + movie.type + " · " + movie.region) + '</small></span>' +
                        '</a>';
                }).join("");
                panel.classList.toggle("is-open", results.length > 0);
            });
            document.addEventListener("click", function (event) {
                if (!panel.contains(event.target) && event.target !== box) {
                    panel.classList.remove("is-open");
                }
            });
        });

        function escapeHtml(value) {
            return String(value).replace(/[&<>'"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "'": "&#39;",
                    "\"": "&quot;"
                }[char];
            });
        }

        var player = document.querySelector(".player-shell");
        if (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var button = player.querySelector(".player-button");
            var src = player.getAttribute("data-play-src");
            var started = false;

            function start() {
                if (!video || !src) {
                    return;
                }
                if (!started) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = src;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new Hls();
                        hls.loadSource(src);
                        hls.attachMedia(video);
                    } else {
                        video.src = src;
                    }
                    started = true;
                }
                player.classList.add("is-playing");
                video.controls = true;
                video.play().catch(function () {});
            }

            if (button) {
                button.addEventListener("click", start);
            }
            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }
    });
})();
