import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { toTitleCase } from "./reusableFunctions.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const breadcrumbsFunctionality = function (e) {
  if (e.target.classList.contains("active")) return;
  const goToRecipesBtn = document.querySelector(".breadcrumb__second");
  const goToIngredientsBtn = document.querySelector(".breadcrumb__first");
  const ingredientsContainer = document.querySelector(".ingredients-wrapper");
  const recipesContainer = document.querySelector(
    ".recipe-suggestions-wrapper"
  );
  goToRecipesBtn.classList.toggle("active");
  goToIngredientsBtn.classList.toggle("active");
  ingredientsContainer.classList.toggle("hidden");
  recipesContainer.classList.toggle("hidden");
};

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
    document.querySelector(".recipe-suggestions-wrapper"),
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
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, "ingredients/");
const auth = getAuth();
let user;
const displayNotLoggedInScreen = function () {
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};
onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    displayPageContent();
  } else {
    displayNotLoggedInScreen();
    hidePageContent();
  }
});
const folder = "ingredients/";

const listRef = ref(storage, folder);

// Find all the prefixes and items.
listAll(listRef)
  .then((res) => {
    const parentContainer = document.querySelector(".ingredients-to-evaluate");
    res.items.forEach((itemRef) => {
      console.log();
      getDownloadURL(ref(storage, itemRef._location.path_)).then((url) => {
        renderIngredient(
          parentContainer,
          extractIngredientName(itemRef._location.path_),
          url
        );
      });
    });
  })
  .catch((error) => {
    // Uh-oh, an error occurred!
  });

const extractIngredientName = function (url) {
  return url.slice(12, url.indexOf("."));
};

const renderIngredient = function (parentElm, name, url) {
  const html = `
                <div class="evaluation-component">
                <div class="evaluation-btn evaluation-btn__dislike">
                <ion-icon class="evaluation-btn evaluation-btn__dislike" name="thumbs-down-outline"></ion-icon>
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
                <ion-icon class="evaluation-btn evaluation-btn__like" name="thumbs-up-outline"></ion-icon>
                </div>
                </div>
                `;
  parentElm.insertAdjacentHTML("afterbegin", html);
};

function evaluateIngredient(e) {
  if (!e.target.classList.contains("evaluation-btn")) return;
  const targetContainer = e.target.classList.contains("evaluation-btn__like")
    ? document.querySelector(
        ".evaluated-ingredients__liked .evaluated-ingredients__list"
      )
    : document.querySelector(
        ".evaluated-ingredients__disliked .evaluated-ingredients__list"
      );
  const ingredientElement = e.target
    .closest(".evaluation-component")
    .querySelector("figure");
  targetContainer.append(ingredientElement);
  const parentElement = e.target.closest(".evaluation-component");
  parentElement.remove();
}

const retreiveRecipesFromApi = async function (url) {
  const rawResult = await fetch(url);
  const jsonResult = await rawResult.json();
  // console.log(rawResult, jsonResult);
  let recipesArr = jsonResult.hits.map((result) => result.recipe);
  return recipesArr;
};

let recipesState = [];
let currentRecipeIndex = 0;
retreiveRecipesFromApi(
  "https://api.edamam.com/api/recipes/v2?type=public&q=pizza&app_id=a5cea2be&app_key=95cea576a8a53c23997c5ec6c40084b7"
).then((recipes) => {
  recipesState = recipes;
  renderRecipeCard(recipes[currentRecipeIndex]);
  currentRecipeIndex++;
  // recipes.forEach((recipe) => {
  //   renderRecipeCard(recipe);
  //   console.log(recipe);
  //   recipe.ingredients.forEach((ingr) => {
  //     // console.log(extractIngredient(ingr));
  //     console.log(toTitleCase(ingr.food));
  //   });
  // });
});

const swipeRight = function () {
  const recipeCard = document.querySelector(".recipe-card-component");
  const recipeName = recipeCard.children[1].children[0].innerText;
  const recipeImageSrc = recipeCard.children[0].currentSrc;
  renderLikedRecipe(recipeImageSrc, recipeName);
  recipeCard.remove();
  renderRecipeCard(recipesState[currentRecipeIndex]);
  currentRecipeIndex++;
};

const swipeLeft = function () {
  const recipeCard = document.querySelector(".recipe-card-component");
  recipeCard.remove();
  renderRecipeCard(recipesState[currentRecipeIndex]);
  currentRecipeIndex++;
};
const renderLikedRecipe = function (imageSrc, name) {
  const container = document.querySelector(".liked-recipes");
  const html = `<figure class="img-and-title-component">
      <img
        src=${imageSrc}
        alt="image of juicy burger"
        class="img-and-title-component__img"
      />
      <h2 class="img-and-title-component__title">
        ${name}
      </h2>
</figure>`;
  container.insertAdjacentHTML("afterbegin", html);
};
function dada(recipe) {
  let result = [];
  for (let i = 0; i < 6; i++) {
    if (!recipe.ingredients[i]) break;
    result.push(
      `<p class="recipe-card-component__ingredient">${toTitleCase(
        recipe.ingredients[i].food
      )}</p>`
    );
  }
  return result.join(" ");
}

const renderRecipeCard = function (recipe) {
  const html = `
  <figure class="recipe-card-component">
  <!-- <div class="recipe-card-component__img"></div> -->
  <img
  src="${recipe.image}"
  alt="image of juicy burger"
  class="recipe-card-component__img"
  />
  <div class="recipe-card-component__text-wrapper">
  <h2 class="recipe-card-component__title">
  ${toTitleCase(recipe.label)}
  </h2>
  <p class="recipe-card-component__subtitle">Ingredients</p>
  ${dada(recipe)}

  </div>
  <button class="recipe-card-component__button">
  See All Ingredients
  </button>
  </figure>
`;
  const container = document.querySelector(".swiper-component__card-container");
  container.insertAdjacentHTML("afterbegin", html);
};

const addEventListeners = function () {
  const breadcrumbBtns = document.querySelectorAll(".breadcrumb");
  breadcrumbBtns.forEach((btn) =>
    btn.addEventListener("click", breadcrumbsFunctionality)
  );
  const ingredientsEvaluationContainer = document.querySelector(
    ".ingredients-to-evaluate"
  );
  ingredientsEvaluationContainer.addEventListener("click", evaluateIngredient);
  const swipeRightBtn = document.querySelector(".action-btns__btn__like");
  const swipeLeftBtn = document.querySelector(".action-btns__btn__dislike");
  swipeRightBtn.addEventListener("click", swipeRight);
  swipeLeftBtn.addEventListener("click", swipeLeft);
};
addEventListeners();
