(function () {
  const menuButton = document.querySelector(".menu-toggle");
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      const opened = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
  }

  document.querySelectorAll(".site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector('input[name="q"]');
      const keyword = input ? input.value.trim() : "";
      if (!keyword) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }
})();
