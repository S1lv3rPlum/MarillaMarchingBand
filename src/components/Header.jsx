// src/components/Header.jsx
import { C } from "./UI";

export default function Header({ user, nav, page, onNav, onLogin, onLogout, onAdmin }) {
  return (
    <header style={{ background:C.black, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.4)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", borderBottom:`3px solid ${C.yellow}` }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:C.yellow, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:"bold", color:C.black, border:`2px solid ${C.white}`, flexShrink:0 }}>
            {/* Replace "M" with an <img> tag once you have your logo */}
            M
          </div>
          <div>
            <div style={{ color:C.white, fontSize:"clamp(12px,3vw,17px)", fontWeight:"bold", letterSpacing:"0.04em", lineHeight:1.2 }}>Marilla Marching Band</div>
            <div style={{ color:C.yellow, fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase" }}>Member Hub</div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user?.role === "admin" && (
            <button onClick={onAdmin} title="Admin Panel"
              style={{ background:"none", border:`1px solid #555`, color:C.yellow, borderRadius:6, padding:"8px 12px", cursor:"pointer", fontSize:18, lineHeight:1 }}>
              ⚙️
            </button>
          )}
          {user
            ? <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:C.yellow, fontSize:12, fontWeight:"bold", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  👤 {user.name}
                </span>
                <button onClick={onLogout} style={{ background:"transparent", color:C.gray, border:`1px solid #444`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                  Log Out
                </button>
              </div>
            : <button onClick={onLogin} style={{ background:C.yellow, color:C.black, border:"none", borderRadius:6, padding:"9px 14px", fontWeight:"bold", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                Log In
              </button>
          }
        </div>
      </div>

      {/* Nav tabs */}
      <nav style={{ display:"flex", overflowX:"auto", padding:"0 8px", scrollbarWidth:"none" }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => onNav(n.id)}
            style={{ background:page===n.id?C.yellow:"transparent", color:page===n.id?C.black:C.white, border:"none", padding:"11px 13px", fontSize:13, fontWeight:page===n.id?"bold":"normal", cursor:"pointer", borderRadius:"6px 6px 0 0", whiteSpace:"nowrap", fontFamily:"inherit" }}>
            {n.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
