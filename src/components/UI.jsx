// src/components/UI.jsx
// Shared building blocks used across every page

export const C = {
  black:"#0f0f0f", yellow:"#F5C800", yellowDark:"#C9A200",
  white:"#FFFFFF", offWhite:"#F7F5EF", gray:"#8a8a8a",
  grayLight:"#e8e6e0", grayDark:"#3a3a3a", red:"#dc2626", redLight:"#fef2f2",
};

export function Btn({ children, onClick, secondary, danger, small, full, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: danger ? C.red : secondary ? C.grayLight : C.yellow,
        color:      danger ? C.white : secondary ? C.grayDark : C.black,
        border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: "bold", fontFamily: "inherit", letterSpacing: "0.02em",
        opacity: disabled ? 0.6 : 1,
        padding: small ? "7px 14px" : "13px 20px",
        fontSize: small ? 13 : 15,
        width: full ? "100%" : "auto",
        marginTop: full ? 10 : 0,
      }}
    >{children}</button>
  );
}

export function Tag({ label, color, fg }) {
  return (
    <span style={{ display:"inline-block", background:color||C.yellow, color:fg||C.black, fontSize:11, fontWeight:"bold", borderRadius:4, padding:"2px 8px", marginRight:6, marginBottom:4, letterSpacing:"0.05em", textTransform:"uppercase" }}>
      {label}
    </span>
  );
}

export function Card({ children, hi, danger, style: extra }) {
  return (
    <div style={{ background: danger?C.redLight : hi?"#fffbea" : C.white, border:`1px solid ${danger?C.red : hi?C.yellow : C.grayLight}`, borderRadius:10, padding:"16px 18px", marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", ...extra }}>
      {children}
    </div>
  );
}

export function PTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: sub ? 4 : 18 }}>
      <div style={{ fontSize:"clamp(19px,4.5vw,25px)", fontWeight:"bold", borderLeft:`5px solid ${C.yellow}`, paddingLeft:14 }}>{children}</div>
      {sub && <div style={{ fontSize:13, color:C.gray, paddingLeft:19, marginTop:3, marginBottom:16 }}>{sub}</div>}
    </div>
  );
}

export function RoleBadge({ role }) {
  const map = { admin:["#7c3aed",C.white], member:[C.yellow,C.black], parent:["#0369a1",C.white] };
  const [bg, fg] = map[role] || [C.grayLight, C.grayDark];
  return <Tag label={role} color={bg} fg={fg} />;
}

export function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontWeight:"bold", fontSize:13, marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width:"100%", padding:"11px 14px", fontSize:15, borderRadius:8,
  border:`2px solid #e8e6e0`, boxSizing:"border-box",
  fontFamily:"inherit", outline:"none", background:"#fff",
};

export function Spinner() {
  return <div style={{ textAlign:"center", padding:"30px", color:C.gray, fontSize:14 }}>Loading…</div>;
}

export function ErrorMsg({ msg }) {
  return msg
    ? <div style={{ background:C.redLight, border:`1px solid ${C.red}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:C.red, marginBottom:14 }}>{msg}</div>
    : null;
}
