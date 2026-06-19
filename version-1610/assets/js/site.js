document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");

    if (toggle && links) {
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(next) {
        if (!slides.length) {
            return;
        }

        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
            slide.classList.toggle("is-active", index === current);
        });
        dots.forEach(function (dot, index) {
            dot.classList.toggle("is-active", index === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var search = document.getElementById("siteSearch");
    var region = document.getElementById("regionFilter");
    var items = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card, .filter-grid .rank-row"));

    function filterItems() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var selected = region ? region.value : "";

        items.forEach(function (item) {
            var text = [
                item.getAttribute("data-title") || "",
                item.getAttribute("data-region") || "",
                item.getAttribute("data-genre") || "",
                item.getAttribute("data-year") || ""
            ].join(" ").toLowerCase();
            var regionValue = item.getAttribute("data-region") || "";
            var matchedText = !query || text.indexOf(query) !== -1;
            var matchedRegion = !selected || regionValue === selected;
            item.classList.toggle("is-filter-hidden", !(matchedText && matchedRegion));
        });
    }

    if (search) {
        search.addEventListener("input", filterItems);
    }

    if (region) {
        region.addEventListener("change", filterItems);
    }
});
