//code from choose meals
//refactor it for reusability later!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!1
import { initializeApp } from "firebase/app";
import { toTitleCase, debounce } from "../../general/js/reusableFunctions.js";
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
} from "../../general/js/liveDatabaseFunctions.js";
import {
  getDatabase,
  set,
  ref,
  get,
  onValue,
  child,
  push,
  update,
} from "firebase/database";

import Notification from "../../general/components/notification/script.js";
import Navigation from "../../general/components/navigation/script.js";
import AuthModal from "../../general/components/authModal/script.js";
import { NotLoggedInScreen } from "../../general/components/notLoggedInScreen/script.js";
import { globalEventsHandler } from "../../general/js/crossSiteFunctionality.js";
document.addEventListener("click", globalEventsHandler);
//
//to do:
//handle errors
//
//
//
// document.body.style.touchAction = "none";
// document.querySelector(".liked-recipes").style.touchAction = "none";
// document
//   .querySelectorAll(".chosen-meal-component")
//   .forEach((component) => (component.style.touchAction = "none"));
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

const auth = getAuth();
document.querySelector(".account-options").style.zIndex = `${20}`;
let user;
const hidePageContent = function () {
  const pageContent = [
    document.querySelector(".main-content-layout"),
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
    document.querySelector(".main-content-layout"),
  ];
  pageContent.forEach((section) => {
    section.classList.remove("hidden");
  });
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.add("hidden");
};
const displayNotLoggedInScreen = function () {
  const notLoggedInScreen = document.querySelector(".not-logged-in-screen");
  notLoggedInScreen.classList.remove("hidden");
};

onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    displayPageContent();
    user = curUser;
  } else {
    displayNotLoggedInScreen();
    hidePageContent();
  }
});
onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    user = curUser;
    renderFirebaseRecipes();
    initCalendarComponent();
    renderPlan();
    addEventListeners();
  } else {
    // displayNotLoggedInScreen();
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
    const likedMealsContainer = document.querySelector(`.liked-recipes`);
    likedRecipes.forEach((recipe) => {
      renderMeal(
        recipe[1].image,
        recipe[1].recipeName,
        recipe[0],
        likedMealsContainer
      );
    });
  } catch (error) {
    console.error(error);
  }
};
const renderMeal = function (imageSrc, name, recipeId, container) {
  //when a user press the like button on a recipe,
  //it is rendereb by this function in the liked recipes container

  const html = `
      <figure data-recipeid = ${recipeId} class="meal-component">
          <img draggable="false" src=${imageSrc}
            alt="image of juicy burger" class="meal-component__img" />
          <h2 class="meal-component__title">${name}</h2>
        </figure>`;
  container.insertAdjacentHTML("afterbegin", html);
};

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

// let finalPosition = {};
// let initialPosition = {};
// let actionAborted = false;
// const updatePointerPositionObj = function (e) {
//   finalPosition.X = e.clientX;
//   finalPosition.Y = e.clientY;
// };
// const abortAction = function () {
//   actionAborted = true;
//   document.removeEventListener("pointerup", abortAction);
//   document.removeEventListener("pointermove", updatePointerPositionObj);
// };
// const handleStart = () => {
//   console.log("start");
// };
// const handleEnd = () => {
//   console.log("end");
// };
// const handleCancel = (e) => {
//   e.preventDefault();
//   console.log("cancel");
// };
// const handleMove = () => {
//   console.log("move");
// };
// const handlecontextmenu = (e) => {
//   e.preventDefault();
//   document.querySelector(".liked-recipes").style.touchAction = "none";
//   console.log("context");
//   console.log(e);
//   e.target.dispatchEvent(
//     new MouseEvent("mousedown", { clientX: e.clientX, clientY: e.clientY })
//   );
//   // dragMeal(e);
// };
// document.addEventListener("contextmenu", handlecontextmenu);
// const handleDragPula = function (e) {
//   console.log(e);
//   e.preventDefault();
//   document.querySelector(".liked-recipes").style.touchAction = "none";
//   document.addEventListener("touchstart", handleStart);
//   document.addEventListener("touchend", handleEnd);
//   document.addEventListener("touchcancel", handleCancel);
//   document.addEventListener("touchmove", handleMove);
//   document.addEventListener("contextmenu", handlecontextmenu);

