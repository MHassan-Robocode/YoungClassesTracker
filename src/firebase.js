import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---- paste YOUR config from Firebase here ----
const firebaseConfig = {
    apiKey: "AIzaSyBaGorbamLfboJ9eKGAyrywB9aR0PEjBZE",
    authDomain: "rbprogresstracker.firebaseapp.com",
    projectId: "rbprogresstracker",
    storageBucket: "rbprogresstracker.firebasestorage.app",
    messagingSenderId: "1020114258251",
    appId: "1:1020114258251:web:5423bdddbddf74ebb300ce",
    measurementId: "G-MXFJ6W30LM"
  };
// ----------------------------------------------

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);