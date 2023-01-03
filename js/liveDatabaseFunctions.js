import {
  getDatabase,
  set,
  ref,
  get,
  onValue,
  child,
  push,
  update,
} from "firebase/database";

export function storeIngredient(uid, ingredient, evaluation) {
  const db = getDatabase();
  let dataToStore = {
    [ingredient]: evaluation,
  };
  update(ref(db, `users/${uid}/ingredients`), dataToStore);
}

export function getIngredients(uid) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    onValue(ref(db, `users/${uid}/ingredients`), (snapshot) => {
      resolve(snapshot.val());
    });
  });
}

export function storeRecipe(
  userId,
  recipeId,
  recipeImg,
  recipeName,
  evaluation
) {
  const db = getDatabase();
  let dataToStore = {
    [recipeId]: {
      evaluation: evaluation,
      recipeName: recipeName,
      image: recipeImg,
    },
  };
  update(ref(db, `users/${userId}/recipes`), dataToStore);
}

export function getRecipes(uid) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    onValue(ref(db, `users/${uid}/recipes`), (snapshot) => {
      resolve(snapshot.val());
    });
  });
}