//   if (e.pointerType === "touch") {
//     initialPosition.X = e.clientX;
//     initialPosition.Y = e.clientY;
//     updatePointerPositionObj(e);
//     document.addEventListener("pointermove", updatePointerPositionObj);
//     document.addEventListener("pointerup", abortAction);
//     console.log(finalPosition, initialPosition, actionAborted);
//     setTimeout(() => {
//       // document.dispatchEvent(new PointerEvent("pointerup"));
//       const pointerNotMoved =
//         initialPosition.X > finalPosition.X - 10 &&
//         initialPosition.X < finalPosition.X + 10 &&
//         initialPosition.Y > finalPosition.Y - 10 &&
//         initialPosition.Y < finalPosition.Y + 10;
//       const dragMustStart = !actionAborted && pointerNotMoved;
//       console.log(finalPosition, initialPosition, actionAborted);
//       document.removeEventListener("pointermove", updatePointerPositionObj);
//       // document.querySelector(".liked-recipes").style.touchAction = "";
//       if (dragMustStart) {
//         dragMeal(e);
//       }
//       document.removeEventListener("pointermove", updatePointerPositionObj);
//     }, 500);
//   }
// };

// const handleDrag = function (e) {
//   // document.querySelector(".liked-recipes").style.touchAction = "pan-y";

//   console.log(e);
//   if (e.pointerType === "mouse" || true) {
//     dragMeal(e);
//   } else {
//     document.addEventListener("contextmenu", handlecontextmenu);
//   }
// };

const dragMeal = function (e) {
  //handles all it takes to enable drag and drop for meal components

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
  let elemBelow;

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
      const dropContainer = dropPlaceholder.parentElement;
      dropPlaceholder.remove();
      dropContainer.prepend(recipeClone);
      recipeClone.style = "";
      recipeClone.classList.remove(draggedMealClass);
    } else {
      recipeClone.remove();
    }

    document.removeEventListener("pointerup", handleDrop);
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
    // const handleCancelss = (e) => {
    //   e.preventDefault();
    //   console.log("cancel", e);
    //   recipeClone.click();
    //   e.target.dispatchEvent(
    //     new PointerEvent("pointerdown", {
    //       clientX: e.clientX,
    //       clientY: e.clientY,
    //     })
    //   );
    // };
    // document.addEventListener("pointercancel", handleCancelss);
    // recipeClone.style.touchAction = "none";
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

  document.addEventListener("pointerup", handleDrop);
  // document.addEventListener("pointercancel", () => {
  //   console.log("canceled");
  // });
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
      `<p data-weekid=${weekGenerator.next().value} class="${
        current === 0 ? "active " : ""
      }available-weeks__week">
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
  <div data-currentweekid = "${
    currentWeekGenerator.next().value
  }" class="current-week"> ${generateAvailableWeeks()}<p>${
    currentWeekGenerator.next().value
  }</p> ${arrowDownSVG("icon current-week__arrow")}</div>
    <div class="week-calandar">
    ${weekCalendarHtml}
    </div>
    `;
  const calendarComponentContainer = document.querySelector(
    ".calendar-component"
  );
  calendarComponentContainer.innerHTML = "";
  calendarComponentContainer.insertAdjacentHTML("afterbegin", html);
};

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

const handleWeekChange = async function (e) {
  // generates a new week calendar comonent based on and replaces the current one
  //if no weekday  equals today's date, the first weekday becomes the active one
  const target = e.target;
  if (!target.classList.contains("available-weeks__week")) return;
  highlightElm("active", target);
  await storePlanData();
  resetPlanMeals();

  const weekId = target.dataset.weekid;
  const weekCalendarHtml = generateWeekCalendar(weekId);
  const weekCalendarContainer = document.querySelector(".week-calandar");
  weekCalendarContainer.innerHTML = weekCalendarHtml;
  const currentWeekNameContainer = document.querySelector(".current-week > p");
  currentWeekNameContainer.innerText = target.innerText;
  const activeWeekdayExists = document.querySelector(
    ".week-calandar__weekday.active"
  );
  if (!activeWeekdayExists) {
    const forstDayOfWeek = document.querySelector(".week-calandar__weekday");
    highlightElm("active", forstDayOfWeek);
  }
  renderPlan();
};
async function firebasePostPlanData(userId, weekdayId, dataToStore) {
  //stores(in firebase) the plan user made (consisting of the two meals and delivery time) for a certain date
  const db = getDatabase();
  set(ref(db, `users/${userId}/plan/${weekdayId}`), dataToStore);
}

