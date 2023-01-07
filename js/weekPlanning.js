//code from choose meals
//refactor it for reusability later!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!1
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
  uploadBytes,
} from "firebase/storage";
import { toTitleCase } from "./reusableFunctions.js";
import { getAuth, linkWithRedirect, onAuthStateChanged } from "firebase/auth";
import {
  storeIngredient,
  getIngredients,
  storeRecipe,
  getRecipes,
} from "./liveDatabaseFunctions.js";

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
const storage = getStorage(app);
// const storageRef = ref(storage, "ingredients/");
const auth = getAuth();

let user;
onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    user = curUser;
    renderFirebaseRecipes();
  } else {
  }
});

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
  const html = `
      <figure data-recipeid = ${recipeId} class="meal-component">
          <img draggable="false" src=${imageSrc}
            alt="image of juicy burger" class="meal-component__img" />
          <h2 class="meal-component__title">${name}</h2>
        </figure>`;
  container.insertAdjacentHTML("afterbegin", html);
};

const dragRecipe = function (e) {
  const targetIsMealComponent = e.target.closest(".meal-component");
  if (!targetIsMealComponent) return;

  const targetIsMealPlaceholder = e.target
    .closest(".meal-component")
    .classList.contains("meal-placeholder");
  if (targetIsMealPlaceholder) return;

  const clickedRecipe = e.target.closest(".meal-component");
  const clickedRecipeStyles = window.getComputedStyle(clickedRecipe);
  let shiftX = e.clientX - clickedRecipe.getBoundingClientRect().left;
  let shiftY = e.clientY - clickedRecipe.getBoundingClientRect().top;
  let recipeContainer;
  let recipeClone;
  let draggedMealClass;

  const appendMealPlaceholder = function (container) {
    html = `
        <figure class="meal-component meal-placeholder">
          <div class="plus-icon">
            <svg
              class="icon"
              name="add-outline"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        </figure>`;
    container.insertAdjacentHTML("afterbegin", html);
  };

  const updateElemBelow = function (event) {
    //gets the element below the clone we moving with the pointer
    recipeClone.style.display = "none";
    elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    recipeClone.style.display = "";
  };

  const updateClonePosition = function (event) {
    //makes the clone follow the pointer
    recipeClone.style.top = `${parseInt(event.pageY) - parseInt(shiftY)}px`;
    recipeClone.style.left = `${parseInt(event.pageX) - parseInt(shiftX)}px`;

    updateElemBelow(event);

    //if pointer is on top of meal placeholder, placeholder is highlighted
    if (elemBelow.closest(".meal-component.meal-placeholder")) {
      elemBelow
        .closest(".meal-component.meal-placeholder")
        .classList.add("placeholder-hovered");
      //else all placeholders are un-highlighted
    } else {
      document.querySelectorAll(".meal-placeholder").forEach((elm) => {
        elm.classList.remove("placeholder-hovered");
      });
    }
  };

  const handleDrop = function (e) {
    document.removeEventListener("pointermove", updateClonePosition);

    const onDroppableArea =
      elemBelow &&
      (elemBelow.closest(".meal-component.meal-placeholder") ||
        elemBelow.closest(".chosen-meal-component .meal-component"));
    if (onDroppableArea) {
      const dropPlaceholder = elemBelow.closest(".meal-component");
      dropContainer = dropPlaceholder.parentElement;
      dropPlaceholder.remove();
      dropContainer.prepend(recipeClone);
      recipeClone.style = "";
      recipeClone.classList.remove(draggedMealClass);
    } else {
      recipeClone.remove();
    }

    recipeClone.removeEventListener("pointerup", handleDrop);
  };

  //execute different code depending on the type of meal that we drag
  const targetIsChosenMeal = clickedRecipe.closest(".chosen-meal-component");
  if (targetIsChosenMeal) {
    recipeContainer = clickedRecipe.closest(".chosen-meal-component");
    recipeClone = clickedRecipe;
    draggedMealClass = "dragging-chosen";
    appendMealPlaceholder(recipeContainer);
  } else {
    recipeClone = clickedRecipe.cloneNode(true);
    draggedMealClass = "dragging-liked";
  }

  //this gives the initial position
  //solves the situation in which pointer is not moved after pointerdown
  recipeClone.style.top = `${parseInt(e.pageY) - parseInt(shiftY)}px`;
  recipeClone.style.left = `${parseInt(e.pageX) - parseInt(shiftX)}px`;

  //match the clone's style with the original
  recipeClone.style.height = clickedRecipeStyles.height;
  recipeClone.style.width = clickedRecipeStyles.width;

  recipeClone.classList.add(draggedMealClass);
  document.body.append(recipeClone);
  updateElemBelow(e);

  document.addEventListener("pointermove", updateClonePosition);
  recipeClone.addEventListener("pointerup", handleDrop);
};

const addEventListeners = function () {
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  likedRecipesContainer.addEventListener("pointerdown", dragRecipe);

  const chosenRecipesContainer = document.querySelector(
    ".chosen-meal-component-wrapper"
  );
  chosenRecipesContainer.addEventListener("pointerdown", dragRecipe);
};
addEventListeners();
