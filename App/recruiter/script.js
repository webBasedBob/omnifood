import {
  toTitleCase,
  hidePageContent,
  displayPageContent,
  displayNotLoggedInScreen,
  hasCustomRole,
  displayNotAuthorizedScreen,
} from "../general/js/reusableFunctions.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import Notification from "../general/components/notification/script.js";
import Navigation from "../general/components/navigation/script.js";
import AuthModal from "../general/components/authModal/script.js";
import { globalEventsHandler } from "../general/js/crossSiteFunctionality.js";
import Loader from "../general/components/loader/script.js";
document.addEventListener("click", globalEventsHandler);
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
let jobsArr;
const functions = getFunctions();
let job;
let user;
Loader.display();
onAuthStateChanged(auth, async (currUser) => {
  if (currUser) {
    Loader.display();
    user = currUser;
    if (
      (await hasCustomRole(currUser, "admin")) ||
      (await hasCustomRole(currUser, "recruiter"))
    ) {
      let jobs = await pula();
      renderJobs(jobs);
      displayPageContent();
      Loader.hide();
    } else {
      displayNotAuthorizedScreen("admin/recruiter");
      hidePageContent();
      Loader.hide();
    }
  } else {
    displayNotLoggedInScreen();
    hidePageContent();
    Loader.hide();
  }
});
let jobs = [];
const db = getDatabase(app);
const jobsRef = ref(db, "jobOpenings");
const pula = async function () {
  return new Promise((resolve, reject) => {
    onValue(jobsRef, (snapshot) => {
      let responseData = snapshot.val();
      jobs = [];
      for (let jobId in responseData) {
        jobs.push({ [jobId]: responseData[jobId] });
      }
      resolve(jobs);
    });
  });
};

const renderJobs = function (jobsArr) {
  const jobsContainer = document.querySelector(".jobs-table__body");
  jobsContainer.innerHTML = "";
  const optionsIcon = `<svg name="ellipsis-horizontal" class="icon options-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
</svg>
`;
  jobsArr.forEach((jobObj) => {
    let job = jobObj[Object.keys(jobObj)[0]];
    const html = `
    <tr class="jobs-table__body__row">
      <td class="jobs-table__body__row__data">
        <input type="checkbox" id="select-${job.title}"/>
      </td>
      <td class="jobs-table__body__row__data">
      <label for="select-${job.title}">${toTitleCase(job.title)}</label>
      </td>
      <td class="jobs-table__body__row__data">
        <p>${Object.keys(jobObj)[0]}</p>
      </td>
      <td class="jobs-table__body__row__">
        <p>${toTitleCase(job.status)}</p>
      </td>
      <td class="jobs-table__body__row__options">
        <p>${job.applicants ? job.applicants : 0}</p>
      </td>
      <td class="jobs-table__body__row__options">
        ${optionsIcon}
      </td>
    </tr>`;
    jobsContainer.insertAdjacentHTML("beforeend", html);
  });
};

const sortJobs = function (sortBy, direction) {
  const jobsContainer = document.querySelector(".jobs-table__body");
  const jobTableRows = Array.from(jobsContainer.children);
  const sortingCriterionColllection = {
    title: 1,
    jobid: 2,
    status: 3,
    applicants: 4,
  };
  const childNumber = sortingCriterionColllection[sortBy];
  jobTableRows.sort((jobA, jobB) => {
    const jobAText =
      jobA.children[childNumber].children[0].innerText.toUpperCase();
    const jobBText =
      jobB.children[childNumber].children[0].innerText.toUpperCase();

    if (direction === "ascending") {
      if (jobAText < jobBText) return -1;
      if (jobAText > jobBText) return 1;
      if (jobAText === jobBText) return 0;
    } else {
      if (jobAText < jobBText) return 1;
      if (jobAText > jobBText) return -1;
      if (jobAText === jobBText) return 0;
    }
  });
  jobTableRows.forEach((tableRow) => jobsContainer.append(tableRow));
};

const searchInJobs = function (searchIn, searchFor, jobs) {
  const filteredJobs = jobs.filter((jobObj) => {
    let job;
    if (searchIn === "jobid") {
      job = jobObj[Object.keys(jobObj)[0]];
      job.jobid = Object.keys(jobObj)[0];
    } else {
      job = jobObj[Object.keys(jobObj)[0]];
    }
    const searchingRegEx = new RegExp(searchFor.toLowerCase());
    return job[searchIn].toLowerCase().match(searchingRegEx);
  });
  return filteredJobs;
};

