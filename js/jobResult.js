import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  equalTo,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";
import { toTitleCase } from "./reusableFunctions.js";
const getJobId = function () {
  const url = window.location.href;
  const id = Number(url.slice(url.indexOf("#") + 1));
  return id;
};
const addMissingData = function (jobObj) {
  jobObj.niceToHave = jobObj.niceToHave ? jobObj.niceToHave : [];
};

const getJobDataFromFirebase = async function () {
  const result = new Promise(function (resolve) {
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
    const jobId = getJobId();

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const jobToRenderRef = query(
      ref(db, "jobOpenings"),
      orderByChild("ID"),
      equalTo(jobId)
    );
    onValue(jobToRenderRef, (snapshot) => {
      const retrievedJob = Object.values(snapshot.val())[0];
      addMissingData(retrievedJob);
      resolve(retrievedJob);
    });
  });
  return await result;
};
const buildExpandedResult = function (resultToExpand) {
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

const jobToRender = getJobDataFromFirebase().then((jobInfo) =>
  buildExpandedResult(jobInfo)
);

const addEventListeners = function () {
  const closeBtn = document.querySelector(".full-screen-close-btn");

  closeBtn.addEventListener("click", () => window.close());
};
addEventListeners();
