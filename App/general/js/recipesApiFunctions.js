import { EDAMAM_ACCOUNTS } from "./CONFIG";
let accountIndex = 0;
export const getRecipeById = function (recipeId) {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${EDAMAM_ACCOUNTS[accountIndex].id}&app_key=${EDAMAM_ACCOUNTS[accountIndex].key}`;
      const response = await fetch(url);
      const recipeData = await response.json();
      resolve(recipeData.recipe);
    } catch (error) {
      if (error.message === "Failed to fetch") {
        if (accountIndex < EDAMAM_ACCOUNTS.length - 1) {
          accountIndex++;
          resolve(await getRecipeById(recipeId));
        } else {
          accountIndex = 0;
          resolve(await getRecipeById(recipeId));
        }
      }
    }
  });
};

export const getRecipesByUrl = async function (url) {
  //gets recipes from Edamam
  //return an array
  const rawResult = await fetch(url);
  const jsonResult = await rawResult.json();
  let recipesArr = jsonResult.hits.map((result) => result.recipe);
  return recipesArr;
};
