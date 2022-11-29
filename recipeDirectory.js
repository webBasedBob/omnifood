import {
  enableCarouselFunctionality,
  cleanStrFromSymbolsAndUselessSpaces,
} from "./js/reusableFunctions.js";
// // making the nav sticky
// const stickyNav = function (entries) {
//   const [entry] = entries;
//   if (!entry.isIntersecting) body.classList.add("sticky");
//   if (entry.isIntersecting) body.classList.remove("sticky");
// };

// const body = document.querySelector("body");
// const heroSection = document.querySelector(".section-hero");

// const navObserver = new IntersectionObserver(stickyNav, {
//   root: null,
//   threshold: 0.12,
// });

// navObserver.observe(heroSection);
// // smooth scroling - used event delegation 😉
// const heroSectionTextBox = document.querySelector(".hero-text-box");
// heroSectionTextBox.addEventListener("click", function (e) {
//   e.preventDefault();
//   console.log(e.target);
//   if (e.target.tagName == "A") {
//     const scrollTo = document.querySelector(e.target.getAttribute("href"));
//     scrollTo.scrollIntoView({ behavior: "smooth" });
//   }
// });

enableCarouselFunctionality(
  "filter-carousel",
  "cuisine-carousel-item",
  "cuisine-carousel-left-arr",
  "cuisine-carousel-right-arr"
);
enableCarouselFunctionality(
  "filter-carousel",
  "diet-carousel-item",
  "diet-carousel-left-arr",
  "diet-carousel-right-arr"
);
enableCarouselFunctionality(
  "carousel",
  `carousel-item`,
  "arrow-left",
  "arrow-right"
);

let searchResults = [];

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

  userImputKeywords = cleanStrFromSymbolsAndUselessSpaces(
    searchInputField.value
  );

  userImputKeywords &&
    resultUrl.push(
      `q=${userImputKeywords
        .split(" ")
        .reduce((acc, curVal) => acc + "%20" + curVal)}`
    );
  dietFilter && resultUrl.push(`health=${dietFilter.dataset.diet}`);
  cuisineFilter &&
    resultUrl.push(`cuisineType=${cuisineFilter.dataset.cuisinetype}`);
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
const createRelevanceScores = function (recipesArr) {
  recipesArr.forEach((recipe) => {
    recipe.relevanceScore = 0;
  });
  const searchInputField = document.querySelector(".main-search-field");
  const searchKeywords = cleanStrFromSymbolsAndUselessSpaces(
    searchInputField.value
  ).split(" ");
  const noKeywords = searchKeywords[0] === "";
  const databaseIsEmpty = recipesArr.length === 0;
  if (noKeywords || databaseIsEmpty) return;
  searchKeywords.forEach((keyword) => {
    const keywordVariations = [
      keyword,
      keyword[0].toUpperCase() + keyword.slice(1),
      keyword.toUpperCase(),
    ];
    const regex = new RegExp(keywordVariations.join("|"));
    recipesArr.forEach((recipe) => {
      if (recipe.label.match(regex)) recipe.relevanceScore += 10;
    });
  });
};

const sortByRelevance = function (a, b) {
  const aRelevance = a.dataset.relevancescore;
  const bRelevance = b.dataset.relevancescore;
  return bRelevance - aRelevance;
};

const sortResults = function () {
  const resultsContainer = document.querySelector(".recipe-results");
  const resultsArray = Array.from(document.querySelectorAll(".recipe-result"));
  resultsArray.sort(sortByRelevance);
  resultsArray.forEach((result) => resultsContainer.append(result));
};

const renderResults = function (recipesArr) {
  const recipeResultsContainer = document.querySelector(".recipe-results");
  recipesArr.forEach((recipe) => {
    const htmmlToInsert = `<div data-relevancescore = ${
      recipe.relevanceScore
    } data-recipeid = "${extractRecipeId(recipe)}" class="recipe-result">
    <img src="${recipe.images.REGULAR.url}"/>
    <p class="recipe-result-title">${recipe.label}</p>
  </div>`;
    recipeResultsContainer.insertAdjacentHTML("afterbegin", htmmlToInsert);
  });
};
const emptyOutResultsContainer = function () {
  const recipeResultsContainer = document.querySelector(".recipe-results");
  recipeResultsContainer.innerHTML = "";
};
const showLoader = function () {
  const loader = document.querySelector(".loader");
  loader.classList.remove("hidden");
};
const hideLoader = function () {
  const loader2 = document.querySelector(".loader");
  loader2.classList.add("hidden");
};
const recipeSearch = async function () {
  emptyOutResultsContainer();
  showLoader();
  const url = createUrl();
  const recipesArray = await retreiveRecipesFromApi(url);
  storeRecipesGlobally(recipesArray);
  createRelevanceScores(recipesArray);

  console.log(recipesArray);
  renderResults(recipesArray);
  sortResults();
  hideLoader();
};

//fn to expand the recipe
//fn to save the recipe to favorites - maybe

const selectFilter = function (e) {
  if (e.target.classList.contains("selected")) {
    e.target.classList.remove("selected");
    return;
  }
  if (e.target.classList.contains("filter")) {
    const siblingFilters = [...e.target.parentElement.children];
    siblingFilters.forEach((filter) => filter.classList.remove("selected"));
    e.target.classList.add("selected");
  }
};
const clearSearchInputField = function () {
  const searchInputField = document.querySelector(".main-search-field");
  searchInputField.value = "";
};
const SearchByPressingEnter = function (e) {
  if (e.key === "Enter") recipeSearch();
};
const addEventListeners = function () {
  const filtersContainer = document.querySelector(".carousels-container");
  const searchBtn = document.querySelector(".btn-search");
  const clearSearchBarBtn = document.querySelector(".clean-search-field");

  filtersContainer.addEventListener("click", selectFilter);
  searchBtn.addEventListener("click", recipeSearch);
  clearSearchBarBtn.addEventListener("click", clearSearchInputField);
  document.addEventListener("keydown", SearchByPressingEnter);
};
addEventListeners();
