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
// foodish api - images only - not the pretiest, but ok
// fetch(`https://foodish-api.herokuapp.com/api`)
//   .then((caca) => caca.json())
//   .then((response) => {
//     const img = document.querySelector(".hero-img");
//     img.src = response.image;
//   });
// const appId = "a5cea2be";
// const key = "95cea576a8a53c23997c5ec6c40084b7";
// fetch(
//   `https://api.edamam.com/api/recipes/v2?type=any&q=chicken&app_id=a5cea2be&app_key=95cea576a8a53c23997c5ec6c40084b7&imageSize=SMALL&random=true&
//   `
// )
//   .then((caca) => caca.json())
//   .then((response) => {
//     const img = document.querySelector(".hero-img");
//     img.src = response.hits[1].recipe.image;
//     console.log(response);
//   });

// const url = `https://api.edamam.com/api/recipes/v2?type=any&q=chicken&app_id=a5cea2be&app_key=95cea576a8a53c23997c5ec6c40084b7&imageSize=SMALL&random=true&
//   `;
//
//
//https://api.edamam.com/api/recipes/v2
// ("http://www.edamam.com/ontologies/edamam.owl#recipe_");

// to do
//function to create url for fetch request - this is to make after all teh search fields are created
//fn to make the request and rerturn the result
// const recipeSearch = async function (url) {
//   const rawResult = await fetch(url);
//   const jsonResult = await rawResult.json();
//   let recipesArr = jsonResult.hits.map((result) => result.recipe);
//   return Promise.resolve(recipesArr);
// };
//fn to take the result and render it on the page
// const renderResults = function (recipesArr) {
//   const recipeResultsContainer = document.querySelector(".recipe-results");
//   recipesArr.forEach((recipe) => {
//     const htmmlToInsert = `<div class="recipe-result">
//     <img src="${recipe.images.REGULAR.url}"/>
//     <p class="recipe-result-title">${recipe.label}</p>
//   </div>`;
//     recipeResultsContainer.insertAdjacentHTML("afterbegin", htmmlToInsert);
//   });
// };
//fn to expand the recipe
//fn to save the recipe to favorites - maybe
// console.log(recipeSearch(url));

// recipeSearch(url).then((data) => renderResults(data));
