// import Swiper from 'swiper';                // Імпорт Swiper.js
// import 'swiper/swiper-bundle.css';           // Імпорт стилів Swiper

document.addEventListener('DOMContentLoaded', () => {
  // Ініціалізація Swiper після того, як DOM завантажено
  const swiper = new Swiper('.swiper', {
    direction: 'horizontal',  // напрямок слайдів
    loop: true,               // нескінченний цикл
    autoplay: {
      delay: 2500,            // затримка між слайдами
    },
    pagination: {
      el: '.swiper-pagination',  // пагінація
      clickable: true,           // можливість кліку по пагінації
    },
    navigation: {
      nextEl: '.swiper-button-next',   // кнопка наступного слайду
      prevEl: '.swiper-button-prev',   // кнопка попереднього слайду
    },
  });

  // Це також правильно, якщо потрібно працювати з body
  const body = document.querySelector('body');
  // Можеш додати інші дії з body, якщо треба
});
