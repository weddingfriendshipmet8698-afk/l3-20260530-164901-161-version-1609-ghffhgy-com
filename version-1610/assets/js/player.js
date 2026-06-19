document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playerStart");

    if (!video || !button) {
        return;
    }

    var stream = video.getAttribute("data-video");
    var hlsInstance = null;

    function start() {
        if (!stream) {
            return;
        }

        button.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = stream;
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
            return;
        }

        if (!video.src) {
            video.src = stream;
        }
        video.play().catch(function () {});
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
});
