import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import {
  toTitleCase,
  enableCarouselFunctionality,
  pulapulapizdapizda,
  displayNotification,
} from "../general/js/reusableFunctions.js";
import { storeUserResume } from "../general/js/firebaseStorageFunctions.js";

import {
  storeResumeNameOnly,
  getUserResumes,
} from "../general/js/liveDatabaseFunctions.js";
import { getAuth, linkWithRedirect, onAuthStateChanged } from "firebase/auth";
import Notification from "../general/components/notification/script.js";
import Navigation from "../general/components/navigation/script.js";
import AuthModal from "../general/components/authModal/script.js";

import { globalEventsHandler } from "../general/js/crossSiteFunctionality.js";

// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
// const storageRef = ref(storage, "ingredients/");

//
//firebase related code
//

let database = [];

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
const dbFirebase = getDatabase(app);

const auth = getAuth(app);

let user;
onAuthStateChanged(auth, async (curUser) => {
  if (curUser) {
    // displayPageContent();
    user = curUser;
  }
  //   evaluatedIngredients = (await getIngredients(curUser.uid)) || {};
  //   console.log(evaluatedIngredients);
  //   renderAllIngredients();
  //   renderFirebaseRecipes();
  //   await checkAgainstEvaluatedRecipes(curUser.uid, []);
  //   await getRecipesBasedOnUsersIngredients(curUser.uid);
  //   renderNextRecipeCard();
  // } else {
  //   displayNotLoggedInScreen();
  //   hidePageContent();
  // }
});

const addMissingData = function (incompleteJobs) {
  //nice to have skills section is empty for some of the jobs
  //firebase deletes the nodes with null/empty values
  //so I must init them to prevent later errors
  for (let jobId in incompleteJobs) {
    incompleteJobs[jobId].niceToHave = incompleteJobs[jobId].niceToHave
      ? incompleteJobs[jobId].niceToHave
      : [];
  }
};

const retrieveJobsFromFirebase = async function () {
  //gets the job data from firebase and stores it in global var database
  return new Promise((resolve, reject) => {
    const reference = ref(dbFirebase, "jobOpenings");
    onValue(reference, (snapshot) => {
      let responseData = snapshot.val();
      addMissingData(responseData);
      for (let job in responseData) {
        database.push({ [job]: responseData[job] });
      }
      resolve("");
    });
  });
};

//data manipulation code

const createRelevanceScores = function (searchKeywords, rawDataBase) {
  //creates the relevance scores when a search is executed,
  //they are based on the keywords inputed by user in search field,
  //so no keywords => no relevance scores
  //for every keyword found in a a job, the job gets some points
  // the points are added up in a final score
  const noKeywords = searchKeywords.length === 0;
  const databaseIsEmpty = rawDataBase.length === 0;
  if (noKeywords || databaseIsEmpty) return;
  const sectionPointsPairs = {
    title: 10_000,
    experience: 2000,
    location: 2000,
    requirements: 500,
    niceToHave: 350,
    responsabilities: 500,
    salary: 0,
  };
  searchKeywords.forEach((keyword) => {
    const keywordVariations = [
      keyword,
      keyword[0].toUpperCase() + keyword.slice(1),
      keyword.toUpperCase(),
    ];
    const regex = new RegExp(keywordVariations.join("|"));
    rawDataBase.forEach((job) => {
      let totalPoints = 0;
      for (let detail in job) {
        if (typeof job[detail] === "string") {
          if (job[detail].match(regex)) {
            totalPoints += sectionPointsPairs[detail];
          }
        } else {
          const stringElement = String(job[detail]);
          if (stringElement.match(regex)) {
            totalPoints += sectionPointsPairs[detail];
          }
        }
      }
      job.relevancePoints += totalPoints;
    });
  });
};

