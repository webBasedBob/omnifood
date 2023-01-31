import {
  getStorage,
  ref,
  getDownloadURL,
  listAll,
  uploadBytes,
} from "firebase/storage";
export const storeUserResume = function (userId, file) {
  const storage = getStorage();
  const resumeRef = ref(storage, `usersData/${userId}/${file.name}`);
  uploadBytes(resumeRef, file);
};
