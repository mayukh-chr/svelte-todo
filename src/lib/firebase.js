// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDa1s6JGXUxvBYeS9WOYEOPVVIss4gI3fs",
  authDomain: "to-do-two-2.firebaseapp.com",
  projectId: "to-do-two-2",
  storageBucket: "to-do-two-2.appspot.com",
  messagingSenderId: "946807626381",
  appId: "1:946807626381:web:2d77cfa0b00d516c7360c4"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
