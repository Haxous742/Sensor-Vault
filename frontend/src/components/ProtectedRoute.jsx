import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/verify", {
          credentials: "include", // ✅ send cookie
        });
        const data = await res.json();
        setAuthorized(data.valid);
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) return <div className="text-center mt-20 text-slate-500">Checking access...</div>;

  if (!authorized) return <Navigate to="/dashboard/login" replace />;

  return children;
}
