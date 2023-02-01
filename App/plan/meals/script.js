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
import FullscreenRecipe from "../../general/components/fullScreenRecipe/script.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import Notification from "../../general/components/notification/script.js";
import Navigation from "../../general/components/navigation/script.js";
import AuthModal from "../../general/components/authModal/script.js";

const breadcrumbsFunctionality = function (e) {
  if (e.target.classList.contains("active")) return;
  const breadcrumbs = [".breadcrumb__second", ".breadcrumb__first"];
  const elmsToToggleVisibility = [
    ".ingredients-wrapper",
    ".recipe-suggestions-wrapper",
    ".display-evaluated-ingredients-btn",
    ".display-liked-recipes-btn",
  ];
  const mobileCloseBtns = [
    document.querySelector(".close-liked-recipes-window"),
    document.querySelector(".close-evaluated-ingredients-window"),
  ];
  mobileCloseBtns.forEach((btn) => {
    if (
      window.getComputedStyle(btn).display !== "none" &&
      window.getComputedStyle(btn.closest(".window")).display !== "none"
    ) {
      btn.click();
    }
  });

  breadcrumbs.forEach((breadcrumb) => {
    document.querySelector(breadcrumb).classList.toggle("active");
  });
  elmsToToggleVisibility.forEach((elm) => {
    document.querySelector(elm).classList.toggle("hidden");
  });
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
    recipeSwiperInit();
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
  console.log("oled ingr", likedIngrArr);
  console.log("likedIngredientsmain", likedIngredientsMain);
  console.log("likedIngredientsSecondary", likedIngredientsSecondary);

  //because from all liked ingredients only one main ingr wil be used
  //the resulting array length will be calculated based on secondary ingr + the main one
  const numberOfMainIngrToInclude = likedIngredientsMain.length ? 1 : 0;
  const numberOfSecondaryIngrToInclude =
    likedIngredientsSecondary.length >= 3
      ? 3
      : likedIngredientsSecondary.length;

  const resultArrLength =
    numberOfMainIngrToInclude + numberOfSecondaryIngrToInclude;

  const indexes = new Set();

  while (indexes.size < 1 && likedIngredientsMain.length) {
    const index = getRandomInt(0, likedIngredientsMain.length - 1);
    if (mainIngredientsCollection.includes(likedIngredientsMain[index])) {
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

//Fisher-Yates shuffle algoirthm - inplace random shuffling
const randomizeArray = function (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let randIndex = getRandomInt(0, i);
    [arr[i], arr[randIndex]] = [arr[randIndex], arr[i]];
  }
};

const getRecipesBasedOnUsersIngredients = async function (userId, noOfResults) {
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
    console.log("ingr obj", ingredientsObj);
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

    while (recipesToEvaluate.length < noOfResults) {
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
  randomizeArray(recipesToEvaluate);
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
//this must be throttled to not overload the API
//or just handle the error of the api for too many requests
const renderNextRecipeCard = function () {
  renderRecipeCard(recipesToEvaluate.shift());
  handleRecipesStack();
  if (recipesToEvaluate.length < 10) {
    getRecipesBasedOnUsersIngredients(user.uid, 25);
  }
};
// these 2 functions must be refactored (DRY principle)

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
const functions = getFunctions();
const getImgBase64 = httpsCallable(functions, "getImgBase64");

const createBlobImg = async function (imgSrc) {
  //takes a img src URL, fetches it on the server side to bypass CORS policy
  // and turns the result into a blob
  const base64Img = await getImgBase64(imgSrc);
  const someMagic = await fetch(`data:image/jpeg;base64,${[base64Img.data]}`);
  const blob = await someMagic.blob();
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

const swipeRight = async function (e) {
  //locked class is present only while the swipe animation is executing to
  //block chaotic behavior + it is set on both buttons
  const likeBtn = e.target.closest("div");
  if (likeBtn.classList.contains("locked")) return;
  document.querySelectorAll(".action-btns__btn").forEach((button) => {
    button.classList.add("locked");
  });
  likeBtn.classList.add("swiper-btn-animation");
  const recipeCard = document.querySelector(".recipe-card-component");
  recipeCard.classList.add("swipe-right");

  const recipeName = recipeCard.children[1].children[0].innerText;
  const recipeImageSrc = recipeCard.children[0].currentSrc;
  const recipeID = recipeCard.dataset.recipeid;

  //actions to take when the animation is finished
  const finishSwipeRight = function () {
    recipeCard.remove();
    likeBtn.classList.remove("swiper-btn-animation");
    document.querySelectorAll(".action-btns__btn").forEach((button) => {
      button.classList.remove("locked");
    });
    renderLikedRecipe(recipeImageSrc, recipeName, recipeID);

    //select the freshly rendered recipe and handle the animation process
    const renderedRecipe = document.querySelector(".img-and-title-component");
    renderedRecipe.classList.add("liked-recipe-pop");
    const removeAnimationClass = function () {
      renderedRecipe.classList.remove("liked-recipe-pop");
      renderedRecipe.removeEventListener("animationend", removeAnimationClass);
    };
    renderedRecipe.addEventListener("animationend", removeAnimationClass);
    renderNextRecipeCard();
    recipeCard.removeEventListener("animationend", finishSwipeRight);
  };
  recipeCard.addEventListener("animationend", finishSwipeRight);

  //store the recipe on firebase
  const firebaseRecipeImgSrc = await storeImgAndReturnUrl(
    recipeImageSrc,
    recipeID
  );
  storeRecipe(user.uid, recipeID, firebaseRecipeImgSrc, recipeName, "liked");
};

//similar to the swipe right function : should refactor (DRY principle)
const swipeLeft = function (e) {
  const dislikeBtn = e.target.closest("div");
  if (dislikeBtn.classList.contains("locked")) return;

  document.querySelectorAll(".action-btns__btn").forEach((button) => {
    dislikeBtn.classList.add("locked");
  });
  dislikeBtn.classList.add("swiper-btn-animation");
  const recipeCard = document.querySelector(".recipe-card-component");
  recipeCard.classList.toggle("swipe-left");
  const finishSwipeLeft = function () {
    recipeCard.remove();
    document.querySelectorAll(".action-btns__btn").forEach((button) => {
      button.classList.remove("locked");
    });
    dislikeBtn.classList.remove("swiper-btn-animation");
    renderNextRecipeCard();
    recipeCard.removeEventListener("animationend", finishSwipeLeft);
  };
  recipeCard.addEventListener("animationend", finishSwipeLeft);
  const recipeName = recipeCard.children[1].children[0].innerText;
  const recipeID = recipeCard.dataset.recipeid;
  storeRecipe(user.uid, recipeID, "", recipeName, "disliked");
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
function getIngredientsHTML(recipe) {
  let result = [];
  for (let i = 0; i < 3; i++) {
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
  ${getIngredientsHTML(recipe)}

  </div>
  <button class="recipe-card-component__button">
  See All Ingredients
  </button>
  </figure>
`;
  const container = document.querySelector(".swiper-component__card-container");
  container.insertAdjacentHTML("beforeend", html);
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
const toggleLikedRecipesVisibility = function () {
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  const swiperComponent = document.querySelector(".swiper-component");
  const displayLikedRecipesBtn = document.querySelector(
    ".display-liked-recipes-btn"
  );
  const closeLikedRecipesWindow = document.querySelector(
    ".close-liked-recipes-window"
  );

  likedRecipesContainer.classList.toggle("grid");
  swiperComponent.classList.toggle("hidden");
  displayLikedRecipesBtn.classList.toggle("hidden");
  closeLikedRecipesWindow.classList.toggle("inline");
};

const handleCloseBtnsVisibility = function () {
  const closeLikedRecipesWindow = document.querySelector(
    ".close-liked-recipes-window"
  );
  const closeEvalIngrWindowBtn = document.querySelector(
    ".close-evaluated-ingredients-window"
  );
  const viewportWidth = window.innerWidth;

  closeLikedRecipesWindow.classList.add("hidden");
  closeEvalIngrWindowBtn.classList.add("hidden");

  if (viewportWidth > 800) return;
  closeEvalIngrWindowBtn.classList.remove("hidden");
  if (viewportWidth > 700) return;
  closeLikedRecipesWindow.classList.remove("hidden");
};
handleCloseBtnsVisibility();

let zIndex = 1000;
const handleRecipesStack = function () {
  //the recipes in the swiper component are stacked by absolute positioning
  //they are ordered using z-index and only a box-shadow is visible for aesthetic reasons
  document.querySelectorAll(".recipe-card-component").forEach((card, index) => {
    zIndex--;
    card.style.zIndex = `${zIndex}`;
    if (index === 2) {
      card.style.boxShadow = "";
      card.querySelector(".recipe-card-component__button").style.boxShadow = "";
      card.querySelector(".recipe-card-component__img").style.boxShadow = "";
      return;
    }
    card.style.boxShadow = "none";
    card.querySelector(".recipe-card-component__button").style.boxShadow =
      "none";
    card.querySelector(".recipe-card-component__img").style.boxShadow = "none";
  });
};

const recipeSwiperInit = async function () {
  //handles the swiper component at page load
  // await checkAgainstEvaluatedRecipes(user.uid, []);
  await getRecipesBasedOnUsersIngredients(user.uid, 10);
  for (let counter = 0; counter < 10; counter++) {
    renderNextRecipeCard();
  }
  handleRecipesStack();
};

const addEventListeners = function () {
  const breadcrumbBtns = document.querySelectorAll(".breadcrumb");
  breadcrumbBtns.forEach((btn) =>
    btn.addEventListener("click", breadcrumbsFunctionality)
  );
  const ingredientsEvaluationContainer = document.querySelector(
    ".ingredients-to-evaluate"
  );
  ingredientsEvaluationContainer.addEventListener(
    "pointerdown",
    evaluateIngredient
  );
  const swipeRightBtn = document.querySelector(".action-btns__btn__like");
  const swipeLeftBtn = document.querySelector(".action-btns__btn__dislike");
  swipeRightBtn.addEventListener("click", swipeRight);
  swipeLeftBtn.addEventListener("click", swipeLeft);
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
  const displayLikedRecipesBtn = document.querySelector(
    ".display-liked-recipes-btn"
  );
  displayLikedRecipesBtn.addEventListener(
    "click",
    toggleLikedRecipesVisibility
  );
  const closeLikedRecipesWindow = document.querySelector(
    ".close-liked-recipes-window"
  );
  closeLikedRecipesWindow.addEventListener(
    "click",
    toggleLikedRecipesVisibility
  );
  window.addEventListener("resize", debounce(handleCloseBtnsVisibility));
};
addEventListeners();
