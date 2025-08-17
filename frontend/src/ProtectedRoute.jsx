import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed } from "./lib/auth";

/**
 * Wrap any route element with <ProtectedRoute> to require login.
 * If not authenticated, redirects to "/" and keeps the intended path in state.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthed()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
}
