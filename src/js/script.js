const swiper = new Swiper('.swiper', {
	slidesPerView: 3,
	slidesPerGroup: 3,
	loop: true,
	spaceBetween: 40,

	// Navigation arrows
	navigation: {
		nextEl: '.learningSliderNext',
		prevEl: '.learningSliderPrev',
	},

	pagination: {
		el: '.learningSliderPrevPag',
		clickable: true,
	},
});

document.addEventListener("DOMContentLoaded", function () {
		const header = document.querySelector(".header");

		window.addEventListener("scroll", function () {
			if (window.scrollY > 50) {
				header.classList.add("on_scroll");
			} else {
				header.classList.remove("on_scroll");
			}
		});
	});