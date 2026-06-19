(function () {
  const video = document.querySelector("[data-player]");
  const overlay = document.querySelector("[data-play-overlay]");
  if (!video) {
    return;
  }

  const source = video.querySelector("source");
  const stream = source ? source.getAttribute("src") : "";
  let hls = null;
  let ready = false;

  function prepare() {
    if (ready || !stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", stream);
      }
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    if (!video.getAttribute("src")) {
      video.setAttribute("src", stream);
    }
    ready = true;
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.hidden = true;
    }
    const action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  }

  function toggle() {
    if (video.paused || video.ended) {
      play();
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("click", toggle);
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.hidden = true;
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.hidden = false;
    }
  });
})();
