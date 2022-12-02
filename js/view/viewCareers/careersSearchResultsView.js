import { toTitleCase } from "../../reusableFunctions.js";
class searchResultsView {
  #parentEl = document.querySelector(".search-results");
  renderResults(jobsArr) {
    this.#parentEl.innerHTML = "";
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
    numberOfResultsContainer.innerHTML = "";
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
}

export default new searchResultsView();
