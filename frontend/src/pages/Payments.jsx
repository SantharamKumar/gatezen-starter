import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api";
import { FiCreditCard } from "react-icons/fi";

export default function Payments() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const load = () => api("/payments").then(setItems);
  useEffect(load, []);

  const pay = async (id) => {
    setBusy(true);
    try {
      await api("/payments/pay", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Payments" icon={<FiCreditCard />}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#6b7280" }}>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #eef2f7" }}>
              <td style={{ padding: "10px 6px" }}>{p.description}</td>
              <td style={{ padding: "10px 6px" }}>₹ {p.amount}</td>
              <td style={{ padding: "10px 6px" }}>
                <span style={{
                  padding:"2px 8px", borderRadius:8,
                  background:p.status==="paid"?"#dcfce7":"#fee2e2",
                  color:p.status==="paid"?"#065f46":"#991b1b",
                  fontWeight:600, fontSize:12
                }}>
                  {p.status}
                </span>
              </td>
              <td style={{ padding: "10px 6px", textAlign: "right" }}>
                {p.status === "due" && (
                  <button
                    disabled={busy}
                    onClick={() => pay(p.id)}
                    style={{
                      background: "#0ea5e9",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    {busy ? "Processing…" : "Pay now"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
