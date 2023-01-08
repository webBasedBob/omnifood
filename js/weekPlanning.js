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
import {
  ActionCodeURL,
  getAuth,
  linkWithRedirect,
  onAuthStateChanged,
} from "firebase/auth";
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
    const html = `
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

const toDateStringOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const weekComponentGenerator = function* (daysFromNow) {
  //a generator that generates an ID for every UI week element and
  //the week text for the same element
  //used a generator to return them separately
  //i could have returned an object with the two properties tho

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + daysFromNow);
  const weekEnd = new Date(weekStart.getTime());
  weekEnd.setDate(weekEnd.getDate() + 6);
  const month = weekEnd
    .toDateString(undefined, toDateStringOptions)
    .slice(4, 7);
  const weekId = `${weekStart.getFullYear()}-${
    weekStart.getMonth() + 1
  }-${weekStart.getDate()}`;
  yield weekId;
  const weekHtml = `${weekStart.getDate()}-${weekEnd.getDate()} ${month}`;
  return weekHtml;
};

const arrowDownSVG = function (className) {
  //returns a SVG representing an arrow pointing down

  return `
  <svg
    class="${className}"
    name="chevron-down"
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
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
  </svg>`;
};

const generateAvailableWeeks = function () {
  //generates the html for the available weeks window/pop-up
  //uses the day of the execution as starting date and goes 2 weeks in the past and 4 in the future

  const daysFromToday = [-14, -7, 0, 7, 14, 21, 28];
  let weeksHtml = daysFromToday.reduce((prev, current) => {
    const weekGenerator = weekComponentGenerator(current);
    return (
      prev +
      `<p data-weekid=${
        weekGenerator.next().value
      } class="available-weeks__week">
    ${weekGenerator.next().value}
  </p>`
    );
  }, `<div class="hidden available-weeks">`);
  return weeksHtml + `</div>`;
};

const generateWeekCalendar = function (date) {
  //generates a calendar component's html for a week, starting with the date received as input
  //it also highlightes thw weekday component that matches the today's date
  //the input must be a string under the format:
  // "YYYY-MM-DD", examples: "1999-02-15"; "2023-10-28"

  const startDate = new Date(date);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekCalendarHtml = weekdays.reduce((acc, currVal, currIndex) => {
    //increment date with one day at every iteration except the first one
    startDate.setDate(startDate.getDate() + (currIndex ? 1 : 0));

    const monthName = startDate
      .toDateString(undefined, toDateStringOptions)
      .slice(4, 7);
    const isToday =
      new Intl.DateTimeFormat("en-US").format(
        new Date(
          `${startDate.getFullYear()}-${
            startDate.getMonth() + 1
          }-${startDate.getDate()}`
        )
      ) === new Intl.DateTimeFormat("en-US").format(new Date());
    const weekday = currVal;
    const dayOfMonth = startDate.getDate();
    const dateId =
      `${weekday}_${dayOfMonth}_${monthName}_${startDate.getFullYear()}`.toLowerCase();

    return (
      acc +
      `<div data-dateid="${dateId}" class="${
        isToday ? "active " : ""
      }week-calandar__weekday">
          <div class="week-calandar__weekday__semicircle week-calandar__weekday__semicircle__top"
          ></div>
          <p class="week-calandar__weekday__initial">${weekday[0]}</p>
          <p class="week-calandar__weekday__number">${dayOfMonth}</p>
          <div class="week-calandar__weekday__semicircle week-calandar__weekday__semicircle__bottom">
            ${arrowDownSVG("icon week-calandar__weekday__semicircle__arrow")}
          </div>
      </div>`
    );
  }, "");
  return weekCalendarHtml;
};

const initCalendarComponent = function () {
  //funtion run at the pageload
  //render the component with data generated on the fly

  const thisWeekStartDate = new Date();
  thisWeekStartDate.setDate(
    thisWeekStartDate.getDate() - thisWeekStartDate.getDay()
  );
  const currentWeekId = `${thisWeekStartDate.getFullYear()}-${
    thisWeekStartDate.getMonth() + 1
  }-${thisWeekStartDate.getDate()}`;
  const weekCalendarHtml = generateWeekCalendar(currentWeekId);
  const currentWeekGenerator = weekComponentGenerator(0);
  const html = `
  ${generateAvailableWeeks()}
  <div data-currentweekid = "${
    currentWeekGenerator.next().value
  }" class="current-week"><p>${
    currentWeekGenerator.next().value
  }</p> ${arrowDownSVG("icon current-week__arrow")}</div>
    <div class="week-calandar">
    ${weekCalendarHtml}
    </div>
    `;
  document
    .querySelector(".calendar-component")
    .insertAdjacentHTML("afterbegin", html);
};

initCalendarComponent();

const handleWeeksWindowOutsideClick = function (e) {
  //closes the available weeks pop-up if click is outside it

  if (e.target.closest(".current-week")) return;
  if (e.target.closest(".available-weeks")) return;
  const weeksWindow = document.querySelector(".available-weeks");
  weeksWindow.classList.add("hidden");
  document.removeEventListener("click", handleWeeksWindowOutsideClick);
};

const handleWeeksWindowDisplay = function () {
  //opens/closes available weeks pop-up and attaches handler
  //for outside click closing event

  const weeksWindow = document.querySelector(".available-weeks");
  weeksWindow.classList.toggle("hidden");
  if (weeksWindow.classList.contains("hidden")) return;
  document.addEventListener("click", handleWeeksWindowOutsideClick);
};

const handleCurrentWeekChange = function (e) {
  // generates a new week calendar comonent based on and replaces the current one
  //if no weekday  equals today's date, the first weekday becomes the active one

  if (!e.target.classList.contains("available-weeks__week")) return;
  const weekId = e.target.dataset.weekid;
  const weekCalendarHtml = generateWeekCalendar(weekId);
  const weekCalendarContainer = document.querySelector(".week-calandar");
  weekCalendarContainer.innerHTML = weekCalendarHtml;
  const currentWeekNameContainer = document.querySelector(".current-week p");
  currentWeekNameContainer.innerText = e.target.innerText;
  const activeWeekdayExists = document.querySelector(
    ".week-calandar__weekday.active"
  );
  if (!activeWeekdayExists) {
    document.querySelector(".week-calandar__weekday").classList.add("active");
  }
};

const handleWeekdayClick = function (e) {
  //only the clicked weekday ends up being active

  const weekdayTarget = e.target.closest(".week-calandar__weekday");
  if (!weekdayTarget) return;
  if (weekdayTarget.classList.contains("active")) return;

  const weekdayElems = document.querySelectorAll(".week-calandar__weekday");
  weekdayElems.forEach((elem) => {
    elem.classList.remove("active");
  });
  weekdayTarget.classList.add("active");
};

const addEventListeners = function () {
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  likedRecipesContainer.addEventListener("pointerdown", dragRecipe);

  const chosenRecipesContainer = document.querySelector(
    ".chosen-meal-component-wrapper"
  );
  chosenRecipesContainer.addEventListener("pointerdown", dragRecipe);
  const chooseWeekBtn = document.querySelector(".current-week");
  chooseWeekBtn.addEventListener("click", handleWeeksWindowDisplay);
  const weeksWindow = document.querySelector(".available-weeks");
  weeksWindow.addEventListener("click", handleCurrentWeekChange);
  const calendarComponent = document.querySelector(".calendar-component");
  calendarComponent.addEventListener("click", handleWeekdayClick);
};
addEventListeners();