function firebaseGetPlanData(uid, weekdayId) {
  //gets the user data for a certain date
  //data represents the meals user saved for a certain date
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    onValue(ref(db, `users/${uid}/plan/${weekdayId}`), (snapshot) => {
      resolve(snapshot.val());
    });
  });
}

const renderPlan = async function () {
  //gets user data from firebase and renders  it  in the weekday plan component
  const currentDayData = await getPlanData();

  if (!currentDayData) return;

  const chosenMealContainers = Array.from(
    document.querySelectorAll(".chosen-meal-component")
  );
  let containerCounter = 0;

  for (let recipeId in currentDayData) {
    const chosenMealContainer = chosenMealContainers[containerCounter];
    const chosenMealPlaceholder = chosenMealContainer.querySelector("figure");
    chosenMealPlaceholder.remove();

    renderMeal(
      currentDayData[recipeId].image,
      currentDayData[recipeId].recipeName,
      recipeId,
      chosenMealContainer
    );

    const deliveryTimeElem = chosenMealContainer.querySelector("select");
    deliveryTimeElem.value = currentDayData[recipeId].deliveryTime;
    containerCounter++;
  }
};

const highlightElm = function (classToadd, elmToHighlight) {
  //removes the class from all siblings and adds it to the target element only

  const siblings = Array.from(elmToHighlight.parentElement.children);
  siblings.forEach((sibling) => {
    sibling.classList.remove(classToadd);
  });
  elmToHighlight.classList.add(classToadd);
};

const handleWeekdayClick = async function (e) {
  // handler for when the user clicks on another weekday
  //stores the current weekday plan in firebase before selecting
  //the weekday user clicked on -> plan data is rendered for the latter one

  const targetWeekday = e.target.closest(".week-calandar__weekday");
  if (!targetWeekday) return;
  if (targetWeekday.classList.contains("active")) return;
  await storePlanData();
  highlightElm("active", targetWeekday);
  resetPlanMeals();
  renderPlan();
};

const resetPlanMeals = function () {
  //removes the meals from the component and inserts meal placeholders in their places

  const planMealContainers = document.querySelectorAll(
    ".chosen-meal-component"
  );
  planMealContainers.forEach((container) => {
    if (container.classList.contains("meal-placeholder")) return;
    const mealElem = container.querySelector("figure");
    mealElem.remove();
    appendMealPlaceholder(container);
  });
  // const firstBreadcrumb = document.querySelector(".breadcrumb__first");
  // firstBreadcrumb.click();
};

const getPlanData = async function () {
  //gets plan data from firebase for the selected weekday

  const targetDay = document.querySelector(".active.week-calandar__weekday");
  const targetDayId = targetDay.dataset.dateid;
  const planDataForTargetDay = await firebaseGetPlanData(user.uid, targetDayId);
  return planDataForTargetDay;
};

const storePlanData = async function () {
  //stores plan data for the selected weekday in firebase

  const planDayMeals = document.querySelectorAll(
    ".chosen-meal-component .meal-component"
  );
  const currentPlanDay = document.querySelector(
    ".active.week-calandar__weekday"
  );
  const planDayId = currentPlanDay.dataset.dateid;
  let planData = {};
  const mealPlaceholder = document.querySelectorAll(
    ".chosen-meal-component .meal-component.meal-placeholder"
  );
  if (mealPlaceholder.length === 1) {
    alert(
      "You can't save the plan for this day while containing only one meal. Please add one more or remove both"
    );
    return;
  }
  planDayMeals.forEach(async (meal) => {
    if (meal.classList.contains("meal-placeholder")) return;
    const recipeId = meal.dataset.recipeid;
    const recipeImg = meal.querySelector("img").src;
    const recipeName = meal.querySelector("h2").innerText;
    const deliveryTime = meal
      .closest(".chosen-meal-component")
      .querySelector("#delivery-times").value;

    planData[recipeId] = {
      recipeName: recipeName,
      image: recipeImg,
      deliveryTime: deliveryTime,
    };
  });
  await firebasePostPlanData(user.uid, planDayId, planData);
};

