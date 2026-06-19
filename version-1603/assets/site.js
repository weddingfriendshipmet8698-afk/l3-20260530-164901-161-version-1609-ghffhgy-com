(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-menu]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initSearchForms() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (query.length === 0) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    restart();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-year-filter]', scope);
      var region = qs('[data-region-filter]', scope);
      var type = qs('[data-type-filter]', scope);
      var cards = qsa('[data-card]', scope);
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var y = year ? year.value : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (y && card.getAttribute('data-year') !== y) {
            matched = false;
          }
          if (r && card.getAttribute('data-region') !== r) {
            matched = false;
          }
          if (t && card.getAttribute('data-type') !== t) {
            matched = false;
          }
          card.classList.toggle('hidden', !matched);
        });
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var source = player.getAttribute('data-src');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function loadSource() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return Promise.resolve();
        }
        video.src = source;
        return Promise.resolve();
      }

      function play() {
        loadSource().then(function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        });
      }

      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', toggle);
      }

      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
