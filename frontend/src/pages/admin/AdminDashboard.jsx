import React from "react";
import Card from "../../components/Card";
import { FiShield } from "react-icons/fi";

export default function AdminDashboard() {
  return (
    <Card title="Admin Overview" icon={<FiShield />}>
      <p>Welcome to the admin panel. Use the Users section to manage residents.</p>
    </Card>
  );
}
