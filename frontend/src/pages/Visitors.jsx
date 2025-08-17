import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api";
import { FiUsers } from "react-icons/fi";

export default function Visitors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", purpose: "" });
  const load = () => api("/visitors").then(setItems);
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api("/visitors", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", purpose: "" });
    load();
  };

  return (
    <div className="dashboard-grid">
      <Card title="Pre-authorize Visitor" icon={<FiUsers />}>
        <form onSubmit={submit} style={{display:"grid", gap:12}}>
          <input
            placeholder="Visitor name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          />
          <input
            placeholder="Purpose"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          />
          <button
            style={{background:"#22c55e", color:"#fff", border:"none", padding:"10px 14px", borderRadius:8, fontWeight:700}}
          >
            Add Visitor
          </button>
        </form>
      </Card>

      <Card title="Visitors" icon={<FiUsers />}>
        <ul style={{listStyle:"none", padding:0}}>
          {items.map(v => (
            <li key={v.id} style={{padding:"10px 0", borderBottom:"1px solid #eef2f7"}}>
              <b>{v.name}</b> — {v.purpose}
              <div style={{fontSize:12, color:"#6b7280"}}>Status: {v.status}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
