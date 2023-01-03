import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { toTitleCase } from "./reusableFunctions.js";
import { getAuth, linkWithRedirect, onAuthStateChanged } from "firebase/auth";
import {
  storeIngredient,
  getIngredients,
  storeRecipe,
  getRecipes,
} from "./liveDatabaseFunctions.js";
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

//
//global vars
//
let user;
let evaluatedIngredients;
let currentRecipeIndex = 0;
let recipesToEvaluate = [];
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
    console.log(evaluatedIngredients);
    renderAllIngredients();
    renderFirebaseRecipes();
    await checkAgainstEvaluatedRecipes(curUser.uid, []);
    await getRecipesBasedOnUsersIngredients(curUser.uid);
    renderNextRecipeCard();
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
  if (!e.target.classList.contains("evaluation-btn")) return;
  const likeBtnPressed = e.target.classList.contains("evaluation-btn__like");
  const likedIngrContainer = document.querySelector(
    ".evaluated-ingredients__liked .evaluated-ingredients__list"
  );
  const dislikedIngrContainer = document.querySelector(
    ".evaluated-ingredients__disliked .evaluated-ingredients__list"
  );
  const targetContainer = likeBtnPressed
    ? likedIngrContainer
    : dislikedIngrContainer;
  const ingredientElement = e.target
    .closest(".evaluation-component")
    .querySelector("figure");
  targetContainer.append(ingredientElement);
  const parentElement = e.target.closest(".evaluation-component");
  parentElement.remove();
  const evaluation = likeBtnPressed ? "liked" : "disliked";
  const ingredient = ingredientElement.children[1].innerText.toLowerCase();
  storeIngredient(user.uid, ingredient, evaluation);
}

//
//
//
//
// recipes section
//
//
//
//
const retreiveRecipesFromApi = async function (url) {
  //gets recipes from Edamam
  //return an array
  const rawResult = await fetch(url);
  const jsonResult = await rawResult.json();
  // console.log(rawResult, jsonResult);
  let recipesArr = jsonResult.hits.map((result) => result.recipe);
  return recipesArr;
};
const extractRecipeId = function (recipe) {
  const id = recipe.uri.slice(recipe.uri.indexOf("recipe_") + 7);
  return id;
};

const getRandomInt = function (min, max) {
  //MIN and MAX are inclussive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const modifyLikedIngrArr = function (likedIngrArr) {
  //take an array made of all ingredients that the user likes
  //some ingredients are labeled as main/principal, for example chicken,
  //beef, mushrooms,and because those are usually the core of a lot of
  //recipes, only one is included in the search query
  //the other 3 ingredients are 'secondary' ingredients
  //if we use more than 1 main ingredient, the API result is often empty
  //if we use more than 4-5 total ingredients, the API result is sometimes
  // empty and usually almost empty
  //given that Edamam API allows only 10 requests per minute,
  //we went for 4 total ingredients (1 main and 3 secondary)

  const mainIngredientsCollection = [
    "mushrooms",
    "crab",
    "salmon",
    "beans",
    "potatoes",
    "shrimps",
    "beef",
    "bacon",
    "chicken",
    "pork",
    "rice",
    "peas",
    "spinach",
    "shellfish",
    "tomatoes",
  ].map((ingr) => {
    if (ingr.at(-1) === "s" && ingr.at(-2) === "e") {
      return ingr.slice(0, -2);
    } else if (ingr.at(-1) === "s") {
      return ingr.slice(0, -1);
    } else {
      return ingr;
    }
  });
  const likedIngredientsMain = likedIngrArr.filter((ingr) => {
    return mainIngredientsCollection.includes(ingr);
  });
  const likedIngredientsSecondary = likedIngrArr.filter((ingr) => {
    return !mainIngredientsCollection.includes(ingr);
  });
  console.log("likedIngredientsmain", likedIngredientsMain);
  console.log("likedIngredientsSecondary", likedIngredientsSecondary);

  //because from all liked ingredients only one main ingr wil be used
  //the resulting array length will be calculated based on secondary ingr + the main one
  const resultArrLength =
    likedIngredientsSecondary.length + 1 >= 4
      ? 4
      : likedIngredientsSecondary.length + 1;
  const indexes = new Set();
  const likedIngrArrContainsMainIngredient = mainIngredientsCollection.some(
    (ingr) => {
      return likedIngrArr.includes(ingr);
    }
  );

  while (indexes.size < 1 && likedIngrArrContainsMainIngredient) {
    const index = getRandomInt(0, likedIngrArr.length - 1);
    if (mainIngredientsCollection.includes(likedIngrArr[index])) {
      indexes.add(index);
    }
  }
  while (indexes.size < resultArrLength) {
    const index = getRandomInt(0, likedIngrArr.length - 1);
    if (!mainIngredientsCollection.includes(likedIngrArr[index])) {
      indexes.add(index);
    }
  }
  let result = [];
  indexes.forEach((val) => {
    result.push(likedIngrArr[val]);
  });
  return result;
};
const getRecipesBasedOnUsersIngredients = async function (userId) {
  //gets ingredients the user evaluated from clud
  //splits them into 2 arrays, liked and disliked
  //modify all plural ingredients to a singular form
  //call the API search until we collected at least 25 not yet evaluated recipes*
  //render start renderind them in the evaluation component*
  // actions marked with (*) are completed executing other functions

  try {
    //if user doesn't have any evaluated ingredients, some dummy are asigned
    const dummyData = {
      beef: "liked",
      chicken: "liked",
      tomatoes: "liked",
      mushrooms: "liked",
      mayo: "liked",
      potatoes: "disliked",
    };
    console.log("ce pula mea");
    const ingredientsObj = await getIngredients(userId);
    console.log(ingredientsObj);
    const ingredientsArr = ingredientsObj
      ? Object.entries(ingredientsObj)
      : Object.entries(dummyData);
    console.log(ingredientsArr);
    const likedIngredients = ingredientsArr
      .filter((ingr) => {
        return ingr[1] === "liked";
      })
      .map((ingr) => {
        return ingr[0];
      })
      .map((ingr) => {
        if (ingr.at(-1) === "s" && ingr.at(-2) === "e") {
          return ingr.slice(0, -2);
        } else if (ingr.at(-1) === "s") {
          return ingr.slice(0, -1);
        } else {
          return ingr;
        }
      });

    const dislikedIngredients = ingredientsArr
      .filter((ingr) => {
        return ingr[1] === "disliked";
      })
      .map((ingr) => {
        return ingr[0];
      })
      .map((ingr) => {
        if (ingr.at(-1) === "s" && ingr.at(-2) === "e") {
          return ingr.slice(0, -2);
        } else if (ingr.at(-1) === "s") {
          return ingr.slice(0, -1);
        } else {
          return ingr;
        }
      });
    console.log(likedIngredients);
    console.log(dislikedIngredients);

    while (recipesToEvaluate.length < 25) {
      const url = createIngredientsBasedUrl(
        modifyLikedIngrArr(likedIngredients),
        dislikedIngredients
      );
      const recipes = await retreiveRecipesFromApi(url);
      await checkAgainstEvaluatedRecipes(user.uid, recipes);
    }
  } catch (error) {
    console.error(error);
  }
};

