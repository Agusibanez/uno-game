import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAppStore } from "../store/useAppStore";

export default function LobbyPage() {
  const navigate = useNavigate();
  const username = useAppStore((s) => s.username);
  const clearAuth = useAppStore((s) => s.clearAuth);
  const [gameId, setGameId] = useState("");
  const [title, setTitle] = useState("Partida UNO");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [error, setError] = useState("");
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => setMyId(r.data.id))
      .catch(() => setMyId(null));
  }, []);

  async function createGame() {
    setError("");
    try {
      const res = await api.post("/games", { title, maxPlayers });
      navigate(`/game/${res.data.game_id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear la partida");
    }
  }

  async function joinGame() {
    setError("");
    try {
      await api.post(`/games/${gameId}/join`);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo unir");
    }
  }

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Lobby</h1>
          <p className="muted">
            Usuario: <b>{username || "-"}</b> {myId ? `(id: ${myId})` : ""}
          </p>
        </div>
        <button className="btn" onClick={logout} type="button">
          Salir
        </button>
      </header>

      <section className="grid two">
        <article className="card">
          <h2>Crear partida</h2>
          <div className="form">
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <input
              type="number"
              value={maxPlayers}
              min={2}
              max={10}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            />
            <button className="btn primary" onClick={createGame} type="button">
              Crear
            </button>
          </div>
        </article>

        <article className="card">
          <h2>Unirse por ID</h2>
          <div className="form">
            <input
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="ID de partida"
            />
            <button className="btn primary" onClick={joinGame} type="button">
              Unirme
            </button>
          </div>
        </article>
      </section>

      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
