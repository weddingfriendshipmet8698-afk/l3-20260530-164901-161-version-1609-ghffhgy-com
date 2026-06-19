function initMoviePlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var ready = false;
  var hlsPlayer = null;

  if (!video || !button || !streamUrl) {
    return;
  }

  function runVideo() {
    button.classList.add('is-hidden');
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  function connectAndPlay() {
    if (ready) {
      runVideo();
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      runVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls();
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
        runVideo();
      });
      hlsPlayer.on(window.Hls.Events.ERROR, function () {
        if (!video.src) {
          video.src = streamUrl;
        }
      });
      return;
    }

    video.src = streamUrl;
    runVideo();
  }

  button.addEventListener('click', connectAndPlay);

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      connectAndPlay();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
}
