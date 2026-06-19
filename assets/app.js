
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var input = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function filterCards() {
    if (!input || cards.length === 0) {
      return;
    }
    var keyword = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      if (!keyword || text.indexOf(keyword) !== -1) {
        card.classList.remove('hidden-by-search');
      } else {
        card.classList.add('hidden-by-search');
      }
    });
  }

  if (input) {
    input.addEventListener('input', filterCards);
  }

  if (clearButton && input) {
    clearButton.addEventListener('click', function () {
      input.value = '';
      filterCards();
      input.focus();
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    showSlide(0);
  }
}());
