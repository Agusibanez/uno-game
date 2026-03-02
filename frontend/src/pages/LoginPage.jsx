import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAppStore } from "../store/useAppStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api.post("auth/register", { username, email, password });
      }
      const login = await api.post("/auth/login", { username, password });
      setAuth({ token: login.data.access_token, username });
      navigate("/lobby");
    } catch (err) {
      setError(err?.response?.data?.message || "Error de autenticacion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page center">
      <section className="card auth">
        <h1>UNO Online</h1>
        <p className="muted">
          Inicia sesion o crea usuario para entrar al lobby.
        </p>

        <div className="row">
          <button
            className={mode === "login" ? "btn active" : "btn"}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "btn active" : "btn"}
            onClick={() => setMode("register")}
            type="button"
          >
            Registro
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
          />
          {mode === "register" && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              type="email"
              required
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
            required
          />
          <button className="btn primary" disabled={loading} type="submit">
            {loading
              ? "Procesando..."
              : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
