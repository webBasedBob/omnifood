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

export const storeResumeNameOnly = function (userId, resumeName) {
  const db = getDatabase();
  //valid = no special char, in our case is the dot (.)
  const resumeNameValid = resumeName.slice(0, resumeName.indexOf("."));
  const resumenNameExtension = resumeName.slice(resumeName.indexOf(".") + 1);
  update(ref(db, `users/${userId}/resumes`), {
    [resumeNameValid]: resumenNameExtension,
  });
};

export const getUserResumes = function (userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    onValue(ref(db, `users/${userId}/resumes`), (snapshot) => {
      resolve(snapshot.val());
    });
  });
};

export const getUserImage = function (userId) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    onValue(ref(db, `users/${userId}/img`), (snapshot) => {
      resolve(snapshot.val());
    });
  });
};
