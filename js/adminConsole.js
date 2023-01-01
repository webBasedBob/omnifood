import { toTitleCase } from "./reusableFunctions.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

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
let usersArr;
const functions = getFunctions();
// let user;
const hidePageContent = function () {
  const pageContent = [document.querySelector(".page-layout")];
  pageContent.forEach((section) => {
    section.classList.add("hidden");
  });
};

const displayPageContent = function () {
  const pageContent = [document.querySelector(".page-layout")];
  pageContent.forEach((section) => {
    section.classList.remove("hidden");
  });
};
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
const getUsersFromFirebase = async function () {
  const retrieveAllUsers = httpsCallable(functions, "listAllUsers");
  let usersData = await retrieveAllUsers();
  usersArr = usersData.data;
};

const renderUsers = function (usersArray) {
  const usersContainter = document.querySelector(".users-table__body");
  usersContainter.innerHTML = "";
  usersArray.forEach((user) => {
    const html = `
    <tr class="users-table__body__row">
      <td class="users-table__body__row__data">
        <input type="checkbox" id="select-${user.email}"/>
      </td>
      <td class="users-table__body__row__data">
      <label for="select-${user.email}">${user.email}</label>
      </td>
      <td class="users-table__body__row__data">
        <p>${
          Object.keys(user.customClaims).length > 0
            ? toTitleCase(Object.keys(user.customClaims)[0])
            : "Basic"
        }</p>
      </td>
      <td class="users-table__body__row__options">
        <ion-icon name="ellipsis-horizontal"></ion-icon>
      </td>
    </tr>`;
    usersContainter.insertAdjacentHTML("beforeend", html);
  });
};

const sortUsers = function (sortBy, direction) {
  const usersContainter = document.querySelector(".users-table__body");
  const userTableRows = Array.from(usersContainter.children);
  const childNumber = sortBy === "email" ? 1 : 2;
  userTableRows.sort((userA, userB) => {
    const userAText =
      userA.children[childNumber].children[0].innerText.toUpperCase();
    const userBText =
      userB.children[childNumber].children[0].innerText.toUpperCase();
    if (direction === "ascending") {
      if (userAText < userBText) return -1;
      if (userAText > userBText) return 1;
      if (userAText === userBText) return 0;
    } else {
      if (userAText < userBText) return 1;
      if (userAText > userBText) return -1;
      if (userAText === userBText) return 0;
    }
  });
  userTableRows.forEach((tableRow) => usersContainter.append(tableRow));
};

// sortUsers("type", "ascending");
const findUsersByEmail = function (email, usersArr) {
  const searchingRegEx = new RegExp(email.toLowerCase());
  const foundUsersArr = usersArr.filter((user) => {
    return user.email.toLowerCase().match(searchingRegEx);
  });
  return foundUsersArr;
};

const search = function () {
  const email = document.querySelector(".search-bar__text-input").value;
  renderUsers(findUsersByEmail(email, usersArr));
};

const deleteUser = async function (email) {
  try {
    const deleteUserFromFirebase = httpsCallable(
      functions,
      "deleteUserAccount"
    );
    const successMessage = await deleteUserFromFirebase(email);
    return successMessage;
  } catch (err) {
    console.error(err);
  }
};

const selectAllUsers = function () {
  const checklists = document.querySelectorAll(
    `.users-table__body input[type="checkbox"`
  );
  checklists.forEach((checklist) => {
    checklist.checked = true;
  });
};
// selectAllUsers();
const deselectAllUsers = function () {
  const checklists = document.querySelectorAll(
    `.users-table__body input[type="checkbox"`
  );
  checklists.forEach((checklist) => {
    checklist.checked = false;
  });
};
// deselectAllUsers();

let moreOptionsTargetEmail;

const placeUserOptions = function (coords) {
  const optionsContainer = document.querySelector(".more-actions__single-user");
  const optionsContainerStyle = window.getComputedStyle(optionsContainer);
  const optionsOverflowViewport =
    coords.y + parseInt(optionsContainerStyle.height) > window.innerHeight - 40;
  const left = `${
    coords.x - parseInt(optionsContainerStyle.width) + coords.width + 10
  }px`;
  const top = optionsOverflowViewport
    ? `${coords.y - parseInt(optionsContainerStyle.height) * 2}px`
    : `${coords.y - parseInt(optionsContainerStyle.height) + coords.height}px`;
  optionsContainer.style.left = left;
  optionsContainer.style.top = top;
  if (optionsOverflowViewport) {
    optionsContainer.classList.add("upside-down");
  } else {
    optionsContainer.classList.remove("upside-down");
  }
};

const userOptionsUIManipulation = function (e) {
  if (e.target.tagName !== "ION-ICON") return;

  const optionsContainer = document.querySelector(".more-actions__single-user");
  const contentContainer = document.querySelector(".content-area");
  moreOptionsTargetEmail =
    e.target.closest("tr").children[1].children[0].innerText;

  const changePositionBasedOnScroll = function () {
    placeUserOptions(e.target.getBoundingClientRect());
  };

  const removeScrollEvent = function () {
    contentContainer.removeEventListener("scroll", changePositionBasedOnScroll);
  };

  const closeOptionsWindow = function () {
    optionsContainer.classList.add("hidden");
  };

  const observeClassChange = new MutationObserver((mutations) => {
    if (
      mutations.some((mutation) => {
        return mutation.attributeName == "class";
      })
    ) {
      if (!optionsContainer.classList.contains("hidden")) {
        return;
      }
      removeScrollEvent();
      observeClassChange.disconnect();
    }
  });

  const closeOnOutsideClick = function (e) {
    if (
      e.target.closest(".more-actions__single-user") ||
      e.target.closest(".users-table__body__row__options")
    )
      return;
    closeOptionsWindow();
    document.removeEventListener("click", closeOnOutsideClick);
  };

  const observerOptions = {
    root: null,
    rootMargin: "-100px 0px 0px 0px",
    threshold: 1,
  };

  const observerCallback = function (entries, observer) {
    if (entries[0].isIntersecting) return;
    closeOptionsWindow();
  };

  const exitViewportObserver = new IntersectionObserver(
    observerCallback,
    observerOptions
  );

  optionsContainer.classList.remove("hidden");
  placeUserOptions(e.target.getBoundingClientRect());
  contentContainer.addEventListener("scroll", changePositionBasedOnScroll);
  observeClassChange.observe(optionsContainer, { attributes: true });
  document.addEventListener("click", closeOnOutsideClick);
  exitViewportObserver.observe(optionsContainer);
};

const addEventListeners = function () {
  const table = document.querySelector(".users-table");
  table.addEventListener("click", userOptionsUIManipulation);
};
addEventListeners();
