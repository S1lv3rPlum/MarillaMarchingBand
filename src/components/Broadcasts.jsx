// src/components/Broadcasts.jsx
// ─────────────────────────────────────────────────────────────
// Admin broadcast composer and reply tracker.
// Push notifications fire immediately via FCM.
// SMS is fully written but commented out — uncomment when Twilio is ready.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, doc, getDoc, serverTimestamp
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../firebase";
import { C, Btn, Card, Tag, Spinner, ErrorMsg } from "./UI";

// ── Mock push sender (used until FCM is fully configured) ─────
async function mockSendPush({ title, body, userCount }) {
  console.log(`[MOCK PUSH] "${title}" → "${body}" sent to ${userCount} users.`);
  return { success: true, mock: true };
}

export default function Broadcasts({ currentUser }) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [selected,   setSelected]   = useState(null); // view replies for a broadcast
  const [sending,    setSending]    = useState(false);
  const [err,        setErr]        = useState("");
  const [f, setF] = useState({ message:"", replyType:"both" });
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "broadcasts"), orderBy("createdAt", "desc")),
      snap => { setBroadcasts(snap.docs.map(d => ({ id:d.id, ...d.data() }))); setLoading(false); }
    );
    return unsub;
  }, []);

  const send = async () => {
    if (!f.message.trim()) { setErr("Message cannot be empty."); return; }
    setSending(true); setErr("");

    try {
      // 1. Save broadcast to Firestore (Cloud Function triggers on this)
      const broadcastRef = await addDoc(collection(db, "broadcasts"), {
        message:    f.message.trim(),
        replyType:  f.replyType,
        sentBy:     currentUser.uid,
        sentByName: currentUser.name,
        status:     "sending",
        sentCount:  0,
        createdAt:  serverTimestamp(),
      });

      // 2. Send FCM push notification to all opted-in users
      // ── Currently using mock — swap for real FCM call below ──
      await mockSendPush({ title:"📣 Marilla Marching Band", body: f.message, userCount: "all" });

      // ── Real FCM via Cloud Function (uncomment when ready) ───
      // const functions = getFunctions();
      // const sendPush  = httpsCallable(functions, "sendBroadcastPush");
      // await sendPush({ broadcastId: broadcastRef.id, message: f.message, title: "📣 Marilla Marching Band" });

      // ── Real SMS via Cloud Function (uncomment when Twilio ready) ──
      // const sendSMS = httpsCallable(functions, "sendBroadcastSMS");
      // await sendSMS({ broadcastId: broadcastRef.id });

      setF({ message:"", replyType:"both" });
      setShowForm(false);
    } catch (e) {
      setErr("Failed to send broadcast. Please try again.");
      console.error(e);
    }
    setSending(false);
  };

  if (selected) return <BroadcastReplies broadcast={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      <div style={{ fontSize:13, color:C.gray, marginBottom:14, lineHeight:1.6 }}>
        Send an instant message to all members & parents. They'll receive a push notification — and an SMS text once Twilio is connected.
      </div>

      {/* Mock mode notice */}
      <div style={{ background:"#fffbea", border:`1px solid ${C.yellow}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.grayDark, marginBottom:16, lineHeight:1.6 }}>
        🧪 <strong>Mock mode active.</strong> Push notifications and SMS are simulated. Check your browser console to see mock sends. Remove mock mode when ready to go live.
      </div>

      {!showForm
        ? <div style={{ marginBottom:14 }}><Btn full onClick={() => setShowForm(true)}>📣 Send New Broadcast</Btn></div>
        : <Card>
            <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>New Broadcast</div>
            <ErrorMsg msg={err} />

            <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Message *</label>
            <textarea
              value={f.message} onChange={upd("message")}
              placeholder="e.g. Rehearsal is cancelled tonight due to weather. Stay safe!"
              style={{ width:"100%", padding:"11px 14px", fontSize:15, borderRadius:8, border:`2px solid ${C.grayLight}`, boxSizing:"border-box", fontFamily:"inherit", minHeight:100, resize:"vertical", outline:"none", marginBottom:14 }}
            />

            <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Allow members to reply with...</label>
            <select value={f.replyType} onChange={upd("replyType")}
              style={{ width:"100%", padding:"11px 14px", fontSize:15, borderRadius:8, border:`2px solid ${C.grayLight}`, fontFamily:"inherit", background:C.white, marginBottom:16 }}>
              <option value="yesno">Yes / No only</option>
              <option value="freetext">Free text reply</option>
              <option value="both">Both — Yes/No buttons + free text</option>
            </select>

            <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#0369a1", marginBottom:14 }}>
              📲 <strong>Push:</strong> Members will see a notification immediately.<br />
              💬 <strong>SMS:</strong> Will send when Twilio is connected.
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={send} disabled={sending}>{sending ? "Sending…" : "Send Broadcast"}</Btn>
              <Btn secondary onClick={() => { setShowForm(false); setErr(""); }}>Cancel</Btn>
            </div>
          </Card>
      }

      {/* Past broadcasts */}
      <div style={{ fontWeight:"bold", fontSize:15, marginBottom:10, marginTop:8 }}>Past Broadcasts</div>
      {loading ? <Spinner /> : broadcasts.length === 0
        ? <div style={{ textAlign:"center", padding:"20px", color:C.gray, fontSize:14 }}>No broadcasts sent yet.</div>
        : broadcasts.map(b => (
          <Card key={b.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:C.gray, marginBottom:4 }}>
                  {b.createdAt?.toDate?.().toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}) || "Sending…"}
                  {" · "}{b.sentByName}
                </div>
                <div style={{ fontSize:15, fontWeight:"bold", marginBottom:6 }}>{b.message}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Tag label={`📣 Sent to ${b.sentCount || 0}`} color={C.grayLight} fg={C.grayDark} />
                  <Tag label={b.replyType === "yesno" ? "Yes/No" : b.replyType === "freetext" ? "Free text" : "Yes/No + Text"} color={C.grayLight} fg={C.grayDark} />
                  {b.mock && <Tag label="Mock" color="#fef3c7" fg="#92400e" />}
                </div>
              </div>
              <Btn small onClick={() => setSelected(b)}>View Replies →</Btn>
            </div>
          </Card>
        ))
      }
    </div>
  );
}

// ── Reply viewer ─────────────────────────────────────────────
function BroadcastReplies({ broadcast, onBack }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "broadcasts", broadcast.id, "deliveries"),
      snap => { setDeliveries(snap.docs.map(d => ({ id:d.id, ...d.data() }))); setLoading(false); }
    );
    return unsub;
  }, [broadcast.id]);

  const replied   = deliveries.filter(d => d.replied);
  const unreplied = deliveries.filter(d => !d.replied);

  return (
    <div>
      <button onClick={onBack} style={{ background:"none", border:"none", color:C.yellowDark, fontWeight:"bold", cursor:"pointer", fontSize:14, fontFamily:"inherit", marginBottom:16, padding:0 }}>
        ← Back to Broadcasts
      </button>

      <div style={{ fontWeight:"bold", fontSize:17, marginBottom:4 }}>📣 Broadcast Replies</div>
      <div style={{ fontSize:14, color:C.grayDark, marginBottom:16, lineHeight:1.6 }}>{broadcast.message}</div>

      {/* Summary */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ background:C.yellow, borderRadius:8, padding:"10px 16px", textAlign:"center", flex:1, minWidth:100 }}>
          <div style={{ fontWeight:"bold", fontSize:22 }}>{replied.length}</div>
          <div style={{ fontSize:12 }}>Replied</div>
        </div>
        <div style={{ background:C.grayLight, borderRadius:8, padding:"10px 16px", textAlign:"center", flex:1, minWidth:100 }}>
          <div style={{ fontWeight:"bold", fontSize:22 }}>{unreplied.length}</div>
          <div style={{ fontSize:12 }}>No Reply Yet</div>
        </div>
        <div style={{ background:C.black, color:C.white, borderRadius:8, padding:"10px 16px", textAlign:"center", flex:1, minWidth:100 }}>
          <div style={{ fontWeight:"bold", fontSize:22 }}>{deliveries.length}</div>
          <div style={{ fontSize:12, color:C.yellow }}>Total Sent</div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {replied.length > 0 && (
            <>
              <div style={{ fontWeight:"bold", fontSize:14, marginBottom:8, color:C.grayDark }}>✅ Replied</div>
              {replied.map(d => (
                <Card key={d.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                    <div>
                      <div style={{ fontWeight:"bold", fontSize:15 }}>{d.userName}</div>
                      <div style={{ fontSize:13, color:C.gray }}>📱 {d.phone}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ background: d.reply?.toLowerCase()==="yes" ? "#dcfce7" : d.reply?.toLowerCase()==="no" ? C.redLight : "#f0f9ff",
                        color: d.reply?.toLowerCase()==="yes" ? "#166534" : d.reply?.toLowerCase()==="no" ? C.red : "#0369a1",
                        borderRadius:6, padding:"6px 12px", fontWeight:"bold", fontSize:14 }}>
                        {d.reply || "✓"}
                      </div>
                      <div style={{ fontSize:11, color:C.gray, marginTop:3 }}>
                        {d.replyAt?.toDate?.().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}) || ""}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}

          {unreplied.length > 0 && (
            <>
              <div style={{ fontWeight:"bold", fontSize:14, marginBottom:8, marginTop:replied.length?16:0, color:C.gray }}>⏳ No Reply Yet</div>
              {unreplied.map(d => (
                <Card key={d.id}>
                  <div style={{ fontWeight:"bold", fontSize:15 }}>{d.userName}</div>
                  <div style={{ fontSize:13, color:C.gray }}>📱 {d.phone}</div>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
