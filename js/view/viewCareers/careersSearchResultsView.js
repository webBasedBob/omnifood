import { toTitleCase } from "../../reusableFunctions.js";
class searchResultsView {
  #parentEl = document.querySelector(".search-results");
  renderResults(jobsArr) {
    this.#parentEl.innerHTML = "";
    const logoSrc =
      document.querySelector(".favicon__location").attributes.src.value;
    const heartIcon = `<svg class="icon" name="heart-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
  `;
    jobsArr.forEach((job) => {
      let html = `
    <div data-jobid = ${job.ID} data-relevancescore = ${
        job.relevancePoints
      } class="search-result">
    <img
    src = ${logoSrc}
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
      this.#parentEl.insertAdjacentHTML("afterbegin", html);
    });
  }

  sortResults(sortingCriterion) {
    const resultsContainer = document.querySelector(".search-results");
    const resultsArray = Array.from(
      document.querySelectorAll(".search-result")
    );
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
  }

  renderResultsNo(noOfResults) {
    const numberOfResultsContainer = document.querySelector(".results-number");
    const resultsNoPreviewMobileFilterSearchBtn = document.querySelector(
      ".mobile-filters-search-btn strong"
    );
    numberOfResultsContainer.innerHTML = "";
    resultsNoPreviewMobileFilterSearchBtn.innerText = `${noOfResults}`;
    numberOfResultsContainer.insertAdjacentHTML(
      "afterbegin",
      `<strong>${noOfResults}</strong> ${
        noOfResults === 1 ? "result" : "results"
      }`
    );
  }
  addHandlerExpandJobResult(handler) {
    this.#parentEl.addEventListener("click", handler);
  }
  hideResults() {
    this.#parentEl.classList.toggle("hidden");
  }
}

export default new searchResultsView();
