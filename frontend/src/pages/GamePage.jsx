import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAppStore } from "../store/useAppStore";

export default function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const connectSocket = useAppStore((s) => s.connectSocket);
  const socket = useAppStore((s) => s.socket);
  const username = useAppStore((s) => s.username);
  const [state, setState] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [myId, setMyId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("-");
  const [topCard, setTopCard] = useState("-");
  const [hand, setHand] = useState([]);
  const [cardIdInput, setCardIdInput] = useState("");
  const [chosenColor, setChosenColor] = useState("red");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStatus() {
    try {
      const [g, st, pl, cp, tc, mh, me] = await Promise.all([
        api.get(`/games/${id}`),
        api.get(`/games/${id}/state`),
        api.get(`/games/${id}/players`),
        api.get(`/games/${id}/current-player`),
        api.get(`/games/${id}/top-card`),
        api.get(`/games/${id}/my-hand`),
        api.get("/auth/me"),
      ]);
      setOwnerId(g.data.ownerId ?? null);
      setState(st.data.state);
      setPlayers(pl.data.players || []);
      setCurrentPlayer(cp.data.current_player || "-");
      setTopCard(tc.data.top_card || "-");
      setHand(mh.data.hand || []);
      setMyId(me.data.id ?? null);
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar estado");
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 2000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const active = socket || connectSocket();
    active.emit("join-game", id);
    active.on("update", loadStatus);
    return () => {
      active.off("update", loadStatus);
    };
  }, [id, socket, connectSocket]);

  async function playSelected() {
    setError("");
    setMessage("");
    if (!cardIdInput) return;
    try {
      const selected = hand.find((c) => String(c.id) === String(cardIdInput));
      const payload = { cardId: Number(cardIdInput) };
      if (selected && (selected.value === "wild" || selected.value === "wild+4")) {
        payload.chosenColor = chosenColor;
      }
      const res = await api.put(`/games/${id}/play`, payload);
      setMessage(res.data.message || "Carta jugada");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo jugar carta");
    }
  }

  async function drawCard() {
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/draw`);
      setMessage(res.data.message || "Carta robada");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo robar");
    }
  }

  async function sayUno() {
    setError("");
    setMessage("");
    try {
      const res = await api.patch(`/games/${id}/uno`);
      setMessage(res.data.message || "UNO");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo decir UNO");
    }
  }

  async function joinGame() {
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/join`);
      setMessage(res.data.message || "Te uniste a la partida");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo unir a la partida");
    }
  }

  async function readyGame() {
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/ready`);
      setMessage(res.data.message || "Jugador listo");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo marcar ready");
    }
  }

  async function startGame() {
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/start`);
      setMessage(res.data.message || "Partida iniciada");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo iniciar la partida");
    }
  }

  async function dealCards() {
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/deal`, { cardsPerPlayer: 7 });
      setMessage(res.data.message || "Cartas repartidas");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo repartir cartas");
    }
  }

  const isOwner = ownerId !== null && myId !== null && ownerId === myId;
  const isJoined = players.includes(username);
  const isWaiting = state === "waiting";

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>Partida #{id}</h1>
          <p className="muted">
            Estado: <b>{state || "-"}</b> | Turno: <b>{currentPlayer}</b> | Top: <b>{topCard}</b>
          </p>
        </div>
        <button className="btn" onClick={() => navigate("/lobby")} type="button">
          Volver al lobby
        </button>
      </header>

      <section className="grid two">
        <article className="card">
          <h2>Sala</h2>
          <div className="row wrap">
            {!isJoined && isWaiting ? (
              <button className="btn" onClick={joinGame} type="button">
                Unirme
              </button>
            ) : null}
            {isJoined && isWaiting ? (
              <button className="btn" onClick={readyGame} type="button">
                Ready
              </button>
            ) : null}
            {isOwner && isWaiting ? (
              <button className="btn primary" onClick={startGame} type="button">
                Iniciar partida
              </button>
            ) : null}
            {isOwner && state === "started" ? (
              <button className="btn" onClick={dealCards} type="button">
                Repartir 7
              </button>
            ) : null}
          </div>

          <h3>Jugadores</h3>
          <ul className="list">
            {players.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Mi mano</h2>
          <ul className="list">
            {hand.map((c) => (
              <li key={c.id}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setCardIdInput(String(c.id))}
                >
                  {c.label} (id: {c.id})
                </button>
              </li>
            ))}
          </ul>

          <input
            className="select"
            placeholder="cardId para jugar"
            value={cardIdInput}
            onChange={(e) => setCardIdInput(e.target.value)}
          />
          <select
            className="select"
            value={chosenColor}
            onChange={(e) => setChosenColor(e.target.value)}
          >
            <option value="red">Color wild: rojo</option>
            <option value="blue">Color wild: azul</option>
            <option value="green">Color wild: verde</option>
            <option value="yellow">Color wild: amarillo</option>
          </select>

          <div className="row wrap">
            <button className="btn primary" onClick={playSelected} type="button">
              Jugar carta
            </button>
            <button className="btn" onClick={drawCard} type="button">
              Robar
            </button>
            <button className="btn" onClick={sayUno} type="button">
              Decir UNO
            </button>
          </div>
        </article>
      </section>

      {message ? <p className="ok">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
