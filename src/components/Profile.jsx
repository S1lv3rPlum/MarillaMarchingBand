// src/components/Profile.jsx
// Member profile page — update phone, name, and notification preferences.

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { requestNotificationPermission } from "../notifications";
import { C, Btn, Card, PTitle, RoleBadge, ErrorMsg, inputStyle } from "./UI";

export default function Profile({ user, onUserUpdate }) {
  const [name,     setName]     = useState(user.name  || "");
  const [phone,    setPhone]    = useState(user.phone || "");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [err,      setErr]      = useState("");

  const saveProfile = async () => {
    if (!name.trim() || !phone.trim()) { setErr("Name and phone are required."); return; }
    setSaving(true); setErr("");
    await updateDoc(doc(db, "users", user.uid), { name: name.trim(), phone: phone.trim() });
    onUserUpdate({ ...user, name: name.trim(), phone: phone.trim() });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSMS = async () => {
    const newVal = !user.smsEnabled;
    await updateDoc(doc(db, "users", user.uid), { smsEnabled: newVal });
    onUserUpdate({ ...user, smsEnabled: newVal });
  };

  const togglePush = async () => {
    if (!user.pushEnabled) {
      // Re-request permission if they want to turn it back on
      const granted = await requestNotificationPermission(user.uid);
      if (granted) onUserUpdate({ ...user, pushEnabled: true });
    } else {
      await updateDoc(doc(db, "users", user.uid), { pushEnabled: false });
      onUserUpdate({ ...user, pushEnabled: false });
    }
  };

  return (
    <div>
      <PTitle sub="Manage your account">👤 My Profile</PTitle>

      {/* Role badge */}
      <Card>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <div style={{ fontSize:32 }}>🎺</div>
          <div>
            <div style={{ fontWeight:"bold", fontSize:17 }}>{user.name}</div>
            <div style={{ marginTop:4 }}><RoleBadge role={user.role} /></div>
          </div>
        </div>
        <div style={{ fontSize:13, color:C.gray, marginTop:8 }}>
          ✉️ {user.email}<br />
          📅 Member since {user.joined}
        </div>
      </Card>

      {/* Edit profile */}
      <Card>
        <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>Edit Profile</div>
        <ErrorMsg msg={err} />
        <div style={{ marginBottom:12 }}>
          <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Full Name</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Phone Number</label>
          <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="716-555-0000" />
          <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>Used for SMS notifications from the director.</div>
        </div>
        <Btn onClick={saveProfile} disabled={saving}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </Btn>
      </Card>

      {/* Notification preferences */}
      <Card>
        <div style={{ fontWeight:"bold", fontSize:16, marginBottom:4 }}>🔔 Notification Preferences</div>
        <div style={{ fontSize:13, color:C.gray, marginBottom:16 }}>Choose how you want to hear from the director.</div>

        {/* Push toggle */}
        <ToggleRow
          icon="📲"
          title="Push Notifications"
          desc="Instant alerts on your phone even when the app is closed. Free."
          enabled={user.pushEnabled}
          onToggle={togglePush}
        />

        <div style={{ borderTop:`1px solid ${C.grayLight}`, margin:"14px 0" }} />

        {/* SMS toggle */}
        <ToggleRow
          icon="💬"
          title="SMS Text Messages"
          desc="Text messages sent to your phone number above. Coming soon."
          enabled={user.smsEnabled}
          onToggle={toggleSMS}
        />

        <div style={{ background:"#fffbea", border:`1px solid ${C.yellow}`, borderRadius:8, padding:"10px 12px", marginTop:14, fontSize:13, color:C.grayDark, lineHeight:1.6 }}>
          📱 <strong>Tip:</strong> Save the band's number as <strong>"Marilla Band Director"</strong> in your contacts so you always recognize our texts!
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({ icon, title, desc, enabled, onToggle }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:"bold", fontSize:15 }}>{icon} {title}</div>
        <div style={{ fontSize:13, color:C.gray, marginTop:2, lineHeight:1.5 }}>{desc}</div>
      </div>
      <button onClick={onToggle} style={{
        width:52, height:28, borderRadius:14, border:"none", cursor:"pointer",
        background: enabled ? C.yellow : C.grayLight,
        position:"relative", flexShrink:0, transition:"background 0.2s",
      }}>
        <div style={{
          width:22, height:22, borderRadius:"50%", background:C.white,
          position:"absolute", top:3,
          left: enabled ? 27 : 3,
          transition:"left 0.2s",
          boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}