const selectAlljobs = function () {
  const checkboxes = document.querySelectorAll(
    `.jobs-table__body input[type="checkbox"]`
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });
};
// selectAlljobs();
const deselectAlljobs = function () {
  const checkboxes = document.querySelectorAll(
    `.jobs-table__body input[type="checkbox"]`
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
};

let moreOptionsTargetEmail;

const placeJobOptions = function (coords) {
  const optionsContainer = document.querySelector(".more-actions__single-job");
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

const handleClosingOptionsModal = function (jobOptionsClass) {
  const optionsContainer = document.querySelector(`.${jobOptionsClass}`);
  const closeOptionsWindow = function () {
    optionsContainer.classList.add("hidden");
  };
  const closeOnOutsideClick = function (e) {
    if (
      e.target.closest(`.${jobOptionsClass}`) ||
      (jobOptionsClass === "more-actions__single-job"
        ? e.target.closest(".jobs-table__body__row__options")
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

const jobOptionsUIManipulation = function (e) {
  if (e.target.tagName !== "svg") return;

  const optionsContainer = document.querySelector(".more-actions__single-job");
  const contentContainer = document.querySelector(".content-area");
  moreOptionsTargetEmail =
    e.target.closest("tr").children[2].children[0].innerText;
  const changePositionBasedOnScroll = function () {
    placeJobOptions(e.target.getBoundingClientRect());
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
  placeJobOptions(e.target.getBoundingClientRect());
  contentContainer.addEventListener("scroll", changePositionBasedOnScroll);
  observeClassChange.observe(optionsContainer, { attributes: true });
  handleClosingOptionsModal("more-actions__single-job");
};

const jobActionOptions = {
  async active() {
    try {
      const db = getDatabase(app);
      const jobRef = ref(db, `jobOpenings/${moreOptionsTargetEmail}/status`);
      set(jobRef, "active");
    } catch (err) {
      console.error(err);
    } finally {
      if (actionType === "single") {
        await pula();
        renderJobs(jobs);
      }
    }
  },
  async inactive() {
    try {
      const db = getDatabase(app);
      const jobRef = ref(db, `jobOpenings/${moreOptionsTargetEmail}/status`);
      set(jobRef, "inactive");
    } catch (err) {
      console.error(err);
    } finally {
      if (actionType === "single") {
        await pula();
        renderJobs(jobs);
      }
    }
  },
  async reset() {
    try {
      const db = getDatabase(app);
      const jobRef = ref(
        db,
        `jobOpenings/${moreOptionsTargetEmail}/applicants`
      );
      set(jobRef, 0);
    } catch (err) {
      console.error(err);
    } finally {
      if (actionType === "single") {
        await pula();
        renderJobs(jobs);
      }
    }
  },
  async delete() {
    try {
      const db = getDatabase(app);
      const jobRef = ref(db, `jobOpenings/${moreOptionsTargetEmail}`);
      set(jobRef, null);
    } catch (err) {
      console.error(err);
    } finally {
      if (actionType === "single") {
        await pula();
        renderJobs(jobs);
      }
    }
  },
};
let actionType;
const handleJobOptions = async function (e) {
  if (e.target.tagName !== "P") return;

  actionType = "single";
  const actionToTake = e.target.dataset.action;
  jobActionOptions[actionToTake]();
};
const toggleBulkOptionsWindow = function () {
  const bulkOptionsWindow = document.querySelector(".more-actions__bulk");
  bulkOptionsWindow.classList.toggle("hidden");
  handleClosingOptionsModal("more-actions__bulk");
};

const handleBulkActions = function (e) {
  if (e.target.tagName !== "P") return;

  actionType = "bulk";
  const actionToTake = e.target.dataset.action;
  const tableRows = Array.from(
    document.querySelectorAll(".jobs-table__body__row")
  );
  const checkedRows = tableRows.filter((row) => {
    return row.children[0].children[0].checked;
  });
  const emails = checkedRows.map((row) => {
    return row.children[2].children[0].innerText;
  });
  emails.forEach((email) => {
    moreOptionsTargetEmail = email;
    jobActionOptions[actionToTake]();
  });
};

// function exportToCsv(filename, rows) {
//   const processRow = function (row) {
//     let finalVal = "";
//     row.forEach((rowSubElm, index) => {
//       const innerValue = rowSubElm === null ? "" : rowSubElm.toString();
//       let result = innerValue.replace(/"/g, '""');
//       if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
//       if (index > 0) finalVal += ",";
//       finalVal += result;
//     });
//     return finalVal + "\n";
//   };

//   let csvFile = "";
//   rows.forEach((row) => {
//     csvFile += processRow(row);
//   });

//   const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
//   if (navigator.msSaveBlob) {
//     navigator.msSaveBlob(blob, filename);
//   } else {
//     const link = document.createElement("a");
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", filename);
//       link.style.visibility = "hidden";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   }
// }
const selectAllHandler = function (e) {
  if (e.target.checked) selectAlljobs();
  else deselectAlljobs();
};

const jobsearch = function (e) {
  e.preventDefault();
  const keyword = document.querySelector(".search-bar__text-input").value;
  renderJobs(searchInJobs("title", keyword, jobs));
};

const handlejobsort = function (e) {
  const targetClass = e.target
    .closest(".sort-component")
    .querySelector(".sort-arrows").classList[1];
  targetClass.slice(targetClass.lastIndexOf("_") + 1);
  const sortingCriterion = targetClass.slice(targetClass.lastIndexOf("_") + 1);
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
  sortJobs(sortingCriterion, direction);
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
  const table = document.querySelector(".jobs-table");
  table.addEventListener("click", jobOptionsUIManipulation);
  const jobOptionsWindow = document.querySelector(".more-actions__single-job");
  jobOptionsWindow.addEventListener("click", handleJobOptions);
  const bulkActionBtn = document.querySelector(".bulk-actions-btn");
  bulkActionBtn.addEventListener("click", toggleBulkOptionsWindow);
  const bulkOptionsWindow = document.querySelector(".more-actions__bulk");
  bulkOptionsWindow.addEventListener("click", handleBulkActions);
  const selectAllBtn = document.querySelector(".select-all__toggler__checkbox");
  selectAllBtn.addEventListener("click", selectAllHandler);
  const searchForm = document.querySelector(".search-bar");
  searchForm.addEventListener("submit", jobsearch);
  const sortBtns = document.querySelectorAll(".sort-component");
  sortBtns.forEach((btn) => btn.addEventListener("click", handlejobsort));
};
addEventListeners();