const getJobById = function (id) {
  const targetJob = database.find((elm) => {
    return Object.keys(elm)[0] === id;
  });
  return targetJob;
};
const createSearchCriteria = function () {
  //at every search execution this iterates through all relevant inputs (text and checkboxes)
  //and creates an object with all data (text inputs and the checked checkboxes)
  const firstPage = document.querySelector(".section-first-interaction");
  const searchInputField = firstPage.classList.contains("hidden")
    ? document.querySelector(".main-search-field")
    : document.querySelector(".first-interaction-search-field");
  const filtersCheckboxes = document.querySelectorAll(
    "filters input[type ='checkbox']"
  );
  const SearchCriteriaObj = {
    location: [],
    category: [],
    experience: [],
  };
  SearchCriteriaObj.keywords = searchInputField.value
    .toLowerCase()
    .trim()
    .split(" ")
    .filter((el) => el !== "");
  filtersCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const filterCategory = checkbox.id.slice(0, checkbox.id.indexOf("-"));
      const filterName = checkbox.name;
      SearchCriteriaObj[filterCategory].push(filterName);
    }
  });
  return SearchCriteriaObj;
};

const createKeywordsRegEx = function (keywordsArr) {
  //creates a regex from the text input from the user on search execution
  const result =
    keywordsArr.length === 1 ? keywordsArr[0] : keywordsArr.join("|");
  return new RegExp(result);
};
const filterDatabase = function (searchCriteriaObj) {
  //filters the database(jobs retrieved from firebase) based on search criteria object
  //a job entry gets into resulting array if :
  //it contains any of the search keywords inside it (title/body)
  //AND satisfies all the filters( eg location: remote, experience: mid-leve)

  const noSearchCriteria = Object.values(searchCriteriaObj).every(
    (value) => value.length == 0
  );
  if (noSearchCriteria) return database;
  let keywordsRegex = createKeywordsRegEx(searchCriteriaObj.keywords);
  const jobsFilteredByKeywords = database
    .map((job) => JSON.stringify(job))
    .filter((job) => job.toLowerCase().match(keywordsRegex))
    .map((job) => JSON.parse(job));
  //check if all filters are unckecked -
  const noFiltersToApply = Object.entries(searchCriteriaObj).every((value) => {
    if (value[0] == "keywords") return true;
    else return value[1].length == 0;
  });
  if (noFiltersToApply) return jobsFilteredByKeywords;
  const jobsArrayIsEmpty = jobsFilteredByKeywords.length == 0;
  if (jobsArrayIsEmpty) return;
  const jobsFilteredByAllCriteria = jobsFilteredByKeywords.filter((jobObj) => {
    let job = jobObj[Object.keys(jobObj)[0]];
    for (let criterion in searchCriteriaObj) {
      if (criterion == "keywords") continue;
      const criterionIsNotEmpty = searchCriteriaObj[criterion].length != 0;
      if (criterionIsNotEmpty) {
        const jobDoesNotMeetTheCriterion = !searchCriteriaObj[
          criterion
        ].includes(job[criterion]);
        if (jobDoesNotMeetTheCriterion) return false;
      }
    }
    return true;
  });
  return jobsFilteredByAllCriteria;
};

const jobSearch = function () {
  //puts together all the functions related to job search
  //(data search and UI renering, and manipulation)
  //sorts the results by relevance if keywords are present
  //otherwise , sort by date is executed
  const searchCriteria = createSearchCriteria();
  const resultRawData = filterDatabase(searchCriteria);
  const sortingCriterion =
    searchCriteria.keywords.length === 0 ? "date" : "relevance";
  createRelevanceScores(searchCriteria.keywords, resultRawData);
  renderJobResults(resultRawData);
  showNumberOfResults(resultRawData.length);
  sortResults(sortingCriterion);
  highlightSortingCriterion(sortingCriterion);
  const firstPage = document.querySelector(".section-first-interaction");
  if (firstPage.classList.contains("hidden")) return;
  showMainPage();
  syncSearchInputField();
};

