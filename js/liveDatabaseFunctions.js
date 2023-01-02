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
    [ingredient]: evaluation === "liked" ? "liked" : "disliked",
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
