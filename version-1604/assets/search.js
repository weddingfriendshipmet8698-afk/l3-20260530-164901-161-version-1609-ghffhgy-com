(function () {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  const title = document.getElementById("searchTitle");
  const params = new URLSearchParams(window.location.search);
  const keyword = (params.get("q") || "").trim();
  const movies = Array.isArray(window.SEARCH_MOVIES)
    ? window.SEARCH_MOVIES
    : [];

  if (input) {
    input.value = keyword;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[char];
    });
  }

  function render(items) {
    if (!results) {
      return;
    }

    if (!items.length) {
      results.innerHTML =
        '<div class="empty-state">没有找到匹配影片，可以尝试更换关键词或浏览分类片单。</div>';
      return;
    }

    results.innerHTML = items
      .slice(0, 120)
      .map(function (movie) {
        return (
          '<article class="movie-card standard">' +
          '<a class="movie-cover" href="' +
          movie.href +
          '" aria-label="' +
          escapeHtml(movie.title) +
          '">' +
          '<img src="' +
          movie.cover +
          '" alt="' +
          escapeHtml(movie.title) +
          '" loading="lazy" onerror="this.style.display=\'none\'">' +
          '<span class="year-badge">' +
          escapeHtml(movie.year) +
          "</span>" +
          '<span class="play-chip">播放</span>' +
          "</a>" +
          '<div class="movie-info">' +
          '<h3><a href="' +
          movie.href +
          '">' +
          escapeHtml(movie.title) +
          "</a></h3>" +
          "<p>" +
          escapeHtml(movie.genre || movie.text) +
          "</p>" +
          '<div class="movie-meta"><span>' +
          escapeHtml(movie.type) +
          "</span><span>" +
          escapeHtml(movie.region) +
          "</span></div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  if (!keyword) {
    if (title) {
      title.textContent = "热门片库";
    }
    render(movies.slice(0, 48));
    return;
  }

  const terms = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = movies.filter(function (movie) {
    const haystack = String(movie.text || "").toLowerCase();
    return terms.every(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  });

  if (title) {
    title.textContent = "“" + keyword + "”的匹配影片";
  }
  render(matched);
})();
