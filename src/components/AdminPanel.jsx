// src/components/AdminPanel.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { C, Btn, Card, Tag, RoleBadge, Spinner, ErrorMsg, inputStyle } from "./UI";

export default function AdminPanel({ onClose }) {
  const [tab, setTab] = useState("users");

  const TABS = [
    { id:"users",   label:"👥 Users" },
    { id:"pending", label:"🕐 Pending Photos" },
    { id:"flagged", label:"⚑ Flagged Photos" },
    { id:"sponsors",label:"🤝 Sponsors" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:16, overflowY:"auto" }}>
      <div style={{ background:C.offWhite, borderRadius:14, width:"100%", maxWidth:660, boxShadow:"0 8px 40px rgba(0,0,0,0.35)", marginTop:8, marginBottom:40 }}>

        {/* Header */}
        <div style={{ background:C.black, borderRadius:"14px 14px 0 0", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`3px solid ${C.yellow}` }}>
          <div>
            <div style={{ color:C.yellow, fontWeight:"bold", fontSize:18 }}>⚙️ Admin Panel</div>
            <div style={{ color:C.gray, fontSize:12, marginTop:2 }}>Marilla Marching Band</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:`1px solid #555`, color:C.white, borderRadius:6, padding:"7px 14px", cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>
            Close ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`2px solid ${C.grayLight}`, background:C.white, overflowX:"auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, padding:"12px 8px", background:"none", border:"none", borderBottom: tab===t.id ? `3px solid ${C.yellow}` : "3px solid transparent", fontWeight:tab===t.id?"bold":"normal", color:tab===t.id?C.black:C.gray, cursor:"pointer", fontFamily:"inherit", fontSize:13, whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"16px 16px 24px" }}>
          {tab==="users"    && <UsersTab />}
          {tab==="pending"  && <PendingPhotosTab />}
          {tab==="flagged"  && <FlaggedPhotosTab />}
          {tab==="sponsors" && <SponsorsTab />}
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ────────────────────────────────────────────────
function UsersTab() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [viewTab,  setViewTab]  = useState("active");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const setRole  = async (id, role)    => await updateDoc(doc(db, "users", id), { role });
  const block    = async (id)          => await updateDoc(doc(db, "users", id), { blocked: true });
  const unblock  = async (id)          => await updateDoc(doc(db, "users", id), { blocked: false });
  const remove   = async (id)          => { if (window.confirm("Permanently remove this account?")) await deleteDoc(doc(db, "users", id)); };

  const active  = users.filter(u => !u.blocked);
  const blocked = users.filter(u =>  u.blocked);

  if (loading) return <Spinner />;

  const UserRow = ({ u, isBlocked }) => (
    <Card danger={isBlocked}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:160 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontWeight:"bold", fontSize:15 }}>{u.name}</span>
            <RoleBadge role={u.role} />
            {isBlocked && <Tag label="Blocked" color={C.red} fg={C.white} />}
          </div>
          <div style={{ fontSize:13, color:C.gray }}>✉️ {u.email}</div>
          <div style={{ fontSize:13, color:C.gray }}>📱 {u.phone}</div>
          <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>Joined {u.joined} · Last active {u.lastActive}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, minWidth:130 }}>
          {!isBlocked && (
            <>
              <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                style={{ padding:"7px 10px", borderRadius:6, border:`1px solid ${C.grayLight}`, fontSize:13, fontFamily:"inherit", background:C.white, cursor:"pointer" }}>
                <option value="member">Member</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
              <Btn small danger onClick={() => block(u.id)}>Block User</Btn>
            </>
          )}
          {isBlocked && (
            <>
              <Btn small onClick={() => unblock(u.id)}>Restore Access</Btn>
              <Btn small danger onClick={() => remove(u.id)}>Remove Account</Btn>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["active",`Active (${active.length})`],["blocked",`Blocked (${blocked.length})`]].map(([id,label]) => (
          <button key={id} onClick={() => setViewTab(id)}
            style={{ background:viewTab===id?C.yellow:C.white, color:viewTab===id?C.black:C.gray, border:`1px solid ${C.grayLight}`, borderRadius:6, padding:"8px 16px", fontWeight:viewTab===id?"bold":"normal", cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>
            {label}
          </button>
        ))}
      </div>
      {viewTab==="active"  && (active.length  === 0 ? <Empty text="No active users." />  : active.map(u  => <UserRow key={u.id} u={u} />))}
      {viewTab==="blocked" && (blocked.length === 0 ? <Empty text="No blocked users." /> : blocked.map(u => <UserRow key={u.id} u={u} isBlocked />))}
    </div>
  );
}

