// src/notifications.js
// ─────────────────────────────────────────────────────────────
// Handles FCM push notification permission + token storage.
// Called after a user logs in.
//
// SETUP REQUIRED:
//   1. In Firebase Console → Project Settings → Cloud Messaging
//   2. Generate a "Web Push certificate" (VAPID key)
//   3. Paste the public key below as VAPID_KEY
// ─────────────────────────────────────────────────────────────

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc }                    from "firebase/firestore";
import { db }                                from "./firebase";

BL9yICPhIf0AjkiXmZF2HgC-JsdanxZYlLuvQVGK3iWH2wosybYw_x_YfEhRmj8k6Ktoyx8oRTqg6YsPh-w_tFs

// ── Request permission and save FCM token to user's Firestore record ──
export async function requestNotificationPermission(uid) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied.");
      await updateDoc(doc(db, "users", uid), { pushEnabled: false });
      return false;
    }

    const messaging = getMessaging();
    const token     = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      await updateDoc(doc(db, "users", uid), {
        fcmToken:    token,
        pushEnabled: true,
      });
      console.log("FCM token saved.");
      return true;
    }
  } catch (err) {
    console.error("Failed to get FCM token:", err);
  }
  return false;
}

// ── Listen for foreground messages (app is open) ──────────────
export function listenForForegroundMessages(onReceive) {
  const messaging = getMessaging();
  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    onReceive?.(payload);
  });
}
