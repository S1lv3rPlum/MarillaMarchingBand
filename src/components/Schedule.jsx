// src/components/Schedule.jsx
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { C, Btn, Card, PTitle, Tag, Spinner, ErrorMsg, inputStyle } from "./UI";

const EVENT_TYPES = ["Concert","Rehearsal","Parade","Game","Festival","Meeting","Other"];
const TYPE_COLORS = { Concert:"#7c3aed", Rehearsal:"#0369a1", Parade:"#b45309", Game:"#166534", Festival:"#be185d", Meeting:"#0f766e", Other:"#6b7280" };

export default function Schedule({ user }) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const [f, setF] = useState({ title:"", date:"", time:"", location:"", type:"Concert", details:"" });
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "events"), orderBy("date")), snap => {
      setEvents(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const add = async () => {
    if (!f.title || !f.date) { setErr("Title and date are required."); return; }
    setSaving(true); setErr("");
    await addDoc(collection(db, "events"), { ...f, color: TYPE_COLORS[f.type]||"#6b7280", createdAt: serverTimestamp() });
    setF({ title:"", date:"", time:"", location:"", type:"Concert", details:"" });
    setForm(false); setSaving(false);
  };

  const remove = async (id) => { if (window.confirm("Remove this event?")) await deleteDoc(doc(db, "events", id)); };

  return (
    <div>
      <PTitle sub="Spring 2025 Season">📅 Event Schedule</PTitle>
      {user?.role==="admin" && (
        !form
          ? <div style={{ marginBottom:14 }}><Btn full onClick={() => setForm(true)}>+ Add New Event</Btn></div>
          : <Card>
              <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>New Event</div>
              <ErrorMsg msg={err} />
              {[["Title *","title","text","e.g. Spring Concert"],["Date *","date","text","e.g. Sat, Apr 26"],["Time","time","text","e.g. 9:00 AM"],["Location","location","text","e.g. Main Street, Marilla"]].map(([lbl,key,type,ph])=>(
                <div key={key} style={{ marginBottom:12 }}>
                  <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>{lbl}</label>
                  <input style={inputStyle} type={type} value={f[key]} onChange={upd(key)} placeholder={ph} />
                </div>
              ))}
              <div style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Event Type</label>
                <select value={f.type} onChange={upd("type")} style={{ ...inputStyle, background:C.white }}>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Details</label>
                <textarea value={f.details} onChange={upd("details")} placeholder="What to bring, call time, etc."
                  style={{ ...inputStyle, minHeight:80, resize:"vertical" }} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={add} disabled={saving}>{saving?"Saving…":"Add Event"}</Btn>
                <Btn secondary onClick={() => { setForm(false); setErr(""); }}>Cancel</Btn>
              </div>
            </Card>
      )}
      {loading ? <Spinner /> : events.length === 0
        ? <Card><div style={{ color:C.gray, fontSize:14 }}>No events scheduled yet.</div></Card>
        : events.map(e => (
          <Card key={e.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:4, marginBottom:4 }}>
                  <Tag label={e.type} color={e.color||TYPE_COLORS[e.type]||"#6b7280"} fg="#fff" />
                  <span style={{ fontSize:13, color:C.gray, fontWeight:"bold" }}>{e.date}</span>
                </div>
                <div style={{ fontWeight:"bold", fontSize:16, marginBottom:5 }}>{e.title}</div>
                <div style={{ fontSize:13, color:C.gray, marginBottom:6 }}>📍 {e.location} · 🕐 {e.time}</div>
                <div style={{ fontSize:14, lineHeight:1.6, color:C.grayDark }}>{e.details}</div>
              </div>
              {user?.role==="admin" && (
                <button onClick={() => remove(e.id)} style={{ background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:18, padding:4 }}>✕</button>
              )}
            </div>
          </Card>
        ))
      }
    </div>
  );
}
