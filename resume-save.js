// Get user document
const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);

if (!userSnap.exists()) {
    alert("User not found.");
    return;
}

const userData = userSnap.data();

// Free plan limit
if (
    userData.plan === "free" &&
    (userData.resumeCount || 0) >= 5
) {
    alert("Free plan limit reached. Upgrade to Pro ₹199.");
    window.open(
        "https://brandblitz7.gumroad.com/l/brandblitz-pro-199",
        "_blank"
    );
    return;
}

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