const buildExpandedResult = function (resultToExpandObj) {
  //builds the job the user clicked on before the actual rendering
  //takes the id from dataset and gets the job from global database var based on it
  const resultToExpand = resultToExpandObj[Object.keys(resultToExpandObj)[0]];
  resultToExpand.jobId = Object.keys(resultToExpandObj)[0];
  const expandedResultContainer = document.querySelector(
    ".result-fully-displayed"
  );
  const experienceGlossary = {
    none: "No Experience",
    entry: "Entry-Level ( &lt; 2 years )",
    mid: "Mid-Level ( 2-5 years )",
    senior: "Senior ( &gt; 5 years )",
  };
  let resultSummaryHTML = `
        <div class="result-summary">
          <div class="date-posted-wrapper">
            <p>Job full details</p>
            <p>Posted on ${resultToExpand.publishingDateStr}</p>
          </div>
          <h1 class="full-screen-job-title">${toTitleCase(
            resultToExpand.title
          )}</h1>
          <div class="full-screen-salary">
            <ion-icon name="cash-outline"></ion-icon>
            <p><strong>${resultToExpand.salary.slice(
              0,
              resultToExpand.salary.indexOf("k") + 1
            )}</strong> / year</p>
          </div>
          <div class="full-screen-experience">
            <ion-icon name="briefcase-outline"></ion-icon>
            <p>${experienceGlossary[resultToExpand.experience]}</p>
          </div>
          <div class="full-screen-location">
            <ion-icon name="location-outline"></ion-icon>
            <p>${toTitleCase(resultToExpand.location)}</p>
          </div>
        </div>`;
  expandedResultContainer.insertAdjacentHTML("afterbegin", resultSummaryHTML);

  const addListItems = function (source, containerClass) {
    const listContainer = document.querySelector(containerClass);
    listContainer.innerHTML = "";
    source.forEach((listItem) => {
      let listItemHTML = `<li>${listItem}</li>`;
      listContainer.insertAdjacentHTML("afterbegin", listItemHTML);
    });
  };
  addListItems(
    resultToExpand.responsabilities,
    ".full-screen-result-responsabilities"
  );
  addListItems(
    resultToExpand.requirements,
    ".full-screen-result-requirements-must-have"
  );
  addListItems(
    resultToExpand.niceToHave,
    ".full-screen-result-requirements-nice-to-have"
  );
};

//
//UI related code
//
const showMainPage = function () {
  //displays the job results section after the first job search execution
  const firstFrame = document.querySelector(".section-first-interaction");
  const mainPage = document.querySelector(".section-main-content");
  firstFrame.classList.add("hidden");
  mainPage.classList.remove("hidden");
};

const filtersCarouselInit = function () {
  //on page load, the carousel's container is hodden,
  //so it can't be initialized, so i used mutation observer to listen for classchange
  //on container, and then init the carousel
  const targetElem = document.querySelector(".section-main-content");
  const callback = (mutationList, observer) => {
    for (let mutation of mutationList) {
      if (mutation.attributeName !== "class") return;
      enableCarouselFunctionality(
        "popular-filters-carousel",
        "filters-carousel-item",
        "filter-carousel-arr-left",
        "filter-carousel-arr-right"
      );
      observer.disconnect();
    }
  };
  const observer = new MutationObserver(callback);
  observer.observe(targetElem, { attributes: true });
};

const mobileNavFunctionality = function () {
  const btnNavEl = document.querySelector(".btn-mobile-nav");
  const headerEl = document.querySelector(".header");

  btnNavEl.addEventListener("click", function () {
    headerEl.classList.toggle("nav-open");
  });
};

const renderJobResults = function (jobsArr) {
  const searchResultsContainer = document.querySelector(".search-results");
  searchResultsContainer.innerHTML = "";
  const logoSrc =
    document.querySelector(".favicon__location").attributes.src.value;
  const heartIcon = `<svg class="icon" name="heart-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
</svg>
`;
  jobsArr.forEach((jobObj) => {
    let job = jobObj[Object.keys(jobObj)[0]];
    let html = `
    <div data-jobid = ${Object.keys(jobObj)[0]} data-relevancescore = ${
      job.relevancePoints
    } class="search-result">
    <img
    src= ${logoSrc}
    class="result-omnifood-logo"
    alt="omnifood logo"
    />  
    <div class="result-overview">
    <p class="overview-date-posted">${job.publishingDateStr}</p>
    <p class="overview-job-title">${toTitleCase(job.title)}</p>
    <p class="overview-salary">${job.salary.slice(
      0,
      job.salary.indexOf("k") + 1
    )}</p>
          <p class="overview-location">${toTitleCase(job.location)}</p>
          </div>
          <div class="result-buttons">
          <div class="save-job">
          ${heartIcon}
          <p>Save Job</p>
          </div>
          <button class="quick-apply">Quick apply</button>
          </div>
          </div>
          `;
    searchResultsContainer.insertAdjacentHTML("afterbegin", html);
  });
};

