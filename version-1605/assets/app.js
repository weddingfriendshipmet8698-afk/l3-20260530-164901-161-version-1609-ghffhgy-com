(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
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

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCardFilters() {
    selectAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('[data-card-filter]');
      var type = area.querySelector('[data-type-filter]');
      var year = area.querySelector('[data-year-filter]');
      var grid = document.querySelector('[data-card-grid]');
      var cards = grid ? selectAll('.movie-card', grid) : [];

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          card.hidden = !(matchQuery && matchType && matchYear);
        });
      }

      [input, type, year].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-category="' + escapeHtml(movie.category) + '">' +
      '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="card-badge">' + escapeHtml(movie.year) + '</span>' +
        '<span class="play-mark">▶</span>' +
      '</a>' +
      '<div class="movie-body">' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="card-tags">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.SITE_SEARCH_DATA) {
      return;
    }
    var input = page.querySelector('[data-search-input]');
    var type = page.querySelector('[data-search-type]');
    var category = page.querySelector('[data-search-category]');
    var grid = page.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var categoryValue = category ? category.value : '';
      var data = window.SITE_SEARCH_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !typeValue || movie.type === typeValue;
        var matchCategory = !categoryValue || movie.category === categoryValue;
        return matchQuery && matchType && matchCategory;
      }).slice(0, 120);
      grid.innerHTML = data.map(renderSearchCard).join('');
    }

    [input, type, category].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
    apply();
  }

  function attachHls(video, source) {
    if (!source) {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        video._hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        video._hlsInstance.loadSource(source);
        video._hlsInstance.attachMedia(video);
      }
      return Promise.resolve();
    }
    video.src = source;
    return Promise.resolve();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var source = shell.getAttribute('data-hls') || '';
      var started = false;

      function startPlayer() {
        if (!video) {
          return;
        }
        attachHls(video, source).then(function () {
          shell.classList.add('is-ready');
          started = true;
          var playResult = video.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
              video.controls = true;
            });
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', startPlayer);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!started) {
            startPlayer();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
}());
