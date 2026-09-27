// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXxS-hCBfAffVU37jWoJC_Vv46StfFf9k",
  authDomain: "yourtube-947db.firebaseapp.com",
  projectId: "yourtube-947db",
  storageBucket: "yourtube-947db.firebasestorage.app",
  messagingSenderId: "620236946847",
  appId: "1:620236946847:web:56004bfe994af0738e11aa"
};
const app = getApps().length===0? initializeApp(firebaseConfig): getApps()[0];
// Initialize Firebase
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