const syncSearchInputField = function () {
  const firstPageSearchField = document.querySelector(
    ".first-interaction-search-field"
  );
  const mainSearchField = document.querySelector(".main-search-field");
  mainSearchField.value = firstPageSearchField.value;
};

const showNumberOfResults = function (noOfResults) {
  const numberOfResultsContainer = document.querySelector(".results-number");
  const resultsNoPreviewMobileFilterSearchBtn = document.querySelector(
    ".mobile-filters-search-btn strong"
  );
  resultsNoPreviewMobileFilterSearchBtn.innerText = `${noOfResults}`;
  numberOfResultsContainer.innerHTML = "";
  numberOfResultsContainer.insertAdjacentHTML(
    "afterbegin",
    `<strong>${noOfResults}</strong> ${
      noOfResults === 1 ? "result" : "results"
    }`
  );
};

const sortResults = function (sortingCriterion) {
  //sorts the job results DOM elements based on one of 3 criteria
  const resultsContainer = document.querySelector(".search-results");
  const resultsArray = Array.from(document.querySelectorAll(".search-result"));
  const collectionOfSortingMethods = {
    relevance(a, b) {
      const aRelevance = a.dataset.relevancescore;
      const bRelevance = b.dataset.relevancescore;
      return bRelevance - aRelevance;
    },
    salary(a, b) {
      const aFullSalary = a.childNodes[3].childNodes[5].innerText;
      const bFullSalary = b.childNodes[3].childNodes[5].innerText;
      const aExtractedSalary = Number(
        aFullSalary.slice(2, aFullSalary.indexOf("-"))
      );
      const bExtractedSalary = Number(
        bFullSalary.slice(2, bFullSalary.indexOf("-"))
      );
      return bExtractedSalary - aExtractedSalary;
    },
    date(a, b) {
      const aDate = new Date(a.childNodes[3].childNodes[1].innerText);
      const bDate = new Date(b.childNodes[3].childNodes[1].innerText);
      return bDate - aDate;
    },
  };
  resultsArray.sort(collectionOfSortingMethods[sortingCriterion]);
  resultsArray.forEach((result) => resultsContainer.append(result));
};
const displayFullscreenJob = function () {
  const fullscreenJobContainer = document.querySelector(
    ".result-fully-displayed"
  );
  fullscreenJobContainer.classList.remove("hidden");
  const resultsContainer = document.querySelector(".section-main-content");
  resultsContainer.classList.add("hidden");
};

const openFullJobDetails = function (e) {
  //handles the user clicking on a job -> opens it in full screen
  if (e) {
    const logoWasClicked = e.target.classList.contains("result-omnifood-logo");
    const jobTitleWasClicked =
      e.target.classList.contains("overview-job-title");
    if (logoWasClicked || jobTitleWasClicked) {
      window.location.hash = e.target.closest(".search-result").dataset.jobid;
    }
  }
  const id = window.location.hash.slice(1);
  const targetJob = getJobById(id);
  if (!targetJob) return;
  buildExpandedResult(targetJob);
  displayFullscreenJob();
};

const closeFullScreenJob = function () {
  const expandedResultContainer = document.querySelector(
    ".result-fully-displayed"
  );
  expandedResultContainer.classList.add("hidden");
  const resultsContainer = document.querySelector(".section-main-content");
  resultsContainer.classList.remove("hidden");
  resetFullDetailsWindow();
  window.location.hash = "";
};

const resetFullDetailsWindow = function () {
  //full screen job container's feelds must be
  //emptied for it to be reusable for future job click
  const elmToRemove = document.querySelector(".result-summary");
  elmToRemove.remove();
  const elmToEmptyOut = [
    document.querySelector(".full-screen-result-responsabilities"),
    document.querySelector(".full-screen-result-requirements-must-have"),
    document.querySelector(".full-screen-result-requirements-nice-to-have"),
  ];
  elmToEmptyOut.forEach((elm) => (elm.innerHTML = ""));
};

