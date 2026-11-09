import { auth, db } from "./firebase-config.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function saveResume() {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in or create an account before saving your resume.");
    document.getElementById("openLogin")?.click();
    return;
  }
  const v = id => document.getElementById(id)?.value?.trim() || "";
  const data = {
    fullName: v("input-fullname"), title: v("input-title"), email: v("input-email"),
    phone: v("input-phone"), location: v("input-location"), summary: v("input-summary"),
    company: v("input-company"), role: v("input-role"), duration: v("input-duration"),
    experience: v("input-exp-desc"), degree: v("input-degree"), school: v("input-school"),
    educationYear: v("input-edu-year"),
    skills: v("input-skills").split(",").map(x => x.trim()).filter(Boolean),
    uid: user.uid, ownerEmail: user.email || "",
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  };
  if (!data.fullName) {
    alert("Please enter your name before saving.");
    return;
  }
  try {
    await addDoc(collection(db, "users", user.uid, "resumes"), data);
    alert("Resume saved successfully.");
  } catch (error) {
    console.error("Resume save failed", error);
    alert("Could not save your resume. Please check your Firestore security rules and try again.");
  }
}
window.saveResume = saveResume;
