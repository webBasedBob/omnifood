import * as model from "../model/careersModel.js";
import searchView from "../view/viewCareers/careersSearchView.js";
import searchResultsView from "../view/viewCareers/careersSearchResultsView.js";
import filtersView from "../view/viewCareers/careersFiltersView.js";
import filtersCarouselView from "../view/viewCareers/careersFiltersCarouselView.js";

const controlSearchResults = function () {
  model.state.searchCriteria = {
    keywords: searchView.getSearchKeywords(),
    ...filtersView.getCheckedFilters(),
  };
  model.getSearchResults();
  searchResultsView.renderResults(model.state.jobResults);
  searchResultsView.renderResultsNo(model.state.jobResults.length);
  const sortingCriterion =
    model.state.searchCriteria.keywords.length === 0 ? "date" : "relevance";
  searchResultsView.sortResults(sortingCriterion);
  searchView.switchPages();
};

const controlMainFilters = function (e) {
  controlSearchResults();
  filtersView.toggleAppliedFilterVisibility(e);
};

const controlApplyedFilters = function (e) {
  filtersView.uncheckFilter(e);
  controlSearchResults();
};

const controlRemoveFiltersBtn = function () {
  filtersView.removeAllAppliedFilters();
  controlSearchResults();
};

const controlExpandResult = function (e) {
  model.storeExpandedRecipeId(e);
  window.open(`/omnifood/jobResult.html#${model.state.ExpandedJobResultId}`);
};

const init = function () {
  filtersView.init();
  searchView.addHandlerJobSearch(controlSearchResults);
  filtersView.addHandlerMainFilters(controlMainFilters);
  filtersView.addHandlerApplyedFilters(controlApplyedFilters);
  filtersView.addHandlerRemoveAllFilters(controlRemoveFiltersBtn);
  searchResultsView.addHandlerExpandJobResult(controlExpandResult);
};
init();
