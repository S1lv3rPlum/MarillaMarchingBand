// functions/smsService.js
// ─────────────────────────────────────────────────────────────
// MOCK MODE: Set MOCK_SMS = true to simulate texts without Twilio.
// When ready for real SMS: set MOCK_SMS = false and fill in Twilio secrets.
// ─────────────────────────────────────────────────────────────

const MOCK_SMS = true; // ← flip to false when ready for Twilio

// ── Mock sender ───────────────────────────────────────────────
function mockSendSMS({ to, body }) {
  const timestamp = new Date().toISOString();
  console.log(`[MOCK SMS] To: ${to} | Body: "${body}" | Sent at: ${timestamp}`);
  return { success: true, mock: true, to, body, timestamp };
}

// ── Real Twilio sender (uncomment when ready) ─────────────────
// const twilio = require("twilio");
// function realSendSMS({ to, body, fromNumber, accountSid, authToken }) {
//   const client = twilio(accountSid, authToken);
//   return client.messages.create({ to, from: fromNumber, body });
// }

// ── Exported send function ────────────────────────────────────
async function sendSMS({ to, body, twilioConfig }) {
  if (MOCK_SMS) {
    return mockSendSMS({ to, body });
  }
  // ── Real Twilio (uncomment when ready) ──
  // return realSendSMS({ to, body, ...twilioConfig });
}

module.exports = { sendSMS, MOCK_SMS };
