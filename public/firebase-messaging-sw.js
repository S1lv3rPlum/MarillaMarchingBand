// public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────
// This file MUST live in /public and be served from the root of your domain.
// Firebase Cloud Messaging uses it to show notifications when the app is closed.
// Replace the firebaseConfig values with your own from Firebase Console.
// ─────────────────────────────────────────────────────────────

importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID",
});

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
