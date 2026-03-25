// src/components/NotificationPrompt.jsx
// ─────────────────────────────────────────────────────────────
// Shown once after a user logs in to ask for push notification permission.
// Saves their choice to Firestore so we don't ask again.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { requestNotificationPermission } from "../notifications";
import { C, Btn } from "./UI";

export default function NotificationPrompt({ user, onDone }) {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    const granted = await requestNotificationPermission(user.uid);
    if (!granted) {
      // Permission was denied by the browser — mark it so we don't ask again
      await updateDoc(doc(db, "users", user.uid), { pushEnabled: false, pushPromptSeen: true });
    } else {
      await updateDoc(doc(db, "users", user.uid), { pushPromptSeen: true });
    }
    setLoading(false);
    onDone();
  };

  const handleDecline = async () => {
    await updateDoc(doc(db, "users", user.uid), {
      pushEnabled:    false,
      pushPromptSeen: true,
    });
    onDone();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:250, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.white, borderRadius:14, padding:28, width:"100%", maxWidth:380, boxShadow:"0 8px 40px rgba(0,0,0,0.3)", textAlign:"center" }}>

        <div style={{ fontSize:52, marginBottom:12 }}>🔔</div>

        <div style={{ fontWeight:"bold", fontSize:20, marginBottom:8 }}>
          Stay in the loop!
        </div>

        <div style={{ fontSize:15, color:C.grayDark, lineHeight:1.7, marginBottom:8 }}>
          Get instant notifications when the director sends important updates — rehearsal changes, parade reminders, and more.
        </div>

        <div style={{ fontSize:13, color:C.gray, marginBottom:24, lineHeight:1.6 }}>
          No spam. Only messages from your band director.
        </div>

        {/* Save this number prompt */}
        <div style={{ background:"#fffbea", border:`1px solid ${C.yellow}`, borderRadius:10, padding:"12px 16px", marginBottom:22, textAlign:"left" }}>
          <div style={{ fontWeight:"bold", fontSize:13, marginBottom:4 }}>📱 Pro tip</div>
          <div style={{ fontSize:13, color:C.grayDark, lineHeight:1.6 }}>
            When SMS is enabled, messages will come from the band's dedicated number. Save it as <strong>"Marilla Band Director"</strong> in your contacts so you always know it's us!
          </div>
        </div>

        <Btn full onClick={handleAllow} disabled={loading}>
          {loading ? "Setting up…" : "🔔 Yes, notify me!"}
        </Btn>

        <button
          onClick={handleDecline}
          style={{ display:"block", width:"100%", textAlign:"center", marginTop:12, background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>
          No thanks, I'll check the app manually
        </button>
      </div>
    </div>
  );
}
