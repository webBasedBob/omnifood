// import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
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
// let user;
// onAuthStateChanged(auth, async (curUser) => {
//   if (curUser) {
//     // displayAccountConsole();
//     // hideAuthModal();
//     user = auth.currentUser;
//     console.log("logged in");
//     // renderUserInfo();
//     // displayLogOutBtn();
//     // console.log(user);
//     // console.log(await hasCustomRole("recruiter"));
//   } else {
//     // displayNotLoggedInScreen();
//     // hideLogOutBtn();
//   }
// });

import { toTitleCase } from "./reusableFunctions.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-functions.js";

let usersArr;
const functions = getFunctions();

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
