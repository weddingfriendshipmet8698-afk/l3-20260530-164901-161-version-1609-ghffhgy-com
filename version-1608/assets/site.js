(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var liveSearch = document.querySelector('[data-live-search]');

  if (liveSearch) {
    var input = liveSearch.querySelector('[data-live-input]');
    var clear = liveSearch.querySelector('[data-live-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function applySearch(value) {
      var term = value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-keywords') || '').toLowerCase();
        card.classList.toggle('is-hidden', term.length > 0 && haystack.indexOf(term) === -1);
      });
    }

    if (input) {
      input.value = initial;
      applySearch(initial);

      input.addEventListener('input', function () {
        applySearch(input.value);
      });
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
          input.focus();
        }

        applySearch('');
      });
    }

    document.querySelectorAll('[data-quick-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = button.textContent.trim();
        }

        applySearch(button.textContent.trim());
      });
    });
  }
})();
