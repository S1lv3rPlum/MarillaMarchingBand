// public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────
// This file MUST live in /public and be served from the root of your domain.
// Firebase Cloud Messaging uses it to show notifications when the app is closed.
// Replace the firebaseConfig values with your own from Firebase Console.
// ─────────────────────────────────────────────────────────────

importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAY3jlLTy9AKZdFV99lrybGO3pRD5iLRZo",
  authDomain: "marillamarchingband-f8095.firebaseapp.com",
  projectId: "marillamarchingband-f8095",
  storageBucket: "marillamarchingband-f8095.firebasestorage.app",
  messagingSenderId: "595163438437",
  appId: "1:595163438437:web:d2e535a4dc93d30901158c"
};

const messaging = firebase.messaging();

// Handle background notifications (app is closed or minimized)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon:  "/icon-192.png",   // ← add your band logo here as icon-192.png in /public
    badge: "/icon-192.png",
    data:  payload.data,
  });
});
