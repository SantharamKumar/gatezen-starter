import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api";
import { FiCalendar } from "react-icons/fi";

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ amenity: "Clubhouse", date: "", time: "" });
  const load = () => api("/bookings").then(setItems);
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api("/bookings", { method: "POST", body: JSON.stringify(form) });
    setForm({ amenity: "Clubhouse", date: "", time: "" });
    load();
  };

  return (
    <div className="dashboard-grid">
      <Card title="New Booking" icon={<FiCalendar />}>
        <form onSubmit={submit} style={{display:"grid", gap:12}}>
          <select
            value={form.amenity}
            onChange={(e) => setForm({ ...form, amenity: e.target.value })}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          >
            <option>Clubhouse</option>
            <option>Gym</option>
            <option>Pool</option>
            <option>Tennis Court</option>
          </select>
          <input type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          />
          <input type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            style={{padding:12, border:"1px solid #e5e7eb", borderRadius:8}}
          />
          <button
            style={{background:"#0ea5e9", color:"#fff", border:"none", padding:"10px 14px", borderRadius:8, fontWeight:700}}
          >
            Book
          </button>
        </form>
      </Card>

      <Card title="Upcoming Bookings" icon={<FiCalendar />}>
        <ul style={{listStyle:"none", padding:0}}>
          {items.map(b => (
            <li key={b.id} style={{padding:"10px 0", borderBottom:"1px solid #eef2f7"}}>
              <b>{b.amenity}</b> — {b.date || "TBD"} {b.time && `• ${b.time}`}
              <div style={{fontSize:12, color:"#6b7280"}}>Status: {b.status}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
