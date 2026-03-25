// src/components/Resources.jsx
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { C, Btn, Card, PTitle, Tag, Spinner, ErrorMsg, inputStyle } from "./UI";

const TAGS = ["Music","Drill","Calendar","Uniform","Other"];

export default function Resources({ user }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const [f, setF] = useState({ title:"", desc:"", tag:"Music" });
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db,"resources"), orderBy("createdAt","desc")), snap => {
      setList(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const add = async () => {
    if (!f.title.trim()) { setErr("Title is required."); return; }
    setSaving(true); setErr("");
    await addDoc(collection(db,"resources"), {
      ...f,
      date:      new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      createdAt: serverTimestamp(),
    });
    setF({ title:"", desc:"", tag:"Music" }); setForm(false); setSaving(false);
  };

  const remove = async (id) => { if (window.confirm("Remove this resource entry?")) await deleteDoc(doc(db,"resources",id)); };

  return (
    <div>
      <PTitle sub="Track what's been handed out">📋 Resources</PTitle>
      <Card hi>
        <div style={{ fontWeight:"bold", marginBottom:5 }}>📌 How this works</div>
        <div style={{ fontSize:14, color:C.grayDark, lineHeight:1.6 }}>Physical materials like sheet music and drill charts are handed out at rehearsals. This page tracks what's been distributed so you always know what you should have.</div>
      </Card>

      {user?.role==="admin" && (
        !form
          ? <div style={{ marginBottom:14 }}><Btn full onClick={() => setForm(true)}>+ Add Resource Entry</Btn></div>
          : <Card>
              <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>New Resource Entry</div>
              <ErrorMsg msg={err} />
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Title *</label>
                <input style={inputStyle} value={f.title} onChange={upd("title")} placeholder="e.g. Spring Concert Sheet Music" />
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight:70, resize:"vertical" }} value={f.desc} onChange={upd("desc")} placeholder="When was it handed out, what color folder, etc." />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Category</label>
                <select style={{ ...inputStyle, background:C.white }} value={f.tag} onChange={upd("tag")}>
                  {TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={add} disabled={saving}>{saving?"Saving…":"Add Entry"}</Btn>
                <Btn secondary onClick={() => { setForm(false); setErr(""); }}>Cancel</Btn>
              </div>
            </Card>
      )}

      {loading ? <Spinner /> : list.length === 0
        ? <Card><div style={{ color:C.gray, fontSize:14 }}>No resource entries yet.</div></Card>
        : list.map(r => (
          <Card key={r.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <Tag label={r.tag} />
                <Tag label={r.date} color={C.grayLight} fg={C.grayDark} />
                <div style={{ fontWeight:"bold", fontSize:16, margin:"4px 0 5px" }}>{r.title}</div>
                <div style={{ fontSize:14, lineHeight:1.6, color:C.grayDark }}>{r.desc}</div>
              </div>
              {user?.role==="admin" && (
                <button onClick={() => remove(r.id)} style={{ background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:18, padding:4 }}>✕</button>
              )}
            </div>
          </Card>
        ))
      }
    </div>
  );
}
