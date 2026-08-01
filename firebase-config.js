// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWE8iG_Ue8wuw0_Qg8TyL0mXxSJFNm0Ac",
  authDomain: "brandblitz-resume-ai.firebaseapp.com",
  projectId: "brandblitz-resume-ai",
  storageBucket: "brandblitz-resume-ai.firebasestorage.app",
  messagingSenderId: "346430556211",
  appId: "1:346430556211:web:7f871d448f33947ef1b86c",
  measurementId: "G-HFHQB0BWQB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
