import BaseComponent from "./baseComponent.js";
import { toTitleCase, extractRecipeId } from "./../reusableFunctions.js";

//development paused foe this component
//the component isn't tested - may be some methods that dont work properly

//please update the html before working on this class, it was changed a bit

class FullscreenRecipe {
  constructor() {
    super();
    this.component = document.querySelector(".full-screen-recipe");
    this.title = component.querySelector(".title");
    this.ingredientsList = component.querySelector(".list");
    this.recipeImage = component.querySelector(".front-image");
  }
  setCurrentRecipe(recipe) {
    this.currentRecipe = recipe;
    this.currentRecipeID = extractRecipeId(recipe);
  }
  display(recipe) {
    this.resetFields();
    this.insertTitle(recipe.label);
    recipe.ingredients.forEach((ingrObj) => {
      this.insertIngredient(ingrObj.food);
    });
    this.insertImg(recipe.image);
    super.display();
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
  }
  getHTML() {
    return `<section class="full-screen-recipe">
    <div class="content">
      <div class="text">
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
  
        <div class="next-btn">
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
        <div class="prev-btn">
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
        <div class="save-btn">
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
        <h2 class="title"></h2>
        <div class="list">
        </div>
      </div>
      <div class="images">
        <img
          src=""
          alt=""
          class="front-image"
        />
      </div>
    </div>
  </section>`;
  }
}

export default new FullscreenRecipe();
