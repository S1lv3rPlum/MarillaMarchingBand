// src/components/Announcements.jsx
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { C, Btn, Card, PTitle, Spinner, ErrorMsg, inputStyle } from "./UI";

export default function Announcements({ user }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(false);
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db,"announcements"), orderBy("createdAt","desc")), snap => {
      setList(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const post = async () => {
    if (!title.trim() || !body.trim()) { setErr("Both title and message are required."); return; }
    setSaving(true); setErr("");
    await addDoc(collection(db,"announcements"), {
      title, body,
      author:    user.name,
      date:      new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      createdAt: serverTimestamp(),
    });
    setTitle(""); setBody(""); setForm(false); setSaving(false);
  };

  const remove = async (id) => { if (window.confirm("Delete this announcement?")) await deleteDoc(doc(db,"announcements",id)); };

  return (
    <div>
      <PTitle sub="News from the band directors">📢 Announcements</PTitle>
      {user?.role==="admin" && (
        !form
          ? <div style={{ marginBottom:14 }}><Btn full onClick={() => setForm(true)}>+ Post New Announcement</Btn></div>
          : <Card>
              <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>New Announcement</div>
              <ErrorMsg msg={err} />
              <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Title *</label>
              <input style={{ ...inputStyle, marginBottom:12 }} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Rehearsal cancelled Thursday" />
              <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Message *</label>
              <textarea style={{ ...inputStyle, minHeight:90, resize:"vertical", marginBottom:12 }} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your announcement here…" />
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={post} disabled={saving}>{saving?"Posting…":"Post Announcement"}</Btn>
                <Btn secondary onClick={() => { setForm(false); setErr(""); }}>Cancel</Btn>
              </div>
            </Card>
      )}
      {loading ? <Spinner /> : list.length === 0
        ? <Card><div style={{ color:C.gray, fontSize:14 }}>No announcements yet.</div></Card>
        : list.map(a => (
          <Card key={a.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.gray, marginBottom:5 }}>{a.date} · Posted by {a.author}</div>
                <div style={{ fontWeight:"bold", fontSize:16, marginBottom:5 }}>{a.title}</div>
                <div style={{ fontSize:14, lineHeight:1.6, color:C.grayDark }}>{a.body}</div>
              </div>
              {user?.role==="admin" && (
                <button onClick={() => remove(a.id)} style={{ background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:18, padding:4 }}>✕</button>
              )}
            </div>
          </Card>
        ))
      }
    </div>
  );
}
