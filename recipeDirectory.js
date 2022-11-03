// making the nav sticky
const stickyNav = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) body.classList.add("sticky");
  if (entry.isIntersecting) body.classList.remove("sticky");
};

const body = document.querySelector("body");
const heroSection = document.querySelector(".section-hero");

const navObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0.12,
});

navObserver.observe(heroSection);
// smooth scroling - used event delegation 😉
const heroSectionTextBox = document.querySelector(".hero-text-box");
heroSectionTextBox.addEventListener("click", function (e) {
  e.preventDefault();
  console.log(e.target);
  if (e.target.tagName == "A") {
    const scrollTo = document.querySelector(e.target.getAttribute("href"));
    scrollTo.scrollIntoView({ behavior: "smooth" });
  }
});

// carousel
// const carousel = document.querySelector(".carousel");
// const carouselItems = document.querySelectorAll(".carousel-item");
// const carouselRightArr = document.querySelector(".carousel-arrow.arrow-right");
// const carouselLeftArr = document.querySelector(".carousel-arrow.arrow-left");
// let currentItem = 0;
// const totalItems = carouselItems.length;
// const resetCarousel = function () {
//   carousel.style.display = "block";
//   carousel.style.height = "600px";
//   carousel.style.overflow = "hidden";
//   carousel.style.position = "relative";
//   carouselItems.forEach((el, i) => {
//     el.style.position = "absolute";
//     el.style.transform = `translateX(${i * 100}%)`;
//     el.style.padding = "0 20px";
//     el.style.transition = "all 0.3s";
//   });
// };
// resetCarousel();
// carouselRightArr.addEventListener("click", function () {
//   if (currentItem === totalItems - 3) currentItem = 0;
//   else currentItem++;
//   carouselItems.forEach((el, i) => {
//     el.style.transform = `translateX(${(i - currentItem) * 100}%)`;
//   });
// });

// const [firstItem] = carouselItems;
// firstItem.style.transform = "translate(114.6%, 0px)";
