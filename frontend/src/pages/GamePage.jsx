import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import GameHeader from "../components/game/GameHeader";
import PlayersPanel from "../components/game/PlayersPanel";
import HandPanel from "../components/game/HandPanel";
import { isWildCard } from "../utils/card-ui";
import "../components/cards/uno-cards.css";

export default function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const connectSocket = useAppStore((s) => s.connectSocket);
  const socket = useAppStore((s) => s.socket);
  const username = useAppStore((s) => s.username);
  const [state, setState] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [myId, setMyId] = useState(null);
  const [drawStack, setDrawStack] = useState(0);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("-");
  const [topCard, setTopCard] = useState("-");
  const [hand, setHand] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
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
      setDrawStack(Number(g.data.drawStack || 0));
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
    if (!selectedCardId) return;
    const stillInHand = hand.some((card) => String(card.id) === String(selectedCardId));
    if (!stillInHand) setSelectedCardId(null);
  }, [hand, selectedCardId]);

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
    if (!selectedCardId) return;
    try {
      const selected = hand.find((c) => String(c.id) === String(selectedCardId));
      const payload = { cardId: Number(selectedCardId) };
      if (selected && isWildCard(selected)) {
        payload.chosenColor = chosenColor;
      }
      const res = await api.put(`/games/${id}/play`, payload);
      setMessage(res.data.message || "Carta jugada");
      setSelectedCardId(null);
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
  const selectedCard = hand.find((card) => String(card.id) === String(selectedCardId)) || null;

  return (
    <main className="page">
      <GameHeader
        gameId={id}
        state={state}
        currentPlayer={currentPlayer}
        topCard={topCard}
        drawStack={drawStack}
        onBack={() => navigate("/lobby")}
      />

      <section className="grid two">
        <PlayersPanel
          players={players}
          isJoined={isJoined}
          isWaiting={isWaiting}
          isOwner={isOwner}
          state={state}
          onJoin={joinGame}
          onReady={readyGame}
          onStart={startGame}
          onDeal={dealCards}
        />

        <HandPanel
          hand={hand}
          selectedCard={selectedCard}
          selectedCardId={selectedCardId}
          onSelectCard={(card) => setSelectedCardId(card.id)}
          chosenColor={chosenColor}
          onChosenColorChange={setChosenColor}
          onPlay={playSelected}
          onDraw={drawCard}
          onSayUno={sayUno}
        />
      </section>

      {message ? <p className="ok">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
