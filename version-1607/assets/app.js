(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      show(0);
      play();
    }

    Array.prototype.slice.call(document.querySelectorAll(".local-filter")).forEach(function (input) {
      var selector = input.getAttribute("data-filter-target") || "movie-card";
      var root = input.closest("main") || document;

      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        var targets = Array.prototype.slice.call(root.querySelectorAll("." + selector + ", " + selector));

        targets.forEach(function (target) {
          var content = normalize(target.textContent);
          target.classList.toggle("hidden-by-filter", keyword && content.indexOf(keyword) === -1);
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player-src]")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".video-cover");
      var source = shell.getAttribute("data-player-src");

      if (!video || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      }

      function startVideo() {
        if (cover) {
          cover.classList.add("hidden");
        }

        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", startVideo);
      }

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      });
    });

    var searchResults = document.getElementById("searchResults");

    if (searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
      var keywordInput = document.getElementById("searchKeyword");
      var categoryInput = document.getElementById("searchCategory");
      var yearInput = document.getElementById("searchYear");
      var typeInput = document.getElementById("searchType");
      var status = document.getElementById("searchStatus");
      var params = new URLSearchParams(window.location.search);

      if (params.get("q")) {
        keywordInput.value = params.get("q");
      }

      function card(movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="play-pill">播放</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '    <p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
          '    <div class="card-meta">',
          '      <span>' + escapeHtml(movie.region) + '</span>',
          '      <span>' + escapeHtml(movie.type) + '</span>',
          '      <span>' + escapeHtml(movie.year) + '</span>',
          '      <span>' + escapeHtml(movie.rating) + '</span>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join("");
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function render() {
        var keyword = normalize(keywordInput.value);
        var category = normalize(categoryInput.value);
        var year = normalize(yearInput.value);
        var type = normalize(typeInput.value);

        var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.category,
            movie.genre,
            movie.tags,
            movie.desc
          ].join(" "));

          return (!keyword || haystack.indexOf(keyword) !== -1) &&
            (!category || normalize(movie.category) === category) &&
            (!year || normalize(movie.year).indexOf(year) !== -1) &&
            (!type || normalize(movie.type).indexOf(type) !== -1);
        });

        status.textContent = "找到 " + matched.length + " 部影片";
        searchResults.innerHTML = matched.slice(0, 120).map(card).join("");

        if (matched.length > 120) {
          status.textContent += "，当前显示前 120 部";
        }
      }

      [keywordInput, categoryInput, yearInput, typeInput].forEach(function (input) {
        input.addEventListener("input", render);
        input.addEventListener("change", render);
      });

      render();
    }
  });
})();
