// src/components/LoginModal.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { C, Btn, ErrorMsg, inputStyle, FieldGroup } from "./UI";

export default function LoginModal({ onClose, onLoggedIn }) {
  const [mode,     setMode]    = useState("login");
  const [loading,  setLoading] = useState(false);
  const [err,      setErr]     = useState("");
  const [f, setF] = useState({ name:"", email:"", phone:"", password:"", role:"member" });
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const switchMode = m => { setMode(m); setErr(""); };

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!f.name || !f.email || !f.phone || !f.password) {
          setErr("All fields are required."); setLoading(false); return;
        }
        const cred = await createUserWithEmailAndPassword(auth, f.email, f.password);
        const profile = {
          name:       f.name,
          email:      f.email,
          phone:      f.phone,
          role:       "member",   // All new users start as member. Admin promotes from panel.
          blocked:    false,
          joined:     new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
          lastActive: "Just now",
        };
        await setDoc(doc(db, "users", cred.user.uid), profile);
        onLoggedIn({ uid: cred.user.uid, ...profile });
      } else {
        if (!f.email || !f.password) {
          setErr("Please enter your email and password."); setLoading(false); return;
        }
        const cred = await signInWithEmailAndPassword(auth, f.email, f.password);
        const snap = await getDoc(doc(db, "users", cred.user.uid));
        if (!snap.exists()) { setErr("Account not found. Please sign up."); setLoading(false); return; }
        const profile = snap.data();
        if (profile.blocked) {
          setErr("Your account has been blocked. Please contact the band director."); setLoading(false); return;
        }
        onLoggedIn({ uid: cred.user.uid, ...profile });
      }
      onClose();
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use":  "An account with that email already exists.",
        "auth/invalid-email":          "Please enter a valid email address.",
        "auth/weak-password":          "Password must be at least 6 characters.",
        "auth/user-not-found":         "No account found with that email.",
        "auth/wrong-password":         "Incorrect password. Please try again.",
      };
      setErr(msgs[e.code] || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.white, borderRadius:14, padding:26, width:"100%", maxWidth:390, boxShadow:"0 8px 40px rgba(0,0,0,0.3)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ fontWeight:"bold", fontSize:22, marginBottom:4 }}>
          {mode === "login" ? "Welcome Back 👋" : "Join the Band Hub"}
        </div>
        <div style={{ fontSize:14, color:C.gray, marginBottom:20 }}>
          {mode === "login" ? "Log in to access chat, photos, and more." : "Create your account to get started."}
        </div>

        <ErrorMsg msg={err} />

        {mode === "signup" && (
          <>
            <FieldGroup label="Full Name *">
              <input style={inputStyle} value={f.name} onChange={upd("name")} placeholder="Your full name" />
            </FieldGroup>
            <FieldGroup label="Phone Number *">
              <input style={inputStyle} type="tel" value={f.phone} onChange={upd("phone")} placeholder="716-555-0000" />
            </FieldGroup>
            <FieldGroup label="I am a...">
              <select style={{ ...inputStyle, background:C.white }} value={f.role} onChange={upd("role")}>
                <option value="member">Band Member</option>
                <option value="parent">Parent / Guardian</option>
              </select>
            </FieldGroup>
          </>
        )}

        <FieldGroup label="Email Address *">
          <input style={inputStyle} type="email" value={f.email} onChange={upd("email")} placeholder="you@example.com" />
        </FieldGroup>
        <FieldGroup label="Password *">
          <input style={inputStyle} type="password" value={f.password} onChange={upd("password")} placeholder="••••••••" />
        </FieldGroup>

        {mode === "signup" && (
          <p style={{ fontSize:12, color:C.gray, marginBottom:10, lineHeight:1.5 }}>
            Note: New accounts start as Member. A band director can update your role after you sign up.
          </p>
        )}

        <Btn full onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
        </Btn>

        <div style={{ textAlign:"center", marginTop:14, fontSize:14 }}>
          {mode === "login"
            ? <span>No account? <button onClick={() => switchMode("signup")} style={{ background:"none", border:"none", color:C.yellowDark, fontWeight:"bold", cursor:"pointer", fontSize:14 }}>Sign Up</button></span>
            : <span>Already have one? <button onClick={() => switchMode("login")} style={{ background:"none", border:"none", color:C.yellowDark, fontWeight:"bold", cursor:"pointer", fontSize:14 }}>Log In</button></span>
          }
        </div>
        <button onClick={onClose} style={{ display:"block", width:"100%", textAlign:"center", marginTop:10, background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
          Continue without logging in
        </button>
      </div>
    </div>
  );
}