const checkAgainstEvaluatedRecipes = async function (userId, apiRecipesResult) {
  //takes recipes outputed from the Edamama API call as second input
  //takes recipes the user already evaluated from the cloud using its UID
  //loops through all Edamam recipes and the one already evaluated are ignored
  // and those not yet evaluated are stored in an global var to be displayed later

  const evaluatedRecipes = await getRecipes(userId);
  if (!evaluatedRecipes || Object.keys(evaluatedRecipes).length === 0) {
    apiRecipesResult.forEach((recipe) => {
      recipesToEvaluate.push(recipe);
    });
  } else {
    apiRecipesResult.forEach((recipe) => {
      const recipeId = extractRecipeId(recipe);
      const recipeAlreadyEvaluated = recipeId in evaluatedRecipes;
      if (!recipeAlreadyEvaluated) {
        recipesToEvaluate.push(recipe);
      }
    });
  }
  console.log(recipesToEvaluate);
};

const createIngredientsBasedUrl = function (likedIngr, dislikedIngr) {
  //creates the complete Edamam API url to feed the Fetch method when needed

  let resultUrl = [`https://api.edamam.com/api/recipes/v2?type=any`];
  const appId = "a5cea2be";
  const appKey = "95cea576a8a53c23997c5ec6c40084b7";
  likedIngr.length &&
    resultUrl.push(
      `q=${likedIngr.reduce((acc, curVal) => acc + "%20" + curVal)}`
    );
  dislikedIngr.length &&
    resultUrl.push(
      `excluded=${dislikedIngr.reduce((acc, curVal) => acc + "%20" + curVal)}`
    );
  resultUrl.push(`app_id=${appId}&app_key=${appKey}`);
  resultUrl.push("random=true");
  return resultUrl.join("&");
};

const renderNextRecipeCard = function () {
  renderRecipeCard(recipesToEvaluate[0]);
  recipesToEvaluate.shift();
  if (recipesToEvaluate.length < 10) {
    getRecipesBasedOnUsersIngredients(user.uid);
  }
};
// these 2 functions must be refactored (DRY principle)
const swipeRight = function () {
  const recipeCard = document.querySelector(".recipe-card-component");
  const recipeName = recipeCard.children[1].children[0].innerText;
  const recipeImageSrc = recipeCard.children[0].currentSrc;
  const recipeID = recipeCard.dataset.recipeid;
  console.log(recipeID);
  storeRecipe(user.uid, recipeID, recipeImageSrc, recipeName, "liked");
  renderLikedRecipe(recipeImageSrc, recipeName, recipeID);
  recipeCard.remove();
  renderNextRecipeCard();
};

const swipeLeft = function () {
  const recipeCard = document.querySelector(".recipe-card-component");
  const recipeName = recipeCard.children[1].children[0].innerText;
  const recipeImageSrc = recipeCard.children[0].currentSrc;
  const recipeID = recipeCard.dataset.recipeid;
  console.log(recipeID);
  storeRecipe(user.uid, recipeID, recipeImageSrc, recipeName, "disliked");
  recipeCard.remove();
  renderNextRecipeCard();
};

const renderFirebaseRecipes = async function () {
  //retrieves from cloud all recipes that were already evaluated by the current user
  //keeps only the liked ones and renderes them in the "liked recipes" container
  try {
    const recipes = await getRecipes(user.uid);
    if (!recipes || Object.keys(recipes).length === 0) return;
    const likedRecipes = Object.entries(recipes).filter((recipe) => {
      return recipe[1].evaluation === "liked";
    });
    likedRecipes.forEach((recipe) => {
      renderLikedRecipe(recipe[1].image, recipe[1].recipeName, recipe[0]);
    });
  } catch (error) {
    console.error(error);
  }
};
const renderLikedRecipe = function (imageSrc, name, recipeId) {
  //when a user press the like button on a recipe,
  //it is rendereb by this function in the liked recipes container
  const container = document.querySelector(".liked-recipes");
  const html = `<figure data-recipeid = ${recipeId} class="img-and-title-component">
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
  //renderes the recipe to be evaluated, which is a UI card component
  if (!recipe) return;
  const html = `
  <figure data-recipeid = ${extractRecipeId(
    recipe
  )} class="recipe-card-component">
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
