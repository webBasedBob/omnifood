import {
  toTitleCase,
  extractRecipeId,
  throwError,
  displayNotification,
} from "../../js/reusableFunctions.js";
import Component from "../baseComponent/script.js";
import { getRecipeById } from "../../js/recipesApiFunctions";
class FullscreenRecipe extends Component {
  constructor() {
    super();
    this.component = document.querySelector(".full-screen-recipe");
    this.title = this.component.querySelector(".title");
    this.ingredientsList = this.component.querySelector(".list");
    this.recipeImage = this.component.querySelector(".front-image");
    this.recipeSearchResults = [];
    this.closeBtn = document.querySelector(".full-screen-recipe .close-btn");
    this.navigationBtns = document.querySelectorAll(".full-screen-recipe-btn");
    this.addEventListeners();
  }

  //must refactor event listeners code
  addEventListeners() {
    document
      .querySelector(".save-btn")
      .addEventListener("click", this.saveRecipe.bind(this));

    this.closeBtn.addEventListener("click", this.hide.bind(this));
  }
  saveRecipe(e) {
    const saveBtn = e.target.closest(".save-btn");
    saveBtn.classList.toggle("filled");
    displayNotification(
      saveBtn.classList.contains("filled")
        ? "Recipe saved to favorites"
        : "Recipe removed from favorites"
    );
    //handle saving to firebase
  }

  async open(recipeId, enableBtns = true) {
    let targetRecipe = this.recipeSearchResults.find((recipe, index) => {
      this.currentRecipeIndex = index;
      return recipe.id === recipeId;
    });
    if (!targetRecipe) {
      targetRecipe = await getRecipeById(recipeId);
    }
    this.updateProperties(targetRecipe);
    if (!enableBtns) {
      this.hideNavigationBtns();
    }
    this.display();
  }
  hideNavigationBtns() {
    this.navigationBtns.forEach((btn) => {
      btn.classList.add("hidden");
    });
  }
  display() {
    this.resetFields();
    this.component.dataset.recipeid = this.currentRecipeID;
    this.insertTitle(this.currentRecipe.label);
    this.currentRecipe.ingredients.forEach((ingrObj) => {
      this.insertIngredient(ingrObj.food);
    });
    this.insertImg(this.currentRecipe.image);
    this.hideSiblings();
    super.display();
  }

  hide() {
    document.body.style.height = ``;
    super.hide();
  }

  hideSiblings() {
    document.body.style.height = "100vh";
  }

  nextRecipe() {
    try {
      this.currentRecipeIndex++;
      this.updateProperties(this.recipeSearchResults[this.currentRecipeIndex]);
      this.display();
    } catch (error) {
      throwError("no-recipes-left-end");
    }
  }

  prevRecipe() {
    try {
      console.log("pppspbs");
      this.currentRecipeIndex--;
      this.updateProperties(this.recipeSearchResults[this.currentRecipeIndex]);
      this.display();
    } catch (error) {
      throwError("no-recipes-left-beginning");
    }
  }

  updateProperties(newRecipe) {
    this.currentRecipe = newRecipe;
    this.currentRecipeID = extractRecipeId(newRecipe);
  }

  insertTitle(text) {
    this.title.innerText = toTitleCase(text);
  }
  insertIngredient(text) {
    this.ingredientsList.insertAdjacentHTML(
      "beforeend",
      `<p class="list-item">${toTitleCase(text)}</p>`
    );
  }

  insertImg(src) {
    this.recipeImage.src = src;
  }
  resetFields() {
    this.title.innerText = ``;
    this.ingredientsList.innerText = ``;
    this.recipeImage.src = ``;
    this.component.dataset.recipeid = ``;
  }

  getHTML() {
    return `<section data-recipeid="" class="full-screen-recipe hidden">
    <div class="content">
      <div class="close-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="text">
        <div class="save-btn full-screen-recipe-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </div>

        <div class="next-btn full-screen-recipe-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
        <div class="prev-btn full-screen-recipe-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
        </div>

        <h2 class="title"></h2>
        <div class="list"></div>
      </div>
      <div class="images">
        <img src="https://pulamea.com/.jpg" alt="" class="front-image" />
      </div>
    </div>
  </section>`;
  }
}

export default new FullscreenRecipe();
