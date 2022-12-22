// import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
// import { initializeApp } from "firebase/app";

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

import { toTitleCase } from "./reusableFunctions.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-functions.js";

const functions = getFunctions();
const retrieveAllUsers = httpsCallable(functions, "listAllUsers");

const renderAllUsers = async function () {
  const usersResponse = await retrieveAllUsers();
  const usersArray = usersResponse.data.users;
  console.log(usersArray);
  const usersContainter = document.querySelector(".users-table__body");
  usersArray.forEach((user) => {
    const html = `
    <tr class="users-table__body__row">
      <td class="users-table__body__row__data">
        <input type="checkbox" />
      </td>
      <td class="users-table__body__row__data">
        <p>${user.email}</p>
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
renderAllUsers();
