// src/components/Home.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { C, Card, PTitle, Tag, Btn, Spinner } from "./UI";

const TYPE_COLORS = { Concert:"#7c3aed", Rehearsal:"#0369a1", Parade:"#b45309", Game:"#166534", Festival:"#be185d", Meeting:"#0f766e", Other:"#6b7280" };

export default function Home({ onNav }) {
  const [events, setEvents] = useState([]);
  const [anns,   setAnns]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubE = onSnapshot(query(collection(db,"events"),  orderBy("date"),          limit(2)), s => setEvents(s.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubA = onSnapshot(query(collection(db,"announcements"), orderBy("createdAt","desc"), limit(1)), s => { setAnns(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false); });
    return () => { unsubE(); unsubA(); };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ background:C.black, borderRadius:10, padding:"22px 24px", marginBottom:22, textAlign:"center" }}>
        <div style={{ fontSize:24, fontWeight:"bold", color:C.yellow }}>🥁 Marilla Marching Band</div>
        <div style={{ fontSize:14, color:C.white, opacity:0.8, marginTop:4 }}>Your hub for schedules, news & resources</div>
      </div>
      <PTitle sub="Coming up">📅 Upcoming Events</PTitle>
      {events.length === 0
        ? <Card><div style={{ color:C.gray, fontSize:14 }}>No upcoming events yet.</div></Card>
        : events.map(e => (
          <Card key={e.id}>
            <Tag label={e.type} color={TYPE_COLORS[e.type]||"#6b7280"} fg="#fff" />
            <div style={{ fontWeight:"bold", fontSize:16, margin:"4px 0 5px" }}>{e.title}</div>
            <div style={{ fontSize:13, color:C.gray, marginBottom:6 }}>📍 {e.location} · 🕐 {e.date} at {e.time}</div>
            <div style={{ fontSize:14, lineHeight:1.6, color:C.grayDark }}>{e.details}</div>
          </Card>
        ))
      }
      <Btn full onClick={() => onNav("calendar")}>See Full Schedule →</Btn>
      <div style={{ marginTop:26 }}>
        <PTitle sub="From the director">📢 Latest Announcement</PTitle>
        {anns.length === 0
          ? <Card><div style={{ color:C.gray, fontSize:14 }}>No announcements yet.</div></Card>
          : anns.map(a => (
            <Card key={a.id}>
              <div style={{ fontSize:13, color:C.gray, marginBottom:5 }}>{a.date} · {a.author}</div>
              <div style={{ fontWeight:"bold", fontSize:16, marginBottom:5 }}>{a.title}</div>
              <div style={{ fontSize:14, lineHeight:1.6, color:C.grayDark }}>{a.body}</div>
            </Card>
          ))
        }
        <Btn full onClick={() => onNav("announcements")}>All Announcements →</Btn>
      </div>
    </div>
  );
}
