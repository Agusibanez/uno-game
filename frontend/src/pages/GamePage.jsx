import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import GameHeader from "../components/game/GameHeader";
import PlayersPanel from "../components/game/PlayersPanel";
import HandPanel from "../components/game/HandPanel";
import GameTable from "../components/game/GameTable";
import { isWildCard } from "../utils/card-ui";
import "../components/cards/uno-cards.css";

export default function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const connectSocket = useAppStore((s) => s.connectSocket);
  const socket = useAppStore((s) => s.socket);
  const [state, setState] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [myId, setMyId] = useState(null);
  const [drawStack, setDrawStack] = useState(0);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("-");
  const [topCard, setTopCard] = useState("-");
  const [hand, setHand] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState({});
  const [discardVersion, setDiscardVersion] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [challengedPlayerId, setChallengedPlayerId] = useState("");
  const [chosenColor, setChosenColor] = useState("red");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const announcedUnoRef = useRef(new Set());
  const winnerShownRef = useRef(false);
  const loadingStatusRef = useRef(false);

  async function loadStatus(options = {}) {
    if (loadingStatusRef.current) return;
    loadingStatusRef.current = true;

    try {
      const { withScores = true } = options;
      const [g, full, mh] = await Promise.all([
        api.get(`/games/${id}`),
        api.get(`/games/${id}/status`),
        api.get(`/games/${id}/my-hand`),
      ]);

      const gameState = g.data.status || null;
      const nextParticipants = full.data.participants || [];
      const currentPlayerId = full.data.currentPlayer || null;
      const currentPlayerName =
        nextParticipants.find((p) => p.playerId === currentPlayerId)?.username || "-";

      setOwnerId(g.data.ownerId ?? null);
      setDrawStack(Number(g.data.drawStack || 0));
      setState(gameState);
      setPlayers(nextParticipants.map((p) => p.username));
      setCurrentPlayer(currentPlayerName);
      setTopCard(full.data.topCard || "-");
      setHand(mh.data.hand || []);
      setParticipants(nextParticipants);

      if (withScores || gameState === "ended") {
        const sc = await api.get(`/games/${id}/scores`);
        setScores(sc.data?.scores || {});
      }

      for (const p of nextParticipants) {
        const unoKey = `${p.playerId}:${p.saidUnoAt || "none"}`;
        if (p.saidUno && p.handCount === 1 && !announcedUnoRef.current.has(unoKey)) {
          announcedUnoRef.current.add(unoKey);
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: `${p.username} dijo UNO`,
            timer: 2200,
            showConfirmButton: false,
          });
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cargar el estado");
    } finally {
      loadingStatusRef.current = false;
    }
  }

  useEffect(() => {
    loadStatus({ withScores: true });
    const interval = setInterval(() => loadStatus(), 8000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        setMyId(res.data?.id ?? null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCardId) return;
    const stillInHand = hand.some((card) => String(card.id) === String(selectedCardId));
    if (!stillInHand) setSelectedCardId(null);
  }, [hand, selectedCardId]);

  useEffect(() => {
    setDiscardVersion((x) => x + 1);
  }, [topCard]);

  useEffect(() => {
    if (state === "ended" && !winnerShownRef.current) {
      const winner = participants.find((p) => p.handCount === 0);
      const winnerName = winner?.username || "un jugador";
      winnerShownRef.current = true;
      Swal.fire({
        icon: "success",
        title: "Partida terminada",
        text: `Ganador: ${winnerName}. Revisa los puntajes o vuelve al lobby.`,
      });
    }
  }, [state, participants]);

  useEffect(() => {
    const active = socket || connectSocket();
    const onUpdate = () => loadStatus();
    active.emit("join-game", id);
    active.on("update", onUpdate);
    return () => {
      active.off("update", onUpdate);
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
      if (res.data.winnerName) {
        winnerShownRef.current = true;
        Swal.fire({
          icon: "success",
          title: "Tenemos ganador",
          text: `Ganador: ${res.data.winnerName}`,
        });
      }
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
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Cantaste UNO",
        timer: 1800,
        showConfirmButton: false,
      });
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

  async function rematchGame() {
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/rematch`);
      winnerShownRef.current = false;
      setSelectedCardId(null);
      setChallengedPlayerId("");
      setMessage(res.data.message || "Nueva ronda iniciada");
      await loadStatus({ withScores: true });
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo iniciar una nueva ronda");
    }
  }

  async function challengeUno() {
    if (!challengedPlayerId) return;
    setError("");
    setMessage("");
    try {
      const res = await api.post(`/games/${id}/challenge-uno`, {
        challengedPlayerId: Number(challengedPlayerId),
      });
      setMessage(res.data.message || "Desafio enviado");
      Swal.fire({
        icon: "info",
        title: "Desafio UNO",
        text: res.data.message || "Desafio enviado",
      });
      setChallengedPlayerId("");
      await loadStatus();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo desafiar UNO");
    }
  }

  const isOwner = ownerId !== null && myId !== null && ownerId === myId;
  const isJoined = myId !== null && participants.some((p) => p.playerId === myId);
  const isWaiting = state === "waiting";
  const selectedCard = hand.find((card) => String(card.id) === String(selectedCardId)) || null;
  const challengablePlayers = participants.filter(
    (p) => p.playerId !== myId && p.handCount === 1 && !p.saidUno,
  );
  const scoreRows = Object.entries(scores || {});

  return (
    <main className="page game-page">
      <GameHeader
        gameId={id}
        state={state}
        currentPlayer={currentPlayer}
        drawStack={drawStack}
        onBack={() => navigate("/lobby")}
      />

      <PlayersPanel
        players={players}
        currentPlayer={currentPlayer}
        isJoined={isJoined}
        isWaiting={isWaiting}
        isOwner={isOwner}
        state={state}
        onJoin={joinGame}
        onReady={readyGame}
        onStart={startGame}
        onDeal={dealCards}
        onRematch={rematchGame}
      />

      <GameTable
        topCard={topCard}
        onDraw={drawCard}
        discardVersion={discardVersion}
        participants={participants}
        myId={myId}
        currentPlayer={currentPlayer}
      />

      <HandPanel
        hand={hand}
        selectedCard={selectedCard}
        selectedCardId={selectedCardId}
        onSelectCard={(card) => setSelectedCardId(card.id)}
        chosenColor={chosenColor}
        onChosenColorChange={setChosenColor}
        onPlay={playSelected}
        onSayUno={sayUno}
        challengablePlayers={challengablePlayers}
        challengedPlayerId={challengedPlayerId}
        onChallengedPlayerIdChange={setChallengedPlayerId}
        onChallenge={challengeUno}
      />

      <article className="card">
        <h2>Puntajes</h2>
        {scoreRows.length === 0 ? (
          <p className="muted">Sin puntajes disponibles.</p>
        ) : (
          <ul className="list">
            {scoreRows.map(([playerName, score]) => (
              <li key={playerName}>
                {playerName}: {score}
              </li>
            ))}
          </ul>
        )}
      </article>

      {message ? <p className="ok">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