const extractFilterLabel = function (source) {
  let labelMustBeCut = source.innerText.includes("(");
  let filterLabel = labelMustBeCut
    ? source.innerText.slice(0, source.innerText.indexOf("(") - 1)
    : source.innerText;
  return filterLabel;
};

const insertAppliedFiltersInHTML = function () {
  const appliedFiltersContainer = document.querySelector(".applied-filters");
  const filterLabels = document.querySelectorAll("label");
  filterLabels.forEach((label) => {
    const labelText = extractFilterLabel(label);
    let html = `<div class="applied-filter hidden">
                <p>${labelText}</p>
                <ion-icon
                  class="remove-filter"
                  name="close-outline"
                ></ion-icon>
              </div>`;
    appliedFiltersContainer.insertAdjacentHTML("afterbegin", html);
  });
};

const toggleAppliedFilterVisibility = function (e) {
  const targetText = e.target.nextElementSibling;
  const targetFilterLabel = extractFilterLabel(targetText);
  const allAppliedFiltersArray = Array.from(
    document.querySelectorAll(".applied-filter")
  );
  const targetFilter = allAppliedFiltersArray.find(
    (filter) => filter.children[0].innerText == targetFilterLabel
  );
  targetFilter.classList.toggle("hidden");
};

const uncheckFilter = function (e) {
  const removeFilterBtnIsNotClicked = e.target.localName !== "ion-icon";
  if (removeFilterBtnIsNotClicked) return;
  const allFiltersArray = Array.from(
    document.querySelectorAll(".individual-filter")
  );
  const filterToUncheck = allFiltersArray.find((filter) => {
    let filterLabel = extractFilterLabel(filter.children[1]);
    return filterLabel == e.target.previousElementSibling.innerText;
  });
  filterToUncheck.children[0].checked = false;
  e.target.closest(".applied-filter").classList.toggle("hidden");
};

const unhighlightCarouselFilters = function () {
  const filters = document.querySelectorAll(".filters-carousel-item");
  filters.forEach((filter) => {
    filter.classList.remove("selected");
  });
};

const highlightCarouselFilter = function (e) {
  const id = e.target.id;
  const filters = Array.from(
    document.querySelectorAll(".filters-carousel-item")
  );
  const filterToUnselect = filters.find(
    (filter) => filter.dataset.filterId === id
  );
  if (!filterToUnselect) return;
  filterToUnselect.classList.toggle("selected");
};

const removeAllAppliedFilters = function () {
  const allAppliedFilters = document.querySelectorAll(".applied-filter");
  const allFilterCheckboxes = document.querySelectorAll(
    "input[type ='checkbox']"
  );
  allAppliedFilters.forEach((appliedFilter) =>
    appliedFilter.classList.add("hidden")
  );
  allFilterCheckboxes.forEach((filter) => (filter.checked = false));
};
const handleMobileFiltersDisplay = function () {
  const searchResults = document.querySelector(".search-results");
  searchResults.classList.toggle("hidden");
  const mobileFiltersContainer = document.querySelector(".filters");
  mobileFiltersContainer.classList.toggle("flex");
};

const highlightSortingCriterion = function (sortingCriterion) {
  const sortCriteriaElms = Array.from(
    document.querySelectorAll(".sort-results button")
  );
  sortCriteriaElms.forEach((element) => {
    element.classList.remove("sort-active");
  });
  const elmToHighlight = sortCriteriaElms.find((elm) => {
    return elm.innerText.toLowerCase() === sortingCriterion;
  });
  elmToHighlight.classList.add("sort-active");
};

const handleJobResultClick = function (e) {
  if (e.target.tagName !== "BUTTON") {
    openFullJobDetails(e);
  } else {
    switchResumeModalVisibility();
  }
};

//
//
// upload resume modal code
//

