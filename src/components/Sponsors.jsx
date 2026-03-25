// src/components/Sponsors.jsx
// ─────────────────────────────────────────────────────────────
// SETUP: Replace PAYPAL_LINK or VENMO_LINK below with your real links.
// To add real sponsors: Admin panel → Sponsors tab (coming in AdminPanel).
// For now, sponsors are managed directly in Firestore or hardcoded here.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { C, Card, PTitle, Spinner } from "./UI";

// ── Replace these with your real donation links ──────────────
const PAYPAL_LINK = "https://paypal.me/REPLACE_WITH_YOUR_PAYPAL";
const VENMO_LINK  = "https://venmo.com/REPLACE_WITH_YOUR_VENMO";
// ─────────────────────────────────────────────────────────────

export default function Sponsors({ user }) {
  const [sponsors, setSponsors] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sponsors"), snap => {
      setSponsors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div>
      <PTitle sub="Community supporters & band funding">🤝 Sponsors & Support</PTitle>

      {/* Donation section */}
      <Card hi>
        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🎺</div>
          <div style={{ fontWeight:"bold", fontSize:18, marginBottom:6 }}>Support the Marilla Marching Band</div>
          <div style={{ fontSize:14, color:C.grayDark, lineHeight:1.6, marginBottom:16 }}>
            Your donation helps cover equipment, uniforms, travel, and app hosting costs. Every contribution keeps us marching!
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer"
              style={{ background:"#003087", color:C.white, borderRadius:8, padding:"12px 24px", fontWeight:"bold", fontSize:15, textDecoration:"none", display:"inline-block" }}>
              💙 Donate via PayPal
            </a>
            <a href={VENMO_LINK} target="_blank" rel="noopener noreferrer"
              style={{ background:"#008CFF", color:C.white, borderRadius:8, padding:"12px 24px", fontWeight:"bold", fontSize:15, textDecoration:"none", display:"inline-block" }}>
              💸 Donate via Venmo
            </a>
          </div>
        </div>
      </Card>

      {/* Sponsor cards */}
      <div style={{ marginTop:24 }}>
        <div style={{ fontWeight:"bold", fontSize:17, marginBottom:14, borderLeft:`5px solid ${C.yellow}`, paddingLeft:14 }}>
          Our Sponsors
        </div>

        {loading ? <Spinner /> : sponsors.length === 0 ? (
          <Card>
            <div style={{ textAlign:"center", padding:"20px 0", color:C.gray }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🏪</div>
              <div style={{ fontWeight:"bold", marginBottom:6 }}>Become a Sponsor!</div>
              <div style={{ fontSize:14, lineHeight:1.6 }}>
                Local businesses — support your community band! Contact the band director to have your business featured here.
              </div>
            </div>
          </Card>
        ) : (
          sponsors.map(s => (
            <Card key={s.id}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                {s.logoUrl && (
                  <img src={s.logoUrl} alt={s.name} style={{ width:64, height:64, objectFit:"contain", borderRadius:8, border:`1px solid ${C.grayLight}`, flexShrink:0 }} />
                )}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:"bold", fontSize:16, marginBottom:4 }}>{s.name}</div>
                  {s.tagline && <div style={{ fontSize:14, color:C.grayDark, marginBottom:6 }}>{s.tagline}</div>}
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:13, color:C.yellowDark, fontWeight:"bold", textDecoration:"none" }}>
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}

        {/* Sponsor inquiry */}
        <Card style={{ marginTop:8, textAlign:"center" }}>
          <div style={{ fontSize:14, color:C.grayDark, lineHeight:1.6 }}>
            Interested in sponsoring the Marilla Marching Band?<br />
            <strong>Contact us at: </strong>
            <a href="mailto:REPLACE_WITH_BAND_EMAIL" style={{ color:C.yellowDark, fontWeight:"bold" }}>
              REPLACE_WITH_BAND_EMAIL
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
