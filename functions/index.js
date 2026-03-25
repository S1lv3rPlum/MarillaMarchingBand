// functions/index.js
// ─────────────────────────────────────────────────────────────
// Firebase Cloud Functions
//
// CURRENTLY ACTIVE:
//   - sendBroadcastPush  → sends FCM push notifications (free)
//   - smsReply           → webhook for incoming SMS replies
//
// TO ENABLE SMS (when Twilio account is ready):
//   1. Run: npm install twilio  (inside /functions)
//   2. Run: firebase functions:secrets:set TWILIO_ACCOUNT_SID
//           firebase functions:secrets:set TWILIO_AUTH_TOKEN
//           firebase functions:secrets:set TWILIO_PHONE_NUMBER
//   3. Search this file for "TWILIO_UNCOMMENT" and uncomment those blocks
//   4. Deploy: firebase deploy --only functions
// ─────────────────────────────────────────────────────────────

const { onCall, onRequest }      = require("firebase-functions/v2/https");
const { onDocumentCreated }      = require("firebase-functions/v2/firestore");
// const { defineSecret }        = require("firebase-functions/params"); // TWILIO_UNCOMMENT
const { initializeApp }          = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging }           = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

// TWILIO_UNCOMMENT: Uncomment these 3 lines when Twilio is ready
// const TWILIO_SID   = defineSecret("TWILIO_ACCOUNT_SID");
// const TWILIO_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
// const TWILIO_FROM  = defineSecret("TWILIO_PHONE_NUMBER");

// ── 1. Send FCM push notifications for a broadcast ───────────
exports.sendBroadcastPush = onCall(async (request) => {
  const { broadcastId, message, title } = request.data;
  if (!broadcastId || !message) throw new Error("Missing broadcastId or message.");

  // Get all users with push enabled and an FCM token
  const usersSnap = await db.collection("users")
    .where("blocked",     "==", false)
    .where("pushEnabled", "==", true)
    .get();

  if (usersSnap.empty) return { sent: 0 };

  const tokens = usersSnap.docs
    .map(d => d.data().fcmToken)
    .filter(Boolean);

  if (tokens.length === 0) return { sent: 0 };

  // Send multicast push
  const result = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: title || "📣 Marilla Marching Band",
      body:  message,
    },
    data: { broadcastId },
    webpush: {
      notification: {
        icon:  "/icon-192.png",
        badge: "/icon-192.png",
      },
    },
  });

  // Record push deliveries in Firestore
  const batch = db.batch();
  usersSnap.docs.forEach((userDoc, i) => {
    const token = userDoc.data().fcmToken;
    if (!token) return;
    const deliveryRef = db
      .collection("broadcasts").doc(broadcastId)
      .collection("deliveries").doc(userDoc.id);
    batch.set(deliveryRef, {
      userId:   userDoc.id,
      userName: userDoc.data().name,
      phone:    userDoc.data().phone || "",
      channel:  "push",
      status:   result.responses[i]?.success ? "sent" : "failed",
      sentAt:   FieldValue.serverTimestamp(),
      replied:  false,
      reply:    null,
      replyAt:  null,
    }, { merge: true });
  });
  await batch.commit();

  await db.collection("broadcasts").doc(broadcastId).update({
    pushSentCount: tokens.length,
    status: "sent",
  });

  return { sent: tokens.length };
});

// ── 2. Send SMS via Twilio when broadcast is created ─────────
// TWILIO_UNCOMMENT: Uncomment this entire block when Twilio is ready
/*
exports.sendBroadcastSMS = onCall(
  { secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM] },
  async (request) => {
    const { broadcastId } = request.data;
    const broadcastSnap = await db.collection("broadcasts").doc(broadcastId).get();
    const broadcast     = broadcastSnap.data();

    const usersSnap = await db.collection("users")
      .where("blocked",    "==", false)
      .where("smsEnabled", "==", true)
      .get();

    if (usersSnap.empty) return { sent: 0 };

    const twilio = require("twilio")(TWILIO_SID.value(), TWILIO_TOKEN.value());

    const replyInstructions =
      broadcast.replyType === "yesno"    ? "\n\nReply YES or NO." :
      broadcast.replyType === "freetext" ? "\n\nReply with any questions." :
                                           "\n\nReply YES, NO, or with a question.";

    const smsBody = `[Marilla Marching Band]\n${broadcast.message}${replyInstructions}`;

    const sends = usersSnap.docs.map(async (userDoc) => {
      const user = userDoc.data();
      if (!user.phone) return;
      try {
        await twilio.messages.create({
          to:   user.phone,
          from: TWILIO_FROM.value(),
          body: smsBody,
        });
        await db.collection("broadcasts").doc(broadcastId)
          .collection("deliveries").doc(userDoc.id)
          .set({
            userId:   userDoc.id,
            userName: user.name,
            phone:    user.phone,
            channel:  "sms",
            status:   "sent",
            sentAt:   FieldValue.serverTimestamp(),
            replied:  false,
            reply:    null,
            replyAt:  null,
          }, { merge: true });
      } catch (e) {
        console.error(`SMS failed for ${user.phone}:`, e.message);
      }
    });

    await Promise.all(sends);
    await db.collection("broadcasts").doc(broadcastId).update({ smsSentCount: usersSnap.size });
    return { sent: usersSnap.size };
  }
);
*/

// ── 3. Receive SMS replies from Twilio webhook ───────────────
// TWILIO_UNCOMMENT: Uncomment this entire block when Twilio is ready
/*
exports.smsReply = onRequest(async (req, res) => {
  const from = req.body.From;
  const body = (req.body.Body || "").trim();

  if (!from || !body) { res.status(400).send("Bad request"); return; }

  // Find user by phone number
  const usersSnap = await db.collection("users").where("phone", "==", from).limit(1).get();
  if (usersSnap.empty) { res.status(200).send("Unknown sender"); return; }

  const userDoc = usersSnap.docs[0];

  // Find the most recent broadcast sent to this user
  const deliveriesSnap = await db.collectionGroup("deliveries")
    .where("userId", "==", userDoc.id)
    .where("replied", "==", false)
    .orderBy("sentAt", "desc")
    .limit(1)
    .get();

  if (!deliveriesSnap.empty) {
    const deliveryRef = deliveriesSnap.docs[0].ref;
    await deliveryRef.update({
      replied: true,
      reply:   body,
      replyAt: FieldValue.serverTimestamp(),
    });
  }

  // Send a TwiML acknowledgement back
  res.set("Content-Type", "text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Message>Thanks! Your reply has been received by the band director. 🎺</Message>
    </Response>`);
});
*/

// ── 4. Mock SMS reply simulator (remove when Twilio is live) ──
// Lets you test the reply system without Twilio.
// Call this from the browser console or Postman:
// POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/mockSMSReply
// Body: { broadcastId: "xxx", userId: "yyy", reply: "YES" }
exports.mockSMSReply = onRequest(async (req, res) => {
  const { broadcastId, userId, reply } = req.body;
  if (!broadcastId || !userId || !reply) {
    res.status(400).json({ error: "Missing broadcastId, userId, or reply" });
    return;
  }
  await db.collection("broadcasts").doc(broadcastId)
    .collection("deliveries").doc(userId)
    .update({
      replied: true,
      reply:   reply,
      replyAt: FieldValue.serverTimestamp(),
    });
  console.log(`[MOCK REPLY] User ${userId} replied "${reply}" to broadcast ${broadcastId}`);
  res.json({ success: true, mock: true });
});
