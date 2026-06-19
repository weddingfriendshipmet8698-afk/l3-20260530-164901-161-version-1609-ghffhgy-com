(function () {
    var mobileButton = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            var opened = mobilePanel.hasAttribute('hidden');
            if (opened) {
                mobilePanel.removeAttribute('hidden');
            } else {
                mobilePanel.setAttribute('hidden', '');
            }
            mobileButton.setAttribute('aria-expanded', String(opened));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showHero(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showHero(index + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showHero(dotIndex);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showHero(index - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showHero(index + 1);
                startHero();
            });
        }

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-keyword]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var list = document.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedType = type ? type.value : '';
            var selectedYear = year ? year.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.tags,
                    card.dataset.type,
                    card.dataset.year
                ].join(' ').toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedType = !selectedType || card.dataset.type === selectedType;
                var matchedYear = !selectedYear || card.dataset.year === selectedYear;
                card.hidden = !(matchedKeyword && matchedType && matchedYear);
            });
        }

        [input, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var source = video ? video.querySelector('source') : null;
        var streamUrl = source ? source.src : '';

        function bindStream() {
            if (!video || video.dataset.ready === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else if (streamUrl) {
                video.src = streamUrl;
                video.load();
            }

            video.dataset.ready = '1';
        }

        function playVideo() {
            if (!video) {
                return;
            }
            bindStream();
            player.classList.add('is-playing');
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    player.classList.remove('is-playing');
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }
    });

    var searchApp = document.querySelector('[data-search-app]');
    if (searchApp && window.MOVIE_INDEX) {
        var keywordInput = searchApp.querySelector('[data-search-keyword]');
        var regionSelect = searchApp.querySelector('[data-search-region]');
        var typeSelect = searchApp.querySelector('[data-search-type]');
        var yearSelect = searchApp.querySelector('[data-search-year]');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function uniqueValues(field) {
            var seen = {};
            window.MOVIE_INDEX.forEach(function (item) {
                if (item[field]) {
                    seen[item[field]] = true;
                }
            });
            return Object.keys(seen).sort(function (a, b) {
                if (field === 'year') {
                    return Number(b) - Number(a);
                }
                return String(a).localeCompare(String(b), 'zh-Hans-CN');
            });
        }

        function movieCard(item) {
            var tags = item.tags.slice(0, 4).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="./' + escapeHtml(item.file) + '">',
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
                '<span class="score-pill">' + escapeHtml(item.score) + '</span>',
                '</a>',
                '<div class="card-body">',
                '<div class="meta-row">',
                '<span>' + escapeHtml(item.type) + '</span>',
                '<span>' + escapeHtml(item.year) + '</span>',
                '<a href="./' + escapeHtml(item.categoryFile) + '">' + escapeHtml(item.categoryName) + '</a>',
                '</div>',
                '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
                '<p>' + escapeHtml(item.oneLine) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function applySearch() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var matched = window.MOVIE_INDEX.filter(function (item) {
                var haystack = [
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.tags.join(' '),
                    item.oneLine
                ].join(' ').toLowerCase();
                return (!keyword || haystack.indexOf(keyword) !== -1)
                    && (!region || item.region === region)
                    && (!type || item.type === type)
                    && (!year || String(item.year) === year);
            }).slice(0, 120);

            if (count) {
                count.textContent = '片库结果：' + matched.length + ' 条';
            }

            if (results) {
                if (matched.length) {
                    results.innerHTML = matched.map(movieCard).join('');
                } else {
                    results.innerHTML = '<div class="search-empty">没有找到匹配内容，请调整关键词或筛选条件。</div>';
                }
            }
        }

        fillSelect(regionSelect, uniqueValues('region'));
        fillSelect(typeSelect, uniqueValues('type'));
        fillSelect(yearSelect, uniqueValues('year'));

        if (keywordInput) {
            keywordInput.value = initialKeyword;
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applySearch);
                element.addEventListener('change', applySearch);
            }
        });

        applySearch();
    }
})();
