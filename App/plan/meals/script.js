import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import {
  toTitleCase,
  extractRecipeId,
  debounce,
  imagesAreLoaded,
  throwError,
} from "../../general/js/reusableFunctions.js";
import { getAuth, linkWithRedirect, onAuthStateChanged } from "firebase/auth";
import {
  getIngredients,
  storeRecipe,
  getRecipes,
} from "../../general/js/liveDatabaseFunctions.js";
import FullscreenRecipe from "../../general/components/fullScreenRecipe/script.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import Notification from "../../general/components/notification/script.js";
import Navigation from "../../general/components/navigation/script.js";
import AuthModal from "../../general/components/authModal/script.js";
import { globalEventsHandler } from "../../general/js/crossSiteFunctionality.js";
import NotLoggedInScreen from "../../general/components/notLoggedInScreen/script";
import { EDAMAM_ACCOUNTS } from "../../general/js/CONFIG.js";
import ErrorPopup from "../../general/components/errorModal/script";
import Loader from "../../general/components/loader/script";
let edamamApiAccountIndex = 0;
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
    document.querySelector(".recipe-suggestions-wrapper"),
    document.querySelector(".breadcrumbs"),
  ];
  pageContent.forEach((section) => {
    section.classList.add("hidden");
  });
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};

const displayPageContent = function () {
  const pageContent = [
    document.querySelector(".breadcrumbs"),
    document.querySelector(".recipe-suggestions-wrapper"),
  ];
  pageContent.forEach((section) => {
    section.classList.remove("hidden");
  });
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.add("hidden");
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, "ingredients/");
const auth = getAuth();

let user;
let currentRecipeIndex = 0;
let recipesToEvaluate = [];

const displayNotLoggedInScreen = function () {
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};

Loader.display();
onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    Loader.display();
    displayPageContent();
    user = curUser;
    await renderFirebaseRecipes();
    await recipeSwiperInit();
    await imagesAreLoaded(".recipe-suggestions-wrapper img");
    Loader.hide();
  } else {
    displayNotLoggedInScreen();
    hidePageContent();
    Loader.hide();
  }
});

const retreiveRecipesFromApi = async function (url) {
  //gets recipes from Edamam
  //return an array
  const rawResult = await fetch(url);
  const jsonResult = await rawResult.json();
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
    result.push(likedIngredientsSecondary[val]);
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

const storeRecipesGlobally = function (recipesArr) {
  const transformedRecipes = recipesArr.map((recipe) => {
    return { ...recipe, id: extractRecipeId(recipe) };
  });
  FullscreenRecipe.recipeSearchResults.push(...transformedRecipes);
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
    edamamApiAccountIndex = 0;
    const ingredientsObj = await getIngredients(userId);

    const ingredientsArr = ingredientsObj
      ? Object.entries(ingredientsObj)
      : Object.entries(dummyData);

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

    while (recipesToEvaluate.length < noOfResults) {
      try {
        const url = createIngredientsBasedUrl(
          modifyLikedIngrArr(likedIngredients),
          dislikedIngredients
        );
        const recipes = await retreiveRecipesFromApi(url);
        await checkAgainstEvaluatedRecipes(user.uid, recipes);
      } catch (error) {
        if (error.message === "Failed to fetch") {
          if (edamamApiAccountIndex < EDAMAM_ACCOUNTS.length - 1) {
            edamamApiAccountIndex++;
          } else {
            throw new Error(error.message);
          }
        }
      }
    }
  } catch (error) {
    if (error.message === "Failed to fetch") {
      const renderedRecipes = document.querySelectorAll(
        ".recipe-card-component"
      );
      if (recipesToEvaluate.length === 0 && renderedRecipes.length === 0) {
        throwError(error.message);
        const actionBtns = document.querySelector(".action-btns");
        actionBtns.classList.add("hidden");
      }
    }
  }
};

