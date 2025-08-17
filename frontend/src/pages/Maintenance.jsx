import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api";
import { FiTool } from "react-icons/fi";

export default function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: "", details: "" });
  const load = () => api("/maintenance").then(setTickets);
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api("/maintenance", { method: "POST", body: JSON.stringify(form) });
    setForm({ title: "", details: "" });
    load();
  };

  return (
    <div className="dashboard-grid">
      <Card title="Create Ticket" icon={<FiTool />}>
        <form onSubmit={submit} style={{display:"grid", gap:12}}>
          <input
            placeholder="Issue title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          />
          <textarea
            placeholder="Describe the issue"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            rows={4}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          />
          <button
            style={{background:"#22c55e", color:"#fff", border:"none", padding:"10px 14px", borderRadius:8, fontWeight:700}}
          >
            Submit
          </button>
        </form>
      </Card>

      <Card title="My Tickets" icon={<FiTool />}>
        <ul style={{listStyle:"none", padding:0, margin:0}}>
          {tickets.map(t => (
            <li key={t.id} style={{padding:"10px 0", borderBottom:"1px solid #eef2f7"}}>
              <div style={{fontWeight:700}}>{t.title}</div>
              <div style={{fontSize:14, color:"#64748b"}}>{t.details}</div>
              <div style={{marginTop:6,fontSize:12,color:"#6b7280"}}>
                Status: <b>{t.status}</b> • {new Date(t.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
