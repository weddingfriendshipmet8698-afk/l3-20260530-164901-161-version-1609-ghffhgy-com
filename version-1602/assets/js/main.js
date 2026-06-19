(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var title = hero.querySelector('[data-hero-title]');
    var line = hero.querySelector('[data-hero-line]');
    var link = hero.querySelector('[data-hero-link]');
    var category = hero.querySelector('[data-hero-category]');
    var year = hero.querySelector('[data-hero-year]');
    var dataNode = document.getElementById('hero-data');
    var heroData = [];
    var current = 0;

    try {
      heroData = JSON.parse(dataNode ? dataNode.textContent : '[]');
    } catch (error) {
      heroData = [];
    }

    function showHero(index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });

      if (heroData[current]) {
        title.textContent = heroData[current].title;
        line.textContent = heroData[current].line;
        link.href = heroData[current].href;
        category.textContent = heroData[current].category;
        year.textContent = heroData[current].year;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero(current + 1);
      }, 5000);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var scope = document.querySelector('[data-filter-scope]');

  function applyFilter() {
    if (!scope) {
      return;
    }

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var categoryValue = categoryFilter ? categoryFilter.value : '';
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matchText = !query || haystack.indexOf(query) !== -1;
      var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
      card.classList.toggle('is-hidden', !(matchText && matchCategory));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilter);
  }

  function initVideoPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-video-start]');
    var errorBox = player.querySelector('[data-video-error]');
    var src = player.getAttribute('data-video-src');

    if (!video || !button || !src) {
      return;
    }

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message;
      }
    }

    function startPlayback() {
      player.classList.add('is-playing');
      showError('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function () {
          showError('视频已加载，请再次点击播放按钮。');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            showError('视频已加载，请再次点击播放按钮。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError('视频加载失败，请刷新页面或更换浏览器重试。');
          }
        });
        return;
      }

      showError('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge、Firefox 或 Safari。');
    }

    button.addEventListener('click', startPlayback);
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(initVideoPlayer);
})();
