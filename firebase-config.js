// Firebase configuration for BrandBlitz Resume AI (dedicated Firebase project)
// Firebase web config is public app configuration; protect data with Firebase Security Rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBh5mur6QykNi41Qqw5st63MiwlNY6FjSg",
  authDomain: "brandblitz-resume-ai-92b9e.firebaseapp.com",
  projectId: "brandblitz-resume-ai-92b9e",
  storageBucket: "brandblitz-resume-ai-92b9e.firebasestorage.app",
  messagingSenderId: "37308068848",
  appId: "1:37308068848:web:952ff5401c3a333a57a335"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
