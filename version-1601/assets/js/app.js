(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = qs('[data-menu-button]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initGlobalSearch() {
        qsa('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input) {
                    return;
                }
                if (!input.value.trim()) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function initHeroSlider() {
        var frame = qs('[data-hero-slider]');
        if (!frame) {
            return;
        }
        var slides = qsa('.hero-slide', frame);
        var dots = qsa('.hero-dot', frame);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function activate(nextIndex) {
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
                activate(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                start();
            });
        });

        frame.addEventListener('mouseenter', stop);
        frame.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function initSearchList() {
        var input = qs('[data-search-input]');
        var select = qs('[data-filter-select]');
        var cards = qsa('.searchable-card');
        var empty = qs('[data-empty-state]');
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (input && query) {
            input.value = query;
        }

        function apply() {
            var term = normalize(input ? input.value : '');
            var category = select ? select.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardCategory = card.getAttribute('data-category') || '';
                var matchText = !term || haystack.indexOf(term) !== -1;
                var matchCategory = !category || cardCategory === category;
                var show = matchText && matchCategory;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
        apply();
    }

    function initMoviePlayer(sourceUrl) {
        var video = qs('#movie-video');
        var overlay = qs('#video-overlay');
        if (!video || !overlay || !sourceUrl) {
            return;
        }
        var prepared = false;
        var preparing = false;
        var hlsInstance = null;

        function prepare(callback) {
            if (prepared) {
                callback();
                return;
            }
            if (preparing) {
                window.setTimeout(function () {
                    prepare(callback);
                }, 180);
                return;
            }
            preparing = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                prepared = true;
                preparing = false;
                callback();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    prepared = true;
                    preparing = false;
                    callback();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        overlay.classList.remove('is-loading');
                        overlay.innerHTML = '<strong>视频加载异常，请稍后再试</strong>';
                    }
                });
                return;
            }
            video.src = sourceUrl;
            prepared = true;
            preparing = false;
            callback();
        }

        function play() {
            overlay.classList.add('is-loading');
            prepare(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(function () {
                        overlay.classList.add('is-hidden');
                        overlay.classList.remove('is-loading');
                    }).catch(function () {
                        overlay.classList.remove('is-loading');
                    });
                } else {
                    overlay.classList.add('is-hidden');
                    overlay.classList.remove('is-loading');
                }
            });
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initGlobalSearch();
        initHeroSlider();
        initSearchList();
    });
})();
