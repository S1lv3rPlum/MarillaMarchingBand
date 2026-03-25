// src/components/Photos.jsx
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { C, Btn, Card, PTitle, Tag, Spinner, ErrorMsg } from "./UI";

export default function Photos({ user, onLogin }) {
  const [albums,      setAlbums]      = useState([]);   // events used as album names
  const [photos,      setPhotos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [showUpload,  setShowUpload]  = useState(false);
  const [uploadFile,  setUploadFile]  = useState(null);
  const [uploadAlbum, setUploadAlbum] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [err,         setErr]         = useState("");

  // Load approved photos in real-time
  useEffect(() => {
    const q = query(
      collection(db, "photos"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Load events for album selector
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), snap => {
      setAlbums(snap.docs.map(d => ({ id: d.id, title: d.data().title })));
    });
    return unsub;
  }, []);

  const handleUpload = async () => {
    if (!uploadFile || !uploadAlbum) { setErr("Please select a photo and an event album."); return; }
    setUploading(true); setErr("");
    try {
      const fileRef = ref(storage, `photos/${Date.now()}_${uploadFile.name}`);
      await uploadBytes(fileRef, uploadFile);
      const url = await getDownloadURL(fileRef);
      await addDoc(collection(db, "photos"), {
        url,
        album:      uploadAlbum,
        caption:    uploadCaption,
        uploadedBy: user.uid,
        uploaderName: user.name,
        status:     "pending",
        createdAt:  serverTimestamp(),
        flagged:    false,
      });
      setShowUpload(false); setUploadFile(null); setUploadAlbum(""); setUploadCaption("");
    } catch (e) {
      setErr("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  const flagPhoto = async (photoId) => {
    await addDoc(collection(db, "flaggedPhotos"), {
      photoId,
      flaggedBy:  user.uid,
      flaggedAt:  serverTimestamp(),
      reason:     "Reported by user",
    });
    await updateDoc(doc(db, "photos", photoId), { flagged: true });
    alert("Photo has been reported and will be reviewed by an admin.");
  };

  const filtered = selectedAlbum === "all" ? photos : photos.filter(p => p.album === selectedAlbum);

  if (!user) return (
    <div>
      <PTitle>📸 Photo Gallery</PTitle>
      <div style={{ textAlign:"center", padding:"40px 16px" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🔒</div>
        <div style={{ fontWeight:"bold", fontSize:18, marginBottom:8 }}>Log in to view and share photos</div>
        <div style={{ fontSize:14, color:C.gray, marginBottom:20 }}>The photo gallery is available to members and parents.</div>
        <Btn full onClick={onLogin}>Log In or Sign Up</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <PTitle sub="Band memories by event">📸 Photo Gallery</PTitle>

      {/* Upload button */}
      {!showUpload && (
        <div style={{ marginBottom:16 }}>
          <Btn full onClick={() => setShowUpload(true)}>+ Share a Photo</Btn>
          <p style={{ fontSize:12, color:C.gray, textAlign:"center", marginTop:6 }}>
            Photos are reviewed before appearing in the gallery. Please keep all photos family friendly.
          </p>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <Card>
          <div style={{ fontWeight:"bold", fontSize:16, marginBottom:14 }}>Share a Photo</div>
          <ErrorMsg msg={err} />
          <div style={{ marginBottom:12 }}>
            <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Choose Photo *</label>
            <input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files[0])}
              style={{ fontSize:14, fontFamily:"inherit" }} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Event Album *</label>
            <select value={uploadAlbum} onChange={e => setUploadAlbum(e.target.value)}
              style={{ width:"100%", padding:"11px 14px", fontSize:15, borderRadius:8, border:`2px solid ${C.grayLight}`, fontFamily:"inherit", background:C.white }}>
              <option value="">Select an event…</option>
              {albums.map(a => <option key={a.id} value={a.title}>{a.title}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>Caption (optional)</label>
            <input value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="Add a caption…"
              style={{ width:"100%", padding:"11px 14px", fontSize:15, borderRadius:8, border:`2px solid ${C.grayLight}`, boxSizing:"border-box", fontFamily:"inherit", outline:"none" }} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading…" : "Submit Photo"}</Btn>
            <Btn secondary onClick={() => { setShowUpload(false); setErr(""); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Album filter */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"4px 0 12px", scrollbarWidth:"none" }}>
        {["all", ...new Set(photos.map(p => p.album))].map(album => (
          <button key={album} onClick={() => setSelectedAlbum(album)}
            style={{ background: selectedAlbum===album ? C.yellow : C.white, color: selectedAlbum===album ? C.black : C.grayDark, border:`1px solid ${C.grayLight}`, borderRadius:20, padding:"7px 16px", fontSize:13, fontWeight:"bold", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>
            {album === "all" ? "All Photos" : album}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      {loading ? <Spinner /> : filtered.length === 0
        ? <div style={{ textAlign:"center", padding:"30px", color:C.gray }}>No photos yet. Be the first to share one!</div>
        : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:10 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ position:"relative", borderRadius:10, overflow:"hidden", background:C.grayLight, aspectRatio:"1" }}>
                <img src={p.url} alt={p.caption || "Band photo"} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                {p.caption && (
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.55)", color:C.white, fontSize:11, padding:"6px 8px", lineHeight:1.3 }}>
                    {p.caption}
                  </div>
                )}
                <button onClick={() => flagPhoto(p.id)}
                  title="Report this photo"
                  style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,0.5)", color:C.white, border:"none", borderRadius:4, padding:"3px 7px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                  ⚑
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
