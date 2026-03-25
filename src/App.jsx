// src/App.jsx
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import Header       from "./components/Header";
import Home         from "./components/Home";
import Schedule     from "./components/Schedule";
import Announcements from "./components/Announcements";
import Chat         from "./components/Chat";
import Resources    from "./components/Resources";
import Photos       from "./components/Photos";
import Sponsors     from "./components/Sponsors";
import AdminPanel   from "./components/AdminPanel";
import LoginModal   from "./components/LoginModal";

export const C = {
  black:"#0f0f0f", yellow:"#F5C800", yellowDark:"#C9A200",
  white:"#FFFFFF", offWhite:"#F7F5EF", gray:"#8a8a8a",
  grayLight:"#e8e6e0", grayDark:"#3a3a3a", red:"#dc2626", redLight:"#fef2f2",
};

export default function App() {
  const [page,       setPage]      = useState("home");
  const [user,       setUser]      = useState(null);   // { uid, name, email, role, blocked }
  const [authLoading,setAuthLoading] = useState(true);
  const [showLogin,  setShowLogin] = useState(false);
  const [showAdmin,  setShowAdmin] = useState(false);

  // Listen for Firebase auth state changes and load user profile from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, ...snap.data() });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (authLoading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:C.offWhite, fontFamily:"Georgia, serif", fontSize:18, color:C.gray }}>
      Loading…
    </div>
  );

  const NAV = [
    { id:"home",          label:"🏠 Home" },
    { id:"calendar",      label:"📅 Schedule" },
    { id:"announcements", label:"📢 News" },
    { id:"chat",          label:"💬 Chat" },
    { id:"photos",        label:"📸 Photos" },
    { id:"resources",     label:"📋 Resources" },
    { id:"sponsors",      label:"🤝 Sponsors" },
  ];

  return (
    <div style={{ fontFamily:"'Georgia','Times New Roman',serif", background:C.offWhite, minHeight:"100vh", color:C.black }}>
      <Header
        user={user}
        nav={NAV}
        page={page}
        onNav={setPage}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
        onAdmin={() => setShowAdmin(true)}
      />

      <main style={{ maxWidth:700, margin:"0 auto", padding:"22px 14px 80px" }}>
        {page==="home"          && <Home          onNav={setPage} user={user} />}
        {page==="calendar"      && <Schedule      user={user} />}
        {page==="announcements" && <Announcements user={user} />}
        {page==="chat"          && <Chat          user={user} onLogin={() => setShowLogin(true)} />}
        {page==="photos"        && <Photos        user={user} onLogin={() => setShowLogin(true)} />}
        {page==="resources"     && <Resources     user={user} />}
        {page==="sponsors"      && <Sponsors      user={user} />}
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLoggedIn={setUser} />}
      {showAdmin && user?.role==="admin" && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
