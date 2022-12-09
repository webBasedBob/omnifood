import * as model from "../model/careersModel.js";
import searchView from "../view/viewCareers/careersSearchView.js";
import searchResultsView from "../view/viewCareers/careersSearchResultsView.js";
import filtersView from "../view/viewCareers/careersFiltersView.js";
import filtersCarouselView from "../view/viewCareers/careersFiltersCarouselView.js";
import firstPageSearchView from "../view/viewCareers/careersFirstPageSearchView.js";
import sortView from "../view/viewCareers/careersSortView.js";
const controlFirstPageSearch = function () {
  filtersView.init();
  controlSearchResults();
  filtersCarouselView.init();
};

const controlSearchResults = function () {
  model.state.searchCriteria = {
    keywords: searchView.getSearchKeywords(),
    ...filtersView.getCheckedFilters(),
  };
  model.getSearchResults();
  searchResultsView.renderResults(model.state.jobResults);
  searchResultsView.renderResultsNo(model.state.jobResults.length);
  model.setSortingCriterion(
    model.state.searchCriteria.keywords.length === 0 ? "date" : "relevance"
  );

  searchResultsView.sortResults(model.state.sortingCriterion);
  sortView.highlightSortingCriterion(model.state.sortingCriterion);
  searchView.switchPages();
};

const controlMainFilters = function (e) {
  controlSearchResults();
  filtersView.toggleAppliedFilterVisibility(e);
  const id = e.target.id;
  filtersCarouselView.filterToggleState(id);
};

const controlApplyedFilters = function (e) {
  filtersView.uncheckFilter(e);
  console.dir(e);
  controlSearchResults();
};

const controlRemoveFiltersBtn = function () {
  filtersView.removeAllAppliedFilters();
  filtersCarouselView.unselectAllFilters();
  controlSearchResults();
};

const controlFiltersCarousel = function (e) {
  // filtersCarouselView.selectFilter(e);
  // filtersCarouselView.init();
  const id = e.target.dataset.filterId;
  filtersView.selectFilter(id);
};

const controlExpandResult = function (e) {
  model.storeExpandedRecipeId(e);
  window.open(
    `/omnifood/html/jobResult.html#${model.state.ExpandedJobResultId}`
  );
};

const controlSorting = function (e) {
  const sortingCriterion = e.target.innerText.toLowerCase();
  model.setSortingCriterion(sortingCriterion);
  sortView.highlightSortingCriterion(model.state.sortingCriterion);
  searchResultsView.sortResults(model.state.sortingCriterion);
};
const controlMobileFilters = function () {
  filtersView.toggleMobileFilters();
  searchResultsView.hideResults();
};
const init = function () {
  firstPageSearchView.addHandlerFirstPageSearch(controlFirstPageSearch);
  searchView.addHandlerJobSearch(controlSearchResults);
  filtersView.addHandlerMainFilters(controlMainFilters);
  filtersView.addHandlerApplyedFilters(controlApplyedFilters);
  filtersView.addHandlerRemoveAllFilters(controlRemoveFiltersBtn);
  searchResultsView.addHandlerExpandJobResult(controlExpandResult);

  filtersCarouselView.addHandlerSelectFilter(controlFiltersCarousel);
  sortView.addHandlerSort(controlSorting);
  filtersView.addHandlerControlMobileFilters(controlMobileFilters);
};
init();