// ── Pending Photos Tab ───────────────────────────────────────
function PendingPhotosTab() {
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, "photos"),
        where("status", "==", "pending")
      ),
      snap => {
        setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const approve = async (id) => await updateDoc(doc(db, "photos", id), { status:"approved" });
  const reject  = async (id) => await deleteDoc(doc(db, "photos", id));

  if (loading) return <Spinner />;
  if (photos.length === 0) return <Empty text="No photos awaiting approval. 🎉" />;

  return (
    <div>
      <p style={{ fontSize:13, color:C.gray, marginBottom:14 }}>Review and approve or reject submitted photos before they appear in the gallery.</p>
      {photos.map(p => (
        <Card key={p.id}>
          <img src={p.url} alt="Pending" style={{ width:"100%", borderRadius:8, marginBottom:10, maxHeight:220, objectFit:"cover" }} />
          <div style={{ fontSize:13, color:C.gray, marginBottom:4 }}>
            Submitted by {p.uploaderName} · Album: <strong>{p.album}</strong>
          </div>
          {p.caption && <div style={{ fontSize:14, marginBottom:10 }}>{p.caption}</div>}
          <div style={{ display:"flex", gap:8 }}>
            <Btn small onClick={() => approve(p.id)}>✓ Approve</Btn>
            <Btn small danger onClick={() => reject(p.id)}>✕ Reject</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Flagged Photos Tab ───────────────────────────────────────
function FlaggedPhotosTab() {
  const [flags,   setFlags]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "flaggedPhotos"), snap => {
      setFlags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const dismiss = async (flagId, photoId) => {
    await deleteDoc(doc(db, "flaggedPhotos", flagId));
    await updateDoc(doc(db, "photos", photoId), { flagged: false });
  };
  const removePhoto = async (flagId, photoId) => {
    await deleteDoc(doc(db, "flaggedPhotos", flagId));
    await deleteDoc(doc(db, "photos", photoId));
  };

  if (loading) return <Spinner />;
  if (flags.length === 0) return <Empty text="No flagged photos. All clear! ✅" />;

  return (
    <div>
      {flags.map(f => (
        <Card key={f.id} danger>
          <div style={{ fontSize:13, color:C.gray, marginBottom:8 }}>Photo ID: {f.photoId} · Flagged by user</div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn small secondary onClick={() => dismiss(f.id, f.photoId)}>Dismiss Flag</Btn>
            <Btn small danger onClick={() => removePhoto(f.id, f.photoId)}>Remove Photo</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Sponsors Tab ─────────────────────────────────────────────
function SponsorsTab() {
  const [sponsors, setSponsors] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ name:"", tagline:"", website:"" });
  const [logoFile, setLogoFile] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sponsors"), snap => {
      setSponsors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addSponsor = async () => {
    if (!f.name) { setErr("Sponsor name is required."); return; }
    setSaving(true); setErr("");
    try {
      let logoUrl = "";
      if (logoFile) {
        const fileRef = ref(storage, `sponsors/${Date.now()}_${logoFile.name}`);
        await uploadBytes(fileRef, logoFile);
        logoUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, "sponsors"), { ...f, logoUrl, createdAt: serverTimestamp() });
      setF({ name:"", tagline:"", website:"" }); setLogoFile(null); setShowForm(false);
    } catch (e) {
      setErr("Failed to add sponsor. Please try again.");
    }
    setSaving(false);
  };

  const remove = async (id) => { if (window.confirm("Remove this sponsor?")) await deleteDoc(doc(db, "sponsors", id)); };

  if (loading) return <Spinner />;

  return (
    <div>
      {!showForm
        ? <div style={{ marginBottom:14 }}><Btn full onClick={() => setShowForm(true)}>+ Add Sponsor</Btn></div>
        : <Card>
            <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>New Sponsor</div>
            <ErrorMsg msg={err} />
            {[["Business Name *","name","text","e.g. Joe's Music Shop"],["Tagline","tagline","text","e.g. Proudly supporting local music"],["Website","website","url","https://example.com"]].map(([lbl,key,type,ph]) => (
              <div key={key} style={{ marginBottom:12 }}>
                <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>{lbl}</label>
                <input style={inputStyle} type={type} value={f[key]} onChange={upd(key)} placeholder={ph} />
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Logo (optional)</label>
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} style={{ fontSize:14, fontFamily:"inherit" }} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={addSponsor} disabled={saving}>{saving ? "Saving…" : "Add Sponsor"}</Btn>
              <Btn secondary onClick={() => { setShowForm(false); setErr(""); }}>Cancel</Btn>
            </div>
          </Card>
      }
      {sponsors.length === 0
        ? <Empty text="No sponsors yet." />
        : sponsors.map(s => (
            <Card key={s.id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                <div>
                  <div style={{ fontWeight:"bold", fontSize:15 }}>{s.name}</div>
                  {s.tagline && <div style={{ fontSize:13, color:C.gray }}>{s.tagline}</div>}
                  {s.website && <div style={{ fontSize:12, color:C.yellowDark }}>{s.website}</div>}
                </div>
                <Btn small danger onClick={() => remove(s.id)}>Remove</Btn>
              </div>
            </Card>
          ))
      }
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign:"center", padding:"30px", color:C.gray, fontSize:14 }}>{text}</div>;
}
