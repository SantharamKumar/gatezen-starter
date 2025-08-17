import React from "react";
import Card from "../components/Card";
import { FiUser } from "react-icons/fi";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <Card title="My Profile" icon={<FiUser />}>
      <div style={{display:"grid", gap:10}}>
        <div><b>Name:</b> {user.name || "Admin"}</div>
        <div><b>Email:</b> {user.email || "admin@gatezen.app"}</div>
        <div><b>Role:</b> {user.role || "admin"}</div>
      </div>
    </Card>
  );
}
