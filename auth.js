import { auth, provider, db } from "./firebase-config.js";
import {
  signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const el=id=>document.getElementById(id);
const modal=el("authModal"), form=el("emailAuthForm"), message=el("authMessage");
let mode="login";
function say(text,isError=false){if(message){message.textContent=text;message.classList.toggle("error",isError);}}
function setMode(next){
 mode=next;
 const signup=mode==="signup";
 el("authTitle").textContent=signup?"Create your account":"Welcome back";
 el("authIntro").textContent=signup?"Create an account to keep your resumes together.":"Sign in to access your saved resumes.";
 el("authSubmit").textContent=signup?"Create account":"Login";
 el("authName").hidden=!signup;el("authNameLabel").hidden=!signup;
 el("authName").required=signup;
 el("authPassword").autocomplete=signup?"new-password":"current-password";
 el("loginTab").classList.toggle("active",!signup);
 el("signupTab").classList.toggle("active",signup);
 el("forgotPassword").hidden=signup;
 say("");
}
function openAuth(next="login"){
 setMode(next);modal.classList.add("open");modal.setAttribute("aria-hidden","false");
 setTimeout(()=>el("authEmail")?.focus(),40);
}
function closeAuth(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");say("");}
async function saveUserProfile(user){
 await setDoc(doc(db,"users",user.uid),{
  name:user.displayName||"",email:user.email||"",photo:user.photoURL||"",
  updatedAt:serverTimestamp()
 },{merge:true});
}
el("openLogin")?.addEventListener("click",()=>openAuth("login"));
el("openSignup")?.addEventListener("click",()=>openAuth("signup"));
el("loginTab")?.addEventListener("click",()=>setMode("login"));
el("signupTab")?.addEventListener("click",()=>setMode("signup"));
document.querySelectorAll("[data-close-auth]").forEach(x=>x.addEventListener("click",closeAuth));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAuth();});
form?.addEventListener("submit",async e=>{
 e.preventDefault();const email=el("authEmail").value.trim(),password=el("authPassword").value;
 const submit=el("authSubmit");submit.disabled=true;say(mode==="signup"?"Creating your account…":"Signing you in…");
 try{
  let result;
  if(mode==="signup"){
   const name=el("authName").value.trim();
   if(!name)throw new Error("Please enter your name.");
   result=await createUserWithEmailAndPassword(auth,email,password);
   await updateProfile(result.user,{displayName:name});
  }else result=await signInWithEmailAndPassword(auth,email,password);
  await saveUserProfile(result.user);say("Success. You are signed in.");closeAuth();
 }catch(error){
  const errors={
   "auth/email-already-in-use":"An account already exists with this email. Please log in.",
   "auth/invalid-email":"Please enter a valid email address.",
   "auth/weak-password":"Choose a stronger password with at least 6 characters.",
   "auth/invalid-credential":"Email or password is incorrect. Please try again.",
   "auth/user-not-found":"No account was found for this email. Create an account first.",
   "auth/wrong-password":"Email or password is incorrect.",
   "auth/too-many-requests":"Too many attempts. Please wait and try again.",
   "auth/operation-not-allowed":"Email/password sign-in is not enabled in Firebase Authentication yet."
  };
  say(errors[error.code]||error.message||"Authentication failed. Please try again.",true);
 }finally{submit.disabled=false;}
});
el("forgotPassword")?.addEventListener("click",async()=>{
 const email=el("authEmail").value.trim();
 if(!email){say("Enter your email address above, then select Forgot password.",true);el("authEmail").focus();return;}
 try{await sendPasswordResetEmail(auth,email);say("Password reset email sent. Check your inbox and spam folder.");}
 catch(error){
  const errors={"auth/invalid-email":"Please enter a valid email address.","auth/user-not-found":"No account was found for this email.","auth/too-many-requests":"Too many requests. Please wait and try again.","auth/operation-not-allowed":"Password reset is not enabled in Firebase Authentication yet."};
  say(errors[error.code]||error.message,true);
 }
});
el("googleLogin")?.addEventListener("click",async()=>{
 const btn=el("googleLogin");btn.disabled=true;say("Opening Google sign-in…");
 try{const result=await signInWithPopup(auth,provider);await saveUserProfile(result.user);closeAuth();}
 catch(error){say(error.message||"Google sign-in failed.",true);}
 finally{btn.disabled=false;}
});
el("logout")?.addEventListener("click",async()=>{try{await signOut(auth);}catch(e){alert(e.message);}});
onAuthStateChanged(auth,user=>{
 const login=el("openLogin"),signup=el("openSignup"),logout=el("logout"),name=el("userName");
 if(user){if(login)login.style.display="none";if(signup)signup.style.display="none";if(logout)logout.style.display="inline-block";if(name){name.textContent=user.displayName||user.email||"Account";name.style.display="inline";}}
 else{if(login)login.style.display="inline-block";if(signup)signup.style.display="inline-block";if(logout)logout.style.display="none";if(name)name.textContent="";}
});
setMode("login");
