import { auth, db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("Resume Save Module Loaded");
async function saveResume() {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      return;
    }

    await addDoc(collection(db, "resumes"), {
      uid: user.uid,
      createdAt: serverTimestamp(),
      title: "My Resume"
    });

    alert("Resume Saved Successfully!");
  } catch (error) {
    console.error(error);
    alert("Error saving resume.");
  }

  window.saveResume = saveResume;
}