const handleSaveBtnClick = function () {
  //save button must save the current weekday plan data and move to the next one
  //so the event handler generates a click on the next weekday
  //if the current weekday is the last, it generates click on next week

  const currentWeekDay = document.querySelector(
    ".active.week-calandar__weekday"
  );
  const nextWeekDay = currentWeekDay.nextSibling;
  if (nextWeekDay && nextWeekDay.nodeName !== "#text") {
    nextWeekDay.click();
  } else {
    const currentWeek = document.querySelector(".active.available-weeks__week");
    const nextWeek = currentWeek.nextSibling;
    if (nextWeek) {
      nextWeek.click();
    }
  }
  // const firstBreadcrumb = document.querySelector(".breadcrumb__first");
  // firstBreadcrumb.click();
};

// const handleFirstBreadcrumbClick = function (e) {
//   const mealToDisplay = document.querySelector(".chosen-meal-component__first");
//   const mealToHide = document.querySelector(".chosen-meal-component__second");
//   mealToDisplay.classList.add("flex");
//   mealToHide.classList.add("hidden");
//   mealToDisplay.classList.remove("hidden");
//   mealToHide.classList.remove("flex");
// };
const handleBreadcrumbsClick = function (e) {
  const breadcrumbs = e.target.closest(".breadcrumbs").querySelectorAll("div");
  breadcrumbs.forEach((breadcrumb) => {
    breadcrumb.classList.remove("active");
  });
  e.target.classList.add("active");

  const targetMealModifier = e.target.classList[1].slice(
    e.target.classList[1].indexOf("__") + 2
  );
  const mealToDisplayClass = `chosen-meal-component__${targetMealModifier}`;
  const mealComponents = document.querySelectorAll(".chosen-meal-component");
  mealComponents.forEach((mealComponent) => {
    if (mealComponent.classList.contains(mealToDisplayClass)) {
      mealComponent.classList.add("flex");
      mealComponent.classList.remove("hidden");
    } else {
      mealComponent.classList.remove("flex");
      mealComponent.classList.add("hidden");
    }
  });
};

let targetPlaceholder;
const selectRecipe = function (e) {
  const mealComponent = e.target.closest(".meal-component");
  if (!mealComponent) return;
  const mealComponentClone = mealComponent.cloneNode(true);
  const dropContainer = targetPlaceholder.parentElement;
  targetPlaceholder.remove();
  dropContainer.prepend(mealComponentClone);
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  likedRecipesContainer.classList.remove("flex");
  likedRecipesContainer.removeEventListener("click", selectRecipe);
};

const openLikedRecipesWindow = function (e) {
  targetPlaceholder = e.target.closest(".meal-placeholder");
  if (!targetPlaceholder) return;
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  likedRecipesContainer.classList.add("flex");
  likedRecipesContainer.addEventListener("click", selectRecipe);
};

