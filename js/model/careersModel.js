import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

export const state = {
  jobsDatabase: [],
  jobResults: [],
  searchCriteria: {},
  ExpandedJobResultId: 0,
  sectionVisibleNow: "firstPage",
  sortingCriterion: "",
};

const getJobsFromServer = function () {
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
    state.jobsDatabase = snapshot.val();
    addMissingData(state.jobsDatabase);
  });
};
export const setSortingCriterion = function (criterion) {
  state.sortingCriterion = criterion;
};
const addMissingData = function (incompleteJobsArr) {
  incompleteJobsArr.forEach(
    (job) => (job.niceToHave = job.niceToHave ? job.niceToHave : [])
  );
};
const createKeywordsRegEx = function (keywordsArr) {
  const result =
    keywordsArr.length === 1 ? keywordsArr[0] : keywordsArr.join("|");
  return new RegExp(result);
};

const jobSearch = function () {
  const noSearchCriteria = Object.values(state.searchCriteria).every(
    (value) => value.length == 0
  );
  if (noSearchCriteria) state.jobResults = state.jobsDatabase;
  let keywordsRegex = createKeywordsRegEx(state.searchCriteria.keywords);
  const jobsFilteredByKeywords = state.jobsDatabase
    .map((job) => JSON.stringify(job))
    .filter((job) => job.toLowerCase().match(keywordsRegex))
    .map((job) => JSON.parse(job));
  //check if all filters are unckecked -
  const noFiltersToApply = Object.entries(state.searchCriteria).every(
    (value) => {
      if (value[0] == "keywords") return true;
      else return value[1].length == 0;
    }
  );
  if (noFiltersToApply) state.jobResults = jobsFilteredByKeywords;
  const jobsArrayIsEmpty = jobsFilteredByKeywords.length == 0;
  if (jobsArrayIsEmpty) return;
  const jobsFilteredByAllCriteria = jobsFilteredByKeywords.filter((job) => {
    for (let criterion in state.searchCriteria) {
      if (criterion == "keywords") continue;
      const criterionIsNotEmpty = state.searchCriteria[criterion].length != 0;
      if (criterionIsNotEmpty) {
        const jobDoesNotMeetTheCriterion = !state.searchCriteria[
          criterion
        ].includes(job[criterion]);
        if (jobDoesNotMeetTheCriterion) return false;
      }
    }
    return true;
  });
  state.jobResults = jobsFilteredByAllCriteria;
};

const createRelevanceScores = function () {
  const noKeywords = state.searchCriteria.keywords.length === 0;
  const databaseIsEmpty = state.jobResults.length === 0;
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
  state.searchCriteria.keywords.forEach((keyword) => {
    const keywordVariations = [
      keyword,
      keyword[0].toUpperCase() + keyword.slice(1),
      keyword.toUpperCase(),
    ];
    const regex = new RegExp(keywordVariations.join("|"));
    state.jobResults.forEach((job) => {
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
export const storeExpandedRecipeId = function (e) {
  const logoWasClicked = e.target.classList.contains("result-omnifood-logo");
  const jobTitleWasClicked = e.target.classList.contains("overview-job-title");
  if (logoWasClicked || jobTitleWasClicked)
    state.ExpandedJobResultId =
      e.target.closest(".search-result").dataset.jobid;
};
export const getSearchResults = function () {
  jobSearch();
  createRelevanceScores();
};

const init = function () {
  getJobsFromServer();
};
init();
