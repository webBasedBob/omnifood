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
let user;
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
const hasCustomRole = async function (user, role) {
  const token = await user.getIdTokenResult();
  return token.claims[role];
};
const displayNotAuthorizedScreen = function (role) {
  const notAutorizedContainer = document.querySelector(".not-logged-in-screen");
  notAutorizedContainer.innerHTML = `<h3>Access denied</h3>
  <p>You need to be an ${toTitleCase(role)} to access this page</p>`;
  displayNotLoggedInScreen();
};
onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    user = curUser;
    if (await hasCustomRole(curUser, "admin")) {
      await getUsersFromFirebase();
      renderUsers(usersArr);
      displayPageContent();
    } else {
      displayNotAuthorizedScreen("admin");
      hidePageContent();
    }
  } else {
    displayNotLoggedInScreen();
    hidePageContent();
  }
});

const getUsersFromFirebase = async function () {
  const retrieveAllUsers = httpsCallable(functions, "listAllUsers");
  let usersData = await retrieveAllUsers();
  usersArr = usersData.data;
  return usersData.data;
};

const renderUsers = function (usersArray) {
  const usersContainter = document.querySelector(".users-table__body");
  usersContainter.innerHTML = "";
  const optionsIcon = `<svg name="ellipsis-horizontal" class="icon options-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
</svg>
`;
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
          user.customClaims && Object.keys(user.customClaims).length > 0
            ? toTitleCase(Object.keys(user.customClaims)[0])
            : "Basic"
        }</p>
      </td>
      <td class="users-table__body__row__options">
        ${optionsIcon}
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

const findUsersByEmail = function (email, usersArr) {
  const searchingRegEx = new RegExp(email.toLowerCase());
  const foundUsersArr = usersArr.filter((user) => {
    return user.email.toLowerCase().match(searchingRegEx);
  });
  return foundUsersArr;
};

