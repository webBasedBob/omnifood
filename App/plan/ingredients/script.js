import Notification from "../../general/components/notification/script.js";
import Navigation from "../../general/components/navigation/script.js";
import AuthModal from "../../general/components/authModal/script.js";

import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
  uploadBytes,
} from "firebase/storage";
import {
  toTitleCase,
  extractRecipeId,
  debounce,
} from "../../general/js/reusableFunctions.js";
import { getAuth, linkWithRedirect, onAuthStateChanged } from "firebase/auth";
import {
  storeIngredient,
  getIngredients,
  storeRecipe,
  getRecipes,
} from "../../general/js/liveDatabaseFunctions.js";
import { NotLoggedInScreen } from "../../general/components/notLoggedInScreen/script.js";
import { globalEventsHandler } from "../../general/js/crossSiteFunctionality.js";
document.addEventListener("click", globalEventsHandler);
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
const hidePageContent = function () {
  const pageContent = [
    document.querySelector(".ingredients-wrapper"),
    document.querySelector(".breadcrumbs"),
  ];
  pageContent.forEach((section) => {
    section.classList.add("hidden");
  });
};

const displayPageContent = function () {
  const pageContent = [
    document.querySelector(".ingredients-wrapper"),
    document.querySelector(".breadcrumbs"),
  ];
  pageContent.forEach((section) => {
    section.classList.remove("hidden");
  });
  document.querySelector(".not-logged-in-screen")?.classList.add("hidden");
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, "ingredients/");
const auth = getAuth();

//
//global vars
//
let user;
let evaluatedIngredients;

//
const displayNotLoggedInScreen = function () {
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};

onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    displayPageContent();
    user = curUser;
    evaluatedIngredients = (await getIngredients(curUser.uid)) || {};
    renderAllIngredients();
  } else {
    displayNotLoggedInScreen();
    hidePageContent();
  }
});

const renderAllIngredients = async function () {
  //get all ingredients from cloud and render them in the page based on
  // user's relationship to them
  //liked ingredients in their column, disliked in their column and
  //not yet evaluated in the evaluation column
  const folder = "ingredients/";
  const listRef = ref(storage, folder);
  const ingredients = await listAll(listRef);
  const ingrToEvaluateContainer = document.querySelector(
    ".ingredients-to-evaluate"
  );

  ingredients.items.forEach(async (itemRef) => {
    const url = await getDownloadURL(ref(storage, itemRef._location.path_));
    const ingredientName = extractIngredientName(itemRef._location.path_);
    if (ingredientName in evaluatedIngredients) {
      renderEvaluatedIngredient(
        evaluatedIngredients[ingredientName],
        ingredientName,
        url
      );
    } else {
      renderIngredientToEvaluate(ingrToEvaluateContainer, ingredientName, url);
    }
  });
};

const extractIngredientName = function (url) {
  return url.slice(12, url.indexOf("."));
};

const renderIngredientToEvaluate = function (parentElm, name, url) {
  const dislikeBtnIcon = `<svg class="evaluation-btn evaluation-btn__dislike" name="thumbs-down-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
</svg>
`;
  const likeBtnIcon = `<svg class="evaluation-btn evaluation-btn__like" name="thumbs-up-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
</svg>
`;

  const html = `
    <div class="evaluation-component">
      <div class="evaluation-btn evaluation-btn__dislike">
        ${dislikeBtnIcon}
      </div>
      <figure class="ingredient">
        <img
        src=${url}
        alt="${name}-image"
        class="ingredient__img"
        />
        <p class="ingredient__text">${toTitleCase(name)}</p>
      </figure>
      <div class="evaluation-btn evaluation-btn__like">
        ${likeBtnIcon}
      </div>
    </div>`;
  parentElm.insertAdjacentHTML("afterbegin", html);
};

const renderEvaluatedIngredient = function (evaluation, name, url) {
  const likedIngrContainer = document.querySelector(
    ".evaluated-ingredients__liked .evaluated-ingredients__list"
  );
  const dislikedIngrContainer = document.querySelector(
    ".evaluated-ingredients__disliked .evaluated-ingredients__list"
  );
  const parentElm =
    evaluation === "liked" ? likedIngrContainer : dislikedIngrContainer;
  const html = `
        <figure class="ingredient">
          <img
            src=${url}
            alt="${name}-image"
            class="ingredient__img"
          />
          <p class="ingredient__text">${toTitleCase(name)}</p>
        </figure>
        `;

  parentElm.insertAdjacentHTML("afterbegin", html);
};

