import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { api } from "../api";
import { FiFileText } from "react-icons/fi";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  useEffect(() => { api("/documents").then(setDocs); }, []);

  return (
    <Card title="Community Documents" icon={<FiFileText />}>
      <ul style={{listStyle:"none", padding:0}}>
        {docs.map(d => (
          <li key={d.id} style={{padding:"10px 0", borderBottom:"1px solid #eef2f7"}}>
            <a href={d.url} onClick={e=>e.preventDefault()} style={{color:"#0ea5e9", textDecoration:"none"}}>
              {d.name}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