const switchResumeModalVisibility = function (e) {
  if (e && e.target !== e.currentTarget) return;
  const modal = document.querySelector(".upload-resume__overlay");
  modal.classList.toggle("hidden");
  if (modal.classList.contains("hidden")) {
    document.body.style.height = "";
    resetModal();
  } else {
    renderUserResumes();
    document.body.style.height = "100vh";
  }
};

const switchUploadModalVisibility = function () {
  document.querySelector(".upload-resume").classList.toggle("hidden");
};
//
// Adding event listeners
//

const renderResumeComponent = function (resumeName, container) {
  const html = `
  <div class="resume">
    <div class="resume__icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>          
    </div>
    <p class="resume__name">${resumeName}</p>
  </div>
  `;
  container.insertAdjacentHTML("afterbegin", html);
};

let resumeToUpload;
const renderResumeUI = function (resumeFile) {
  resumeToUpload = resumeFile;
  const container = document.querySelector(".resume-container");
  container.innerHTML = "";
  renderResumeComponent(resumeToUpload.name, container);
};

const finishResumeUpload = function (e) {
  storeUserResume(user.uid, resumeToUpload);
  storeResumeNameOnly(user.uid, resumeToUpload.name);
  renderUserResumes();
  e.target.closest(".upload-resume").classList.add("hidden");
};

const renderUserResumes = async function () {
  const resumes = await getUserResumes(user.uid);
  const container = document.querySelector(".stored-resumes");
  container.innerHTML = "";
  for (let resume in resumes) {
    const resumeName = `${resume}.${resumes[resume]}`;
    renderResumeComponent(resumeName, container);
  }
};

const completeJobApplication = function (e) {
  //do the backend stuff
  const resume = e.target.closest(".resume");
  if (!resume) return;
  displayNotification("Application sent successfully");
  e.target.closest(".upload-resume__overlay").classList.add("hidden");
};

const handleResumeUpload = function (e) {
  const resumeFile = e.target.files[0];
  renderResumeUI(resumeFile);
};

const handleDragOver = (e) => {
  e.preventDefault();
  console.log(e);
  e.target.closest(".upload-resume").classList.add("drag-over");
};
const handleDragLeave = (e) => {
  e.preventDefault();
  if (
    e.relatedTarget &&
    !e.relatedTarget.classList.contains("upload-resume__overlay")
  )
    return;
  e.target.classList.add("drag-caca");
  setTimeout(() => {
    e.target.classList.remove("drag-over");
    e.target.classList.remove("drag-caca");
  }, 500);
};
const handleDrop = (e) => {
  e.preventDefault();
  handleDragLeave(e);
  renderResumeUI(e.dataTransfer.files[0]);
};

const resetModal = function () {
  const uploadModal = document.querySelector(".upload-resume");
  uploadModal.classList.add("hidden");
  uploadModal.querySelector(".resume-container").innerHTML = "";
};
const filtersSizeInfo = {};

