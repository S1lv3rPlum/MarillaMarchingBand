// src/components/Chat.jsx
import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { C, Btn, Card, PTitle, Spinner } from "./UI";

export default function Chat({ user, onLogin }) {
  const [msgs,    setMsgs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [text,    setText]    = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db,"chat"), orderBy("createdAt","asc"), limit(100)), snap => {
      setMsgs(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await addDoc(collection(db,"chat"), {
      text:      text.trim(),
      senderId:  user.uid,
      senderName:user.name,
      senderRole:user.role,
      createdAt: serverTimestamp(),
    });
    setText(""); setSending(false);
  };

  const deleteMsg = async (id) => {
    if (window.confirm("Delete this message?")) await deleteDoc(doc(db,"chat",id));
  };

  if (!user) return (
    <div>
      <PTitle>💬 Band Chat</PTitle>
      <div style={{ textAlign:"center", padding:"40px 16px" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🔒</div>
        <div style={{ fontWeight:"bold", fontSize:18, marginBottom:8 }}>Log in to join the chat</div>
        <div style={{ fontSize:14, color:C.gray, marginBottom:20 }}>Chat is available to band members and parents.</div>
        <Btn full onClick={onLogin}>Log In or Sign Up</Btn>
      </div>
    </div>
  );

  if (user.blocked) return (
    <div>
      <PTitle>💬 Band Chat</PTitle>
      <Card danger>
        <div style={{ fontWeight:"bold", fontSize:16, marginBottom:6 }}>⛔ Your chat access has been restricted</div>
        <div style={{ fontSize:14, color:C.grayDark, lineHeight:1.6 }}>Your account has been blocked from chat by an administrator. You can still view the site. Please contact the band director if you have questions.</div>
      </Card>
    </div>
  );

  return (
    <div>
      <PTitle sub="Members & parents only">💬 Band Chat</PTitle>
      <div style={{ background:C.white, border:`1px solid ${C.grayLight}`, borderRadius:10, padding:"14px 16px", marginBottom:10, minHeight:300, maxHeight:420, overflowY:"auto" }}>
        {/* Pinned reminder */}
        <div style={{ background:"#fffbea", border:`1px solid ${C.yellow}`, borderRadius:8, padding:"8px 12px", fontSize:12, color:C.grayDark, marginBottom:14, textAlign:"center" }}>
          📌 Reminder: Keep it band-friendly! 🎺
        </div>
        {loading ? <Spinner /> : msgs.length === 0
          ? <div style={{ textAlign:"center", color:C.gray, fontSize:14, padding:"20px 0" }}>No messages yet. Say hello! 👋</div>
          : msgs.map(m => {
              const isMe = m.senderId === user.uid;
              return (
                <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:isMe?"flex-end":"flex-start", marginBottom:14 }}>
                  <div style={{ background:isMe?C.yellow:C.white, border:isMe?"none":`1px solid ${C.grayLight}`, borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"10px 14px", maxWidth:"80%", fontSize:14, lineHeight:1.5, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                    {m.text}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:C.gray, marginTop:3, padding:"0 4px" }}>
                    <span>{isMe ? "You" : m.senderName}</span>
                    {user.role==="admin" && !isMe && (
                      <button onClick={() => deleteMsg(m.id)} style={{ background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:11, padding:0 }}>🗑</button>
                    )}
                  </div>
                </div>
              );
            })
        }
        <div ref={bottomRef} />
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message…"
          style={{ flex:1, padding:"12px 14px", fontSize:15, borderRadius:8, border:`2px solid ${C.grayLight}`, fontFamily:"inherit", outline:"none" }} />
        <button onClick={send} disabled={sending}
          style={{ background:C.yellow, color:C.black, border:"none", borderRadius:8, padding:"12px 20px", fontWeight:"bold", fontSize:15, cursor:"pointer", fontFamily:"inherit", opacity:sending?0.6:1 }}>
          Send
        </button>
      </div>
    </div>
  );
}