const checkAgainstEvaluatedRecipes = async function (userId, apiRecipesResult) {
  //takes recipes outputed from the Edamama API call as second input
  //takes recipes the user already evaluated from the cloud using its UID
  //loops through all Edamam recipes and the one already evaluated are ignored
  // and those not yet evaluated are stored in an global var to be displayed later

  const evaluatedRecipes = await getRecipes(userId);
  if (!evaluatedRecipes || Object.keys(evaluatedRecipes).length === 0) {
    recipesToEvaluate.push(...apiRecipesResult);
    storeRecipesGlobally(recipesToEvaluate);
  } else {
    apiRecipesResult.forEach((recipe) => {
      const recipeId = extractRecipeId(recipe);
      const recipeAlreadyEvaluated = recipeId in evaluatedRecipes;
      if (!recipeAlreadyEvaluated) {
        recipesToEvaluate.push(recipe);
      }
    });
    storeRecipesGlobally(recipesToEvaluate);
  }
  randomizeArray(recipesToEvaluate);
};

const createIngredientsBasedUrl = function (likedIngr, dislikedIngr) {
  //creates the complete Edamam API url to feed the Fetch method when needed

  let resultUrl = [`https://api.edamam.com/api/recipes/v2?type=any`];
  const appId = EDAMAM_ACCOUNTS[edamamApiAccountIndex].id;
  const appKey = EDAMAM_ACCOUNTS[edamamApiAccountIndex].key;
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
    console.error(error);
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
    console.error(error);
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
  //the ttile must be cut because some are very long(i.e. "Taco Cupcakes In Time For Cinco De Mayo","tablet":"bite Size Celebration: Taco Cupcakes In Time For Cinco De Mayo","mobile":"bite-size Celebration: Taco Cupcakes For Cinco De Mayo"}' Class=""> Bite Size Celebration: Taco Cupcakes In Time For Cinco De Mayo Recipe") *this is a single tile

  const title = recipe.label
    .trim()
    .slice(0, recipe.label.trim().indexOf(" ", 60));
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
  ${toTitleCase(title)}
  </h2>
  ${getIngredientsHTML(recipe)}

  </div>
  <button data-event="open-full-screen-recipe" class="recipe-card-component__button">
  See All Ingredients
  </button>
  </figure>
`;
  const container = document.querySelector(".swiper-component__card-container");
  container.insertAdjacentHTML("beforeend", html);
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
  const viewportWidth = window.innerWidth;
  closeLikedRecipesWindow.classList.add("hidden");
  if (viewportWidth > 800) return;
  if (viewportWidth > 700) return;
  closeLikedRecipesWindow.classList.remove("hidden");
};
handleCloseBtnsVisibility();

let zIndex = 1000;
document.querySelector(".account-options").style.zIndex = `${zIndex + 100}`;

const handleRecipesStack = function () {
  //the recipes in the swiper component are stacked by absolute positioning
  //they are ordered using z-index and only a box-shadow is visible for aesthetic reasons
  const stackedRecipeCards = document.querySelectorAll(
    ".recipe-card-component"
  );
  stackedRecipeCards.forEach((card, index) => {
    if (index === 0) {
      card.classList.remove("shadows");
    }
    if (index === 1) {
      card.classList.add("shadows");
    }
    if (index === stackedRecipeCards.length - 1) {
      card.style.zIndex = `${zIndex}`;
      --zIndex;
    }
  });
};

const recipeSwiperInit = async function () {
  //handles the swiper component at page load
  // await checkAgainstEvaluatedRecipes(user.uid, []);
  await getRecipesBasedOnUsersIngredients(user.uid, 10);
  for (let counter = 0; counter < 10; counter++) {
    renderNextRecipeCard();
    handleRecipesStack();
  }
};

const addEventListeners = function () {
  document.addEventListener("click", globalEventsHandler);
  const swipeRightBtn = document.querySelector(".action-btns__btn__like");
  const swipeLeftBtn = document.querySelector(".action-btns__btn__dislike");
  swipeRightBtn.addEventListener("click", swipeRight);
  swipeLeftBtn.addEventListener("click", swipeLeft);
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
  const swiperComponent = document.querySelector(".swiper-component");
  swiperComponent.addEventListener("click", (e) => {
    const recipeCard = e.target.closest(".recipe-card-component");
    if (recipeCard) {
      Loader.display();
      const recipeId = recipeCard.dataset.recipeid;
      FullscreenRecipe.open(recipeId, false);
      Loader.hide();
    }
  });
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  likedRecipesContainer.addEventListener("click", async (e) => {
    const recipeId = e.target.closest(".img-and-title-component")?.dataset
      .recipeid;
    if (!recipeId) return;
    Loader.display();
    await FullscreenRecipe.open(recipeId, false);
    await imagesAreLoaded(".front-image");
    Loader.hide();
  });
};
addEventListeners();