//
//
//
//
//
//
//
//
//
const dragMealTouch = function (e) {
  e.preventDefault();
  //handles all it takes to enable drag and drop for meal components
  const targetIsMealComponent = e.target.closest(".meal-component");
  if (!targetIsMealComponent) return;

  const targetIsMealPlaceholder = e.target
    .closest(".meal-component")
    .classList.contains("meal-placeholder");
  if (targetIsMealPlaceholder) return;

  const clickedRecipe = e.target.closest(".meal-component");
  const clickedRecipeStyles = window.getComputedStyle(clickedRecipe);
  let shiftX =
    e.changedTouches[0].clientX - clickedRecipe.getBoundingClientRect().left;
  let shiftY =
    e.changedTouches[0].clientY - clickedRecipe.getBoundingClientRect().top;
  let recipeContainer;
  let recipeClone;
  let draggedMealClass;
  let elemBelow;

  const updateElemBelow = function (event) {
    //gets the element below the clone we moving with the pointer
    recipeClone.style.display = "none";
    elemBelow = document.elementFromPoint(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY
    );
    recipeClone.style.display = "";
  };

  const updateClonePosition = function (event) {
    //makes the clone follow the pointer
    console.log(event);
    recipeClone.style.top = `${
      parseInt(event.changedTouches[0].pageY) - parseInt(shiftY)
    }px`;
    recipeClone.style.left = `${
      parseInt(event.changedTouches[0].pageX) - parseInt(shiftX)
    }px`;
    console.log(
      `${parseInt(event.changedTouches[0].pageY) - parseInt(shiftY)}px`,
      `${parseInt(event.changedTouches[0].pageX) - parseInt(shiftX)}px`
    );
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
    // document.removeEventListener("pointermove", updateClonePosition);
    console.log("dropped");
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

    document.removeEventListener("touchend", handleDrop);
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

  document.addEventListener("touchmove", updateClonePosition);
  document.addEventListener("touchend", handleDrop);
};

const addEventListeners = function () {
  const chosenRecipesContainer = document.querySelector(
    ".chosen-meal-component-wrapper"
  );
  // chosenRecipesContainer.addEventListener("pointerdown", dragMeal);
  chosenRecipesContainer.addEventListener("pointerdown", dragMeal);
  // chosenRecipesContainer.addEventListener("touchstart", dragMeal);
  const chooseWeekBtn = document.querySelector(".current-week");
  chooseWeekBtn.addEventListener("click", handleWeeksWindowDisplay);
  const weeksWindow = document.querySelector(".available-weeks");
  weeksWindow.addEventListener("click", handleWeekChange);
  const calendarComponent = document.querySelector(".calendar-component");
  calendarComponent.addEventListener("click", handleWeekdayClick);
  const saveBtn = document.querySelector(".chosen-meal-btns__btn__save");
  saveBtn.addEventListener("click", handleSaveBtnClick);
  const resetBtn = document.querySelector(".chosen-meal-btns__btn__reset");
  resetBtn.addEventListener("click", resetPlanMeals);
  const firstBreadcrumb = document.querySelector(".breadcrumb__first");
  const secondBreadcrumb = document.querySelector(".breadcrumb__second");
  firstBreadcrumb.addEventListener("click", handleBreadcrumbsClick);
  secondBreadcrumb.addEventListener("click", handleBreadcrumbsClick);
  window.addEventListener("resize", debounce(handleViewportResize));
  const mealPlaceholdersContainer = document.querySelector(
    ".chosen-meal-component-wrapper"
  );
  mealPlaceholdersContainer.addEventListener("click", openLikedRecipesWindow);
};
// addEventListeners();
const handleViewportResize = function () {
  const viewportWidth = window.innerWidth;
  if (viewportWidth >= 1000 || (viewportWidth >= 500 && viewportWidth <= 700)) {
    const mealComponents = document.querySelectorAll(".chosen-meal-component");
    mealComponents.forEach((mealComponent) => {
      mealComponent.classList.add("flex");
      mealComponent.classList.remove("hidden");
      mealComponent.classList.remove("flex");
    });
  }
  const likedRecipesContainer = document.querySelector(".liked-recipes");
  if (viewportWidth >= 700) {
    likedRecipesContainer.addEventListener("pointerdown", dragMeal);
    // likedRecipesContainer.addEventListener("touchstart", dragMeal);
  } else {
    likedRecipesContainer.removeEventListener("pointerdown", dragMeal``);
    // likedRecipesContainer.removeEventListener("touchstart", dragMeal);
  }
};

handleViewportResize();
// const handleStart = () => {
//   console.log("start");
// };
// const handleEnd = () => {
//   console.log("end");
// };
// const handleCancel = () => {
//   console.log("cancel");
// };
// const handleMove = () => {
//   console.log("move");
// };
// document.addEventListener("touchstart", handleStart);
// document.addEventListener("touchend", handleEnd);
// document.addEventListener("touchcancel", handleCancel);
// document.addEventListener("touchmove", handleMove);
