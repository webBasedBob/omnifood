import {
  enableCarouselFunctionality,
  cleanStrFromSymbolsAndUselessSpaces,
  toTitleCase,
  throwError,
  displayNotification,
  extractRecipeId,
} from "../general/js/reusableFunctions.js";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePhoneNumber,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyIdToken,
} from "firebase/auth";

import Notification from "../general/components/notification/script";
import Navigation from "../general/components/navigation/script.js";
import AuthModal from "../general/components/authModal/script";
import ErrorPopup from "../general/components/errorModal/script";
import FullscreenRecipe from "../general/components/FullscreenRecipe/script";

import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
  uploadBytes,
} from "firebase/storage";

import {
  storeIngredient,
  getIngredients,
  storeRecipe,
  getRecipes,
} from "../general/js/liveDatabaseFunctions.js";

//hiding the carousel for now
const firebaseConfig = {
  apiKey: "AIzaSyCuCBob9JTkZveeOtZa2oRfLtZKf5aODek",
  authDomain: "omnifood-custom-version.firebaseapp.com",
  databaseURL:
    "https://omnifood-custom-version-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "omnifood-custom-version",
  storageBucket: "omnifood-custom-version.appspot.com",
  messagingSenderId: "1094073505469",
  appId: "1:1094073505469:web:92153bcbde9d51536f49d4",
  measurementId: "G-1DT1EYNVPW",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let user;

onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    user = auth.currentUser;
  } else {
  }
});

document.querySelector("#trending-foods").classList.add("hidden");

const mobileNavFunctionality = function () {
  const btnNavEl = document.querySelector(".btn-mobile-nav");
  const headerEl = document.querySelector(".header");

  btnNavEl.addEventListener("click", function () {
    headerEl.classList.toggle("nav-open");
  });
};
mobileNavFunctionality();

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
  resultUrl.push("random=true");

  return resultUrl.join("&");
};

const retreiveRecipesFromApi = async function (url) {
  const rawResult = await fetch(url);
  const jsonResult = await rawResult.json();
  console.log(rawResult, jsonResult);
  let recipesArr = jsonResult.hits.map((result) => result.recipe);
  return recipesArr;
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
    recipeResultsContainer.insertAdjacentHTML("beforeend", htmmlToInsert);
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

const storeRecipesGlobally = function (recipesArr) {
  FullscreenRecipe.recipeSearchResults = recipesArr.map((recipe) => {
    return { ...recipe, id: extractRecipeId(recipe) };
  });
};

//
//
//the fowwlowing code is copyed from choosemeals.js
//
//
//

const saveBlobToFirebase = async function (blob, blobName) {
  //takes a blob and stores it to firebase cloud storage
  //firebase cloud storage accepts only blobs or files
  try {
    const storage = getStorage();
    const blobRef = ref(storage, `recipeImages/${blobName}.jpeg`);
    await uploadBytes(blobRef, blob);
  } catch (error) {
    console.log(error);
  }
};

const getImgUrl = async function (imgName) {
  //gets the URL of the image storead as a blob on firebase cloud storage
  //img name is the corresponding recipe's ID
  try {
    const storage = getStorage();
    const imgRef = ref(storage, `recipeImages/${imgName}.jpeg`);
    const url = await getDownloadURL(imgRef);
    return url;
  } catch (error) {
    console.log(error);
  }
};

const fetchWithCORS = async function (url) {
  //image response  from edamam API lack CORS headers, so
  //i use this CORS proxy API to make requests and return responses to me with the CORS headers
  const corsApiUrl = "https://cors-anywhere.herokuapp.com/";
  return await fetch(corsApiUrl + url);
};

const createBlobImg = async function (imgSrc) {
  //takes a img src URL, fetches it through CORS proxy API and
  //turns the returned img into a blob
  const img = await fetchWithCORS(imgSrc);
  const blob = await img.blob();
  return blob;
};

const storeImgAndReturnUrl = async function (imgSrc, imgName) {
  //gets an img from a URL, turns it into a blob, stores the blob to firebase storage,
  //gets it's URl back and returns it
  const blob = await createBlobImg(imgSrc);
  await saveBlobToFirebase(blob, imgName);
  const url = await getImgUrl(imgName);
  return url;
};

const handleSaveRecipe = async function (e) {
  if (!user) {
    throwError("log-in-required");
    return;
  }
  const recipeCard = document.querySelector(".full-screen-recipe");
  const recipeName = recipeCard.querySelector(".title").innerText;
  const recipeImageSrc = recipeCard.querySelector("img").src;
  console.log("imgsrc", recipeImageSrc);
  const recipeID = recipeCard.dataset.recipeid;
  console.log("recipeid", recipeID);
  // renderLikedRecipe(recipeImageSrc, recipeName, recipeID);
  // recipeCard.remove();
  // renderNextRecipeCard();
  const firebaseRecipeImgSrc = await storeImgAndReturnUrl(
    recipeImageSrc,
    recipeID
  );
  storeRecipe(user.uid, recipeID, firebaseRecipeImgSrc, recipeName, "liked");
};

const addEventListeners = function () {
  const filtersContainer = document.querySelector(".carousels-container");
  const searchBtn = document.querySelector(".btn-search");
  const clearSearchBarBtn = document.querySelector(".clean-search-field");

  filtersContainer.addEventListener("click", selectFilter);
  searchBtn.addEventListener("click", recipeSearch);
  clearSearchBarBtn.addEventListener("click", clearSearchInputField);
  document.addEventListener("keydown", SearchByPressingEnter);

  //events for full screen recipe
  const resultsContainer = document.querySelector(".recipe-results");
  resultsContainer.addEventListener(
    "click",
    FullscreenRecipe.open.bind(FullscreenRecipe)
  );
  const fullscreenCloseBtn = document.querySelector(
    ".full-screen-recipe .close-btn"
  );
  fullscreenCloseBtn.addEventListener(
    "click",
    FullscreenRecipe.hide.bind(FullscreenRecipe)
  );
  const saveBtn = document.querySelector(".save-btn");
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");
  saveBtn.addEventListener("click", handleSaveRecipe);
  nextBtn.addEventListener(
    "click",
    FullscreenRecipe.nextRecipe.bind(FullscreenRecipe)
  );
  prevBtn.addEventListener(
    "click",
    FullscreenRecipe.prevRecipe.bind(FullscreenRecipe)
  );
  //error and notif event listeners
  document.addEventListener("error", ErrorPopup.display.bind(ErrorPopup));
  document.addEventListener(
    "notification",
    Notification.display.bind(Notification)
  );
};
addEventListeners();
