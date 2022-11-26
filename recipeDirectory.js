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

// console.log(recipeSearch(url));

// recipeSearch(url).then((data) => renderResults(data));

// recipes of the month carousel
// consst recipesOfTheMonth = document.querySelectorAll(".carousel-item");
// recipesOfTheMonth.forEach(
//   (recipe, i) => (recipe.style.transform = `translateX(${i * 110}%)`)
// );
// let currentItem = 0;

// const putCarouselItemsInPosition = function (itemsClass) {
//   const carouselItems = document.querySelectorAll(`.${itemsClass}`);
//   // if (currentItem === carouselItems.length - 2) currentItem = 0;
//   // if (currentItem === 0) currentItem = carouselItems.length - 3;
//   carouselItems.forEach((item, index) => {
//     item.style.transform = `translateX(${(index - currentItem) * 110}%)`;
//   });
// };

let searchResults = [];
const correctUserInputText = function (str) {
  const lowerCaseTrimmedStr = str.trim().toLowerCase();
  const charArrWithAllSpaces = lowerCaseTrimmedStr
    .split("")
    .filter((char, index) => {
      if (
        lowerCaseTrimmedStr.charCodeAt(index) >= 97 &&
        lowerCaseTrimmedStr.charCodeAt(index) <= 122
      )
        return true;
      if (char === " ") return true;
      return false;
    });
  const trimmedCharArr = charArrWithAllSpaces.filter((char, index) => {
    if (char !== " ") return true;
    if (charArrWithAllSpaces[index - 1] == " ") return false;
    return true;
  });
  return trimmedCharArr.join("");
};

const createUrl = function () {
  let resultUrl = [`https://api.edamam.com/api/recipes/v2?type=any`];
  const appId = "a5cea2be";
  const appKey = "95cea576a8a53c23997c5ec6c40084b7";
  let userImputKeywords;
  const searchInputField = document.querySelector(".main-search-field");
  const dietFilter = document.querySelector(".diet-carousel-item.selected");
  const cuisineFilter = document.querySelector(
    ".cuisine-carousel-item.selected"
  );
  const mealTypeFilter = document.querySelector(".meal-type.selected");

  userImputKeywords = correctUserInputText(searchInputField.value);

  userImputKeywords &&
    resultUrl.push(
      `q=${userImputKeywords
        .split(" ")
        .reduce((acc, curVal) => acc + "%20" + curVal)}`
    );
  dietFilter && resultUrl.push(`health=${dietFilter.dataset.diet}`);
  cuisineFilter && result.push(`cuisine=${cuisineFilter.dataset.cuisinetype}`);
  mealTypeFilter &&
    resultUrl.push(`mealType=${mealTypeFilter.dataset.mealtype}`);
  resultUrl.push(`app_id=${appId}&app_key=${appKey}`);

  return resultUrl.join("&");
};

const extractRecipeId = function (recipe) {
  const id = recipe.uri.slice(recipe.uri.indexOf("recipe_") + 7);
  return id;
};

const retreiveRecipesFromApi = async function (url) {
  const rawResult = await fetch(url);
  const jsonResult = await rawResult.json();
  let recipesArr = jsonResult.hits.map((result) => result.recipe);
  return recipesArr;
};

const storeRecipesGlobally = function (recipesArr) {
  searchResults = recipesArr.map((recipe) => {
    return { ...recipe, id: extractRecipeId(recipe) };
  });
};

const renderResults = function (recipesArr) {
  const recipeResultsContainer = document.querySelector(".recipe-results");
  recipesArr.forEach((recipe) => {
    const htmmlToInsert = `<div data-recipeid = "${extractRecipeId(
      recipe
    )}" class="recipe-result">
    <img src="${recipe.images.REGULAR.url}"/>
    <p class="recipe-result-title">${recipe.label}</p>
  </div>`;
    recipeResultsContainer.insertAdjacentHTML("afterbegin", htmmlToInsert);
  });
};

const recipeSearch = async function () {
  const url = createUrl();
  const recipesArray = await retreiveRecipesFromApi(url);
  storeRecipesGlobally(recipesArray);
  console.log(recipesArray);
  renderResults(recipesArray);
};

document.querySelector(".btn-search").addEventListener("click", recipeSearch);

//fn to expand the recipe
//fn to save the recipe to favorites - maybe