function evaluateIngredient(e) {
  //when an ingredient from evaluation component is evaluated (liked or disliked)
  //it is removed from the component, moved to the evaluated column (UI)
  //and it is stored in the cloud as evaluated ingredient for current user
  //the animation of this action is also handled here
  const clickedBtn = e.target.closest("div");
  const windowWidth = window.innerWidth;
  if (!clickedBtn.classList.contains("evaluation-btn")) return;
  const likeBtnPressed = clickedBtn.classList.contains("evaluation-btn__like");
  const evaluationComponent = clickedBtn.closest(".evaluation-component");
  const ingredientElement = evaluationComponent.querySelector("figure");

  let evaluation;
  let color;
  let notClickedBtn;
  let destinationContainer;
  const COLOR_RED = "#e35a5c";
  const COLOR_GREEN = "#00b258";

  //init vars based on the btn that was clicked (like/dislike)
  if (likeBtnPressed) {
    evaluation = "liked";
    color = COLOR_GREEN;
    notClickedBtn = e.target
      .closest(".evaluation-component")
      .querySelector(".evaluation-btn__dislike");
    destinationContainer = document.querySelector(
      ".evaluated-ingredients__liked .evaluated-ingredients__list"
    );
  } else {
    evaluation = "disliked";
    color = COLOR_RED;
    notClickedBtn = e.target
      .closest(".evaluation-component")
      .querySelector(".evaluation-btn__like");
    destinationContainer = document.querySelector(
      ".evaluated-ingredients__disliked .evaluated-ingredients__list"
    );
  }
  //need this function to add as a handler at animationend and then remove it
  const moveIngredientToDestination = function () {
    destinationContainer.append(ingredientElement);
    const ingredient = ingredientElement.children[1].innerText.toLowerCase();
    ingredientElement.classList.add("ingredient-pop");
    evaluationComponent.remove();
    storeIngredient(user.uid, ingredient, evaluation);
    ingredientElement.removeEventListener(
      "animationend",
      moveIngredientToDestination
    );
    setTimeout(() => {
      ingredientElement.classList.remove("ingredient-pop");
      ingredientElement.classList.remove(
        windowWidth <= 800 ? "eval-ingredient-top" : "eval-ingredient-side"
      );
    }, 1500);
  };

  //here starts the actual execution of actions
  clickedBtn.classList.add("btn-jump");
  notClickedBtn.classList.add("gray-btn");
  ingredientElement.classList.add(
    windowWidth <= 800 ? "eval-ingredient-top" : "eval-ingredient-side"
  );
  ingredientElement.style.backgroundColor = color;

  ingredientElement.addEventListener(
    "animationend",
    moveIngredientToDestination
  );
}
const getRandomInt = function (min, max) {
  //MIN and MAX are inclussive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const toggleEvaluatedIngrVisibility = function () {
  const evaluatedIngrContainer = document.querySelector(
    ".evaluated-ingredients-wrapper"
  );
  const ingrToEvalContainer = document.querySelector(
    ".ingredients-to-evaluate"
  );
  const displayEvaluatedIngrBtn = document.querySelector(
    ".display-evaluated-ingredients-btn"
  );
  const closeEvalIngrWindowBtn = document.querySelector(
    ".close-evaluated-ingredients-window"
  );

  evaluatedIngrContainer.classList.toggle("flex");
  ingrToEvalContainer.classList.toggle("hidden");
  displayEvaluatedIngrBtn.classList.toggle("hidden");
  closeEvalIngrWindowBtn.classList.toggle("inline");
};
const handleCloseBtnsVisibility = function () {
  const closeEvalIngrWindowBtn = document.querySelector(
    ".close-evaluated-ingredients-window"
  );
  const viewportWidth = window.innerWidth;

  closeEvalIngrWindowBtn.classList.add("hidden");

  if (viewportWidth > 800) return;
  closeEvalIngrWindowBtn.classList.remove("hidden");
  if (viewportWidth > 700) return;
};
handleCloseBtnsVisibility();

let zIndex = 1000;
const addEventListeners = function () {
  const ingredientsEvaluationContainer = document.querySelector(
    ".ingredients-to-evaluate"
  );
  ingredientsEvaluationContainer.addEventListener(
    "pointerdown",
    evaluateIngredient
  );
  const displayEvaluatedIngrBtn = document.querySelector(
    ".display-evaluated-ingredients-btn"
  );
  displayEvaluatedIngrBtn.addEventListener(
    "click",
    toggleEvaluatedIngrVisibility
  );
  const closeEvalIngrWindowBtn = document.querySelector(
    ".close-evaluated-ingredients-window"
  );
  closeEvalIngrWindowBtn.addEventListener(
    "click",
    toggleEvaluatedIngrVisibility
  );
  window.addEventListener("resize", debounce(handleCloseBtnsVisibility));
};
addEventListeners();
