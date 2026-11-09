// Firebase configuration for BrandBlitz Resume AI web app
// Firebase web config is public app configuration; protect data with Firebase Security Rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoGegUTKkWEHOm6313OxmV6Z7HfF_8eGw",
  authDomain: "billvault-d7976.firebaseapp.com",
  projectId: "billvault-d7976",
  storageBucket: "billvault-d7976.firebasestorage.app",
  messagingSenderId: "108909709348",
  appId: "1:108909709348:web:8faa07051901b55c4c70b1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
