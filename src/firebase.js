// src/firebase.js
// ─────────────────────────────────────────────────────────────
// Replace the values below with your own Firebase project config.
// Find it in: Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAY3jlLTy9AKZdFV99lrybGO3pRD5iLRZo",
  authDomain: "marillamarchingband-f8095.firebaseapp.com",
  projectId: "marillamarchingband-f8095",
  storageBucket: "marillamarchingband-f8095.firebasestorage.app",
  messagingSenderId: "595163438437",
  appId: "1:595163438437:web:d2e535a4dc93d30901158c"
};

// Initialize Firebase

const app      = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