const addEventListeners = function () {
  const searchResultsContainer = document.querySelector(".search-results");
  const mainSearchBtn = document.querySelector(".btn-search-main");
  const firstPageSearchBtn = document.querySelector(".btn-search");
  const filtersContainer = document.querySelector(".filters");
  const appliedFiltersContainer = document.querySelector(".applied-filters");
  const removeAllAppliedFiltersBtn = document.querySelector(".remove-filters");

  removeAllAppliedFiltersBtn.addEventListener("click", function () {
    removeAllAppliedFilters();
    jobSearch();
    unhighlightCarouselFilters();
  });
  appliedFiltersContainer.addEventListener("click", function (e) {
    uncheckFilter(e);
    jobSearch(e);
  });

  filtersContainer.addEventListener("click", (e) => {
    if (e.target.localName == "input") {
      jobSearch();
      toggleAppliedFilterVisibility(e);
      highlightCarouselFilter(e);
      return;
    }
    const filterExpanderArrow = e.target.closest(".filters-expander");
    if (!filterExpanderArrow) return;
    const filterContent =
      filterExpanderArrow.parentElement.parentElement.children[1];
    const filterName =
      filterExpanderArrow.parentElement.parentElement.children[0].children[0]
        .innerText;
    if (filterExpanderArrow.classList.contains("open")) {
      const height = parseInt(window.getComputedStyle(filterContent).height);
      filtersSizeInfo[filterName] = height;
      hideBySlidingDown(filterContent, 500);
      filterExpanderArrow.classList.remove("open");
    } else {
      displayBySlidingDown(filterContent, 500, filtersSizeInfo[filterName]);
      filterExpanderArrow.classList.add("open");
    }
    rotate180deg(filterExpanderArrow, 500);
  });

  const handleJobShare = async function () {
    try {
      const jobLink = window.location.href;
      await navigator.clipboard.writeText(jobLink);
      displayNotification("Link copied to clipboard");
    } catch (err) {
      console.error(err);
    }
  };

  mainSearchBtn.addEventListener("click", jobSearch);
  searchResultsContainer.addEventListener("click", handleJobResultClick);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") jobSearch();
  });
  firstPageSearchBtn.addEventListener("click", jobSearch);
  const mobileFiltersBtns = [
    document.querySelector(".show-mobile-filters-btn"),
    document.querySelector(".mobile-filters-close-btn"),
    document.querySelector(".mobile-filters-search-btn"),
  ];
  mobileFiltersBtns.forEach((btn) =>
    btn.addEventListener("click", handleMobileFiltersDisplay)
  );
  const sortContainer = document.querySelector(".sort-results");
  sortContainer.addEventListener("click", function (e) {
    if (e.target.localName !== "button") return;
    const sortingCriterion = e.target.innerText.toLowerCase();
    highlightSortingCriterion(sortingCriterion);
    sortResults(sortingCriterion);
  });
  const carousel = document.querySelector(".popular-filters-carousel");
  carousel.addEventListener("click", function (e) {
    if (e.target.localName !== "p") return;
    const id = e.target.dataset.filterId;
    const filter = document.querySelector(`#${id}`);
    filter.click();
  });
  const closeFullScreenJobBtn = document.querySelector(
    ".full-screen-nav-btns.close-btn"
  );

  closeFullScreenJobBtn.addEventListener("click", closeFullScreenJob);
  const shareJobBbtn = document.querySelector(
    ".full-screen-nav-btns.share-btn"
  );

  shareJobBbtn.addEventListener("click", handleJobShare);
  const resumeModalVisibilitySwitchers = [
    document.querySelector(".full-screen-apply-btn"),
    document.querySelector(".upload-resume__overlay"),
  ];
  resumeModalVisibilitySwitchers.forEach((elm) => {
    elm.addEventListener("click", switchResumeModalVisibility);
  });
  const openUploadModalBtn = document.querySelector(".open-upload-modal");
  openUploadModalBtn.addEventListener("click", switchUploadModalVisibility);
  const resumeUploadInputElm = document.querySelector("#resume_upload");
  resumeUploadInputElm.addEventListener("change", handleResumeUpload);
  const resumeUploadModal = document.querySelector(".upload-resume");
  resumeUploadModal.addEventListener("dragover", handleDragOver);
  resumeUploadModal.addEventListener("drop", handleDrop);
  resumeUploadModal.addEventListener("dragleave", handleDragLeave);
  const uploadResumeBtn = document.querySelector(".upload-resume__upload-btn");
  uploadResumeBtn.addEventListener("click", finishResumeUpload);
  const storedResumesContainer = document.querySelector(".stored-resumes");
  storedResumesContainer.addEventListener("click", completeJobApplication);
};

//
// actual function calls and their sequence
//
import Loader from "../general/components/loader/script";
const urlCheckForJobId = function () {
  if (!window.location.hash) return;
  const id = window.location.hash.slice(1);
  if (!getJobById(id)) return;
  openFullJobDetails(null, id);
  jobSearch();
  displayFullscreenJob();
};
const init = async function () {
  Loader.display();
  document.addEventListener("click", globalEventsHandler);
  await retrieveJobsFromFirebase();
  urlCheckForJobId();
  Loader.hide();
  filtersCarouselInit();
  mobileNavFunctionality();
  insertAppliedFiltersInHTML();
  addEventListeners();
};
init();

import {
  hideBySlidingDown,
  displayBySlidingDown,
  rotate180deg,
} from "../general/js/animations";
