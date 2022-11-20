import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

let database = [];

const retrieveJobsFromFirebase = function () {
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
  const reference = ref(dbFirebase, "jobOpenings");
  onValue(reference, (snapshot) => {
    database = snapshot.val();
    addMissingData(database);
    // addJobMissingInfo(database);
  });
};

const toTitleCase = function (str) {
  const charArray = Array.from(str.trim().toLowerCase());
  const capitalizeNextCharacter = function (currentCharIndex) {
    const nextCharIndex = currentCharIndex + 1;
    charArray[nextCharIndex] = charArray[nextCharIndex].toUpperCase();
  };
  charArray[0] = charArray[0].toUpperCase();
  charArray.forEach((char, i) => {
    if (char === " ") capitalizeNextCharacter(i);
  });
  return charArray.join("");
};

const addMissingData = function (incompleteJobsArr) {
  incompleteJobsArr.forEach(
    (job) => (job.niceToHave = job.niceToHave ? job.niceToHave : [])
  );
};

// const addJobMissingInfo = function (jobsArray) {
//   const randomInt = function (min, max) {
//     const correctedMin = min - 1;
//     return Math.floor(Math.random() * (max - correctedMin) + min);
//   };
//   const generateDate = function () {
//     let newDateObj = new Date();
//     newDateObj.setDate(randomInt(1, 29));
//     newDateObj.setMonth(newDateObj.getMonth() - 1);
//     let options = {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return Intl.DateTimeFormat("default", options)
//       .format(newDateObj)
//       .replace(",", "");
//   };
//   const addIdDatePostedAndNiceToHaveReq = function (jobsArray) {
//     jobsArray.forEach((job) => {
//       job.publishingDateStr = generateDate();
//       job.ID = randomInt(10_000, 99_999);
//       job.niceToHave = job.niceToHave ? job.niceToHave : [];
//     });
//   };
//   addIdDatePostedAndNiceToHaveReq(jobsArray);
// };

