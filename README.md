# 🥁 Marilla Marching Band — Web App

## Quick Start

### 1. Install dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 2. Add your Firebase config
- Open `src/firebase.js`
- Replace all `REPLACE_WITH_YOUR_*` values with your Firebase project config
- Do the same in `public/firebase-messaging-sw.js`

### 3. Add your VAPID key (for push notifications)
- Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
- Paste the key into `src/notifications.js` as `VAPID_KEY`

### 4. Run locally
```bash
npm run dev
```

### 5. Run tests
```bash
npm test
```

### 6. Deploy
```bash
npm run deploy
```

---

## Enabling SMS (when ready)

1. Sign up at twilio.com and get a phone number
2. Run:
```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER
```
3. In `functions/smsService.js`: set `MOCK_SMS = false`
4. In `functions/index.js`: search for `TWILIO_UNCOMMENT` and uncomment those blocks
5. In Twilio Console → your number → Messaging webhook:
   Set to: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/smsReply`
6. Deploy: `firebase deploy --only functions`

---

## Adding your logo
- Add your logo as `public/icon-192.png` (192×192px PNG)
- It appears in push notifications and the header
- In `Header.jsx`, replace the `M` placeholder with:
  `<img src="/icon-192.png" style={{ width:42, height:42, borderRadius:"50%" }} />`

---

## Replacing PayPal/Venmo links
- Open `src/components/Sponsors.jsx`
- Replace `PAYPAL_LINK` and `VENMO_LINK` with your real links
- Replace `REPLACE_WITH_BAND_EMAIL` with the director's email

---

## File Structure
```
marilla-band-app/
├── public/
│   └── firebase-messaging-sw.js   ← Push notification service worker
├── src/
│   ├── firebase.js                ← Firebase config (fill in your keys)
│   ├── notifications.js           ← FCM push permission handler
│   ├── App.jsx                    ← Main app + routing
│   └── components/
│       ├── UI.jsx                 ← Shared buttons, cards, etc.
│       ├── Header.jsx
│       ├── LoginModal.jsx
│       ├── NotificationPrompt.jsx ← Post-login push permission prompt
│       ├── Home.jsx
│       ├── Schedule.jsx
│       ├── Announcements.jsx
│       ├── Chat.jsx
│       ├── Photos.jsx
│       ├── Resources.jsx
│       ├── Sponsors.jsx
│       ├── Profile.jsx            ← SMS + push toggles
│       ├── Broadcasts.jsx         ← Admin broadcast composer + reply tracker
│       └── AdminPanel.jsx
├── functions/
│   ├── index.js                   ← Cloud Functions (push + SMS)
│   └── smsService.js              ← Mock/real SMS switcher
├── src/tests/
│   ├── auth.test.js
│   ├── permissions.test.js
│   ├── photos.test.js
│   └── notifications.test.js
├── firestore.rules
├── storage.rules
└── package.json
```
