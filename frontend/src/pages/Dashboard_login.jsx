import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard_login() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ important for cookies
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ cookie is set automatically in the browser
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6 border border-slate-200"
      >
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          🔒 Dashboard Login
        </h2>

        <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="password">
          Enter password
        </label>

        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pr-12 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="Your password"
            autoFocus
          />

          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700 p-1"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-3">
          Keep it secret. Keep it safe.
        </p>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-sm transition ${
            loading
              ? "bg-sky-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700 text-white"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-4 text-center text-xs text-slate-400">
          Tip: use a strong password. This is a demo component.
        </div>
      </form>
    </div>
  );
}