const createSearchCriteria = function () {
  const firstPage = document.querySelector(".section-first-interaction");
  const searchInputField = firstPage.classList.contains("hidden")
    ? document.querySelector(".main-search-field")
    : document.querySelector(".first-interaction-search-field");
  const filtersCheckboxes = document.querySelectorAll(
    "input[type ='checkbox']"
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
  const result =
    keywordsArr.length === 1 ? keywordsArr[0] : keywordsArr.join("|");
  return new RegExp(result);
};
const filterDatabase = function (searchCriteriaObj) {
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
  const jobsFilteredByAllCriteria = jobsFilteredByKeywords.filter((job) => {
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

const createRelevanceScores = function (searchKeywords, rawDataBase) {
  // rawDataBase.forEach((job) => {
  //   job.relevancePoints = 0;
  // });
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

const displayJobResults = function (jobsArr) {
  const searchResultsContainer = document.querySelector(".search-results");
  searchResultsContainer.innerHTML = "";
  jobsArr.forEach((job) => {
    let html = `
    <div data-jobid = ${job.ID} data-relevancescore = ${
      job.relevancePoints
    } class="search-result">
    <img
    src="img/favicon.png"
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
          <ion-icon name="heart-outline"></ion-icon>
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
  numberOfResultsContainer.innerHTML = "";
  numberOfResultsContainer.insertAdjacentHTML(
    "afterbegin",
    `<strong>${noOfResults}</strong> ${
      noOfResults === 1 ? "result" : "results"
    }`
  );
};

const jobSearch = function () {
  const searchCriteria = createSearchCriteria();
  const resultRawData = filterDatabase(searchCriteria);
  const sortingCriterion =
    searchCriteria.keywords.length === 0 ? "date" : "relevance";
  createRelevanceScores(searchCriteria.keywords, resultRawData);
  displayJobResults(resultRawData);
  showNumberOfResults(resultRawData.length);
  sortResults(sortingCriterion);
  const firstPage = document.querySelector(".section-first-interaction");
  if (firstPage.classList.contains("hidden")) return;
  showMainPage();
  syncSearchInputField();
};

const showMainPage = function () {
  const firstFrame = document.querySelector(".section-first-interaction");
  const mainPage = document.querySelector(".section-main-content");
  firstFrame.classList.add("hidden");
  mainPage.classList.remove("hidden");
};

const sortResults = function (sortingCriterion) {
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

const buildExpandedResult = function (source, id) {
  const expandedResultContainer = document.querySelector(
    ".result-fully-displayed"
  );
  const resultToExpand = source.find((el) => el.ID == id);
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

const toggleVisibility = function () {
  const navigation = document.querySelector(".header");
  const expandedResult = document.querySelector(".result-fully-displayed");
  const searchPanel = document.querySelector(".search-panel");
  const filtersAndResults = document.querySelector(".filters-and-results");
  navigation.classList.toggle("hidden");
  searchPanel.classList.toggle("hidden");
  filtersAndResults.classList.toggle("hidden");
  expandedResult.classList.toggle("hidden");
};

// buildExpandedResult(database, database[4].ID);
const expandResult = function (e) {
  const logoWasClicked = e.target.classList.contains("result-omnifood-logo");
  const jobTitleWasClicked = e.target.classList.contains("overview-job-title");
  if (logoWasClicked || jobTitleWasClicked) {
    const id = e.target.closest(".search-result").dataset.jobid;
    buildExpandedResult(database, id);
    toggleVisibility();
  }
};

const resetFullDetailsWindow = function () {
  const elmToRemove = document.querySelector(".result-summary");
  elmToRemove.remove();
  const elmToEmptyOut = [
    document.querySelector(".full-screen-result-responsabilities"),
    document.querySelector(".full-screen-result-requirements-must-have"),
    document.querySelector(".full-screen-result-requirements-nice-to-have"),
  ];
  elmToEmptyOut.forEach((elm) => (elm.innerHTML = ""));
};
const closeExpandedResultWindow = function () {
  toggleVisibility();
  resetFullDetailsWindow();
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

//remove applied filters

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

// const pulamea = function () {
//   const firebaseConfig = {
//     apiKey: "AIzaSyCuCBob9JTkZveeOtZa2oRfLtZKf5aODek",
//     authDomain: "omnifood-custom-version.firebaseapp.com",
//     databaseURL:
//       "https://omnifood-custom-version-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "omnifood-custom-version",
//     storageBucket: "omnifood-custom-version.appspot.com",
//     messagingSenderId: "1094073505469",
//     appId: "1:1094073505469:web:92153bcbde9d51536f49d4",
//     measurementId: "G-1DT1EYNVPW",
//   };

//   const app = initializeApp(firebaseConfig);
//   const dbFirebase = getDatabase(app);
//   const reference = ref(dbFirebase, "jobOpenings");
//   set(reference, database);
//   console.log("pula mea");
// };
const addEventListeners = function () {
  const searchResultsContainer = document.querySelector(".search-results");
  const closeBtn = document.querySelector(".full-screen-close-btn");
  const mainSearchBtn = document.querySelector(".btn-search-main");
  const firstPageSearchBtn = document.querySelector(".btn-search");
  const filtersContainer = document.querySelector(".filters");
  const appliedFiltersContainer = document.querySelector(".applied-filters");
  const removeAllAppliedFiltersBtn = document.querySelector(".remove-filters");

  removeAllAppliedFiltersBtn.addEventListener("click", function () {
    removeAllAppliedFilters();
    jobSearch();
    // pulamea();
  });
  appliedFiltersContainer.addEventListener("click", function (e) {
    uncheckFilter(e);
    jobSearch(e);
  });

  filtersContainer.addEventListener("click", (e) => {
    if (e.target.localName == "input") {
      jobSearch();
      toggleAppliedFilterVisibility(e);
    }
  });
  mainSearchBtn.addEventListener("click", jobSearch);
  searchResultsContainer.addEventListener("click", expandResult);
  closeBtn.addEventListener("click", closeExpandedResultWindow);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") jobSearch();
  });
  firstPageSearchBtn.addEventListener("click", jobSearch);
};

retrieveJobsFromFirebase();
insertAppliedFiltersInHTML();
addEventListeners();