const selectAllUsers = function () {
  const checkboxes = document.querySelectorAll(
    `.users-table__body input[type="checkbox"]`
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });
};
// selectAllUsers();
const deselectAllUsers = function () {
  const checkboxes = document.querySelectorAll(
    `.users-table__body input[type="checkbox"]`
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
};

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

const handleClosingOptionsModal = function (userOptionsClass) {
  const optionsContainer = document.querySelector(`.${userOptionsClass}`);
  const closeOptionsWindow = function () {
    optionsContainer.classList.add("hidden");
  };
  const closeOnOutsideClick = function (e) {
    if (
      e.target.closest(`.${userOptionsClass}`) ||
      (userOptionsClass === "more-actions__single-user"
        ? e.target.closest(".users-table__body__row__options")
        : e.target.closest(`.bulk-actions-btn`))
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
  document.addEventListener("click", closeOnOutsideClick);
  exitViewportObserver.observe(optionsContainer);
};

const userOptionsUIManipulation = function (e) {
  if (e.target.tagName !== "svg") return;

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
  optionsContainer.classList.remove("hidden");
  placeUserOptions(e.target.getBoundingClientRect());
  contentContainer.addEventListener("scroll", changePositionBasedOnScroll);
  observeClassChange.observe(optionsContainer, { attributes: true });
  handleClosingOptionsModal("more-actions__single-user");
};

const userActionOptions = {
  async delete() {
    try {
      const deleteUserFromFirebase = httpsCallable(
        functions,
        "deleteUserAccount"
      );
      const successMessage = await deleteUserFromFirebase(
        moreOptionsTargetEmail
      );
      return successMessage;
    } catch (err) {
      console.error(err);
    } finally {
      renderUsers(await getUsersFromFirebase());
    }
  },
  async assignRole(role, email) {
    try {
      const assignRoleFirebase = httpsCallable(
        functions,
        `add${toTitleCase(role)}Role`
      );
      let responseMessage = await assignRoleFirebase(email);
      return responseMessage;
    } catch (error) {
      console.error(error);
    } finally {
      renderUsers(await getUsersFromFirebase());
    }
  },
  admin() {
    this.assignRole.call(null, "admin", moreOptionsTargetEmail);
  },
  recruiter() {
    this.assignRole.call(null, "recruiter", moreOptionsTargetEmail);
  },
  subscriber() {
    this.assignRole.call(null, "subscriber", moreOptionsTargetEmail);
  },
  async remove() {
    try {
      const removeUsersRolesFirebase = httpsCallable(functions, "removeRoles");
      const successMessage = await removeUsersRolesFirebase(
        moreOptionsTargetEmail
      );
      return successMessage;
    } catch (err) {
      console.error(err);
    } finally {
      renderUsers(await getUsersFromFirebase());
    }
  },
};

const handleUserOptions = async function (e) {
  if (e.target.tagName !== "P") return;

  const actionToTake = e.target.dataset.action;
  userActionOptions[actionToTake]();
};
const toggleBulkOptionsWindow = function () {
  const bulkOptionsWindow = document.querySelector(".more-actions__bulk");
  bulkOptionsWindow.classList.toggle("hidden");
  handleClosingOptionsModal("more-actions__bulk");
};

const handleBulkActions = function (e) {
  if (e.target.tagName !== "P") return;

  const actionToTake = e.target.dataset.action;
  const tableRows = Array.from(
    document.querySelectorAll(".users-table__body__row")
  );
  const checkedRows = tableRows.filter((row) => {
    return row.children[0].children[0].checked;
  });
  if (actionToTake !== "export") {
    const emails = checkedRows.map((row) => {
      return row.children[1].children[0].innerText;
    });
    emails.forEach((email) => {
      moreOptionsTargetEmail = email;
      userActionOptions[actionToTake]();
    });
  } else {
    const data = checkedRows.map((row) => {
      return [
        row.children[1].children[0].innerText,
        row.children[2].children[0].innerText,
      ];
    });
    exportToCsv("Omnifood_Accounts.csv", data);
  }
};

function exportToCsv(filename, rows) {
  const processRow = function (row) {
    let finalVal = "";
    row.forEach((rowSubElm, index) => {
      const innerValue = rowSubElm === null ? "" : rowSubElm.toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (index > 0) finalVal += ",";
      finalVal += result;
    });
    return finalVal + "\n";
  };

  let csvFile = "";
  rows.forEach((row) => {
    csvFile += processRow(row);
  });

  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
const selectAllHandler = function (e) {
  if (e.target.checked) selectAllUsers();
  else deselectAllUsers();
};

const userSearch = function (e) {
  e.preventDefault();
  const email = document.querySelector(".search-bar__text-input").value;
  renderUsers(findUsersByEmail(email, usersArr));
};

const handleUserSort = function (e) {
  const sortingCriterion = e.target
    .closest(".sort-arrows")
    .classList.contains("sort-arrows__email")
    ? "email"
    : "role";
  /////////get here and make them work properly
  const relevantArrowsForCriterion = Array.from(
    document.querySelectorAll(`.sort-arrows__${sortingCriterion} *`)
  );
  const activeArrow = relevantArrowsForCriterion.filter((arrow) => {
    return arrow.classList.contains("active");
  });
  let direction = "ascending";
  if (
    activeArrow[0] &&
    activeArrow[0].classList.contains("sort-arrow__ascending")
  ) {
    direction = "descending";
  }
  sortUsers(sortingCriterion, direction);
  const allSortingArrows = document.querySelectorAll(".sort-arrow");
  allSortingArrows.forEach((arrow) => {
    arrow.classList.remove("active");
  });
  const targetArrow = document.querySelector(
    `.sort-arrows__${sortingCriterion} .sort-arrow__${direction}`
  );
  targetArrow.classList.add("active");
};

const addEventListeners = function () {
  const table = document.querySelector(".users-table");
  table.addEventListener("click", userOptionsUIManipulation);
  const userOptionsWindow = document.querySelector(
    ".more-actions__single-user"
  );
  userOptionsWindow.addEventListener("click", handleUserOptions);
  const bulkActionBtn = document.querySelector(".bulk-actions-btn");
  bulkActionBtn.addEventListener("click", toggleBulkOptionsWindow);
  const bulkOptionsWindow = document.querySelector(".more-actions__bulk");
  bulkOptionsWindow.addEventListener("click", handleBulkActions);
  const selectAllBtn = document.querySelector(".select-all__toggler__checkbox");
  selectAllBtn.addEventListener("click", selectAllHandler);
  const searchForm = document.querySelector(".search-bar");
  searchForm.addEventListener("submit", userSearch);
  const sortBtns = document.querySelectorAll(".sort-component");
  sortBtns.forEach((btn) => btn.addEventListener("click", handleUserSort));
};
addEventListeners();
