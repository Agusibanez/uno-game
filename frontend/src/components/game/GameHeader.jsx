import UnoCard from "../cards/UnoCard";
import { parseTopCard } from "../../utils/card-ui";

export default function GameHeader({
  gameId,
  state,
  currentPlayer,
  topCard,
  drawStack,
  onBack,
}) {
  const parsedTopCard = parseTopCard(topCard);

  return (
    <header className="game-header">
      <div className="game-header-info">
        <h1>Partida #{gameId}</h1>
        <p className="muted">
          Estado: <b>{state || "-"}</b> | Turno: <b>{currentPlayer}</b>
        </p>
        <p className="muted">
          Penalidad acumulada: <b>{drawStack}</b>
        </p>
      </div>

      <div className="game-topcard">
        <p className="muted">Carta superior</p>
        {parsedTopCard ? (
          <UnoCard card={parsedTopCard} disabled />
        ) : (
          <div className="top-placeholder">Sin carta</div>
        )}
      </div>

      <button className="btn" onClick={onBack} type="button">
        Volver al lobby
      </button>
    </header>
  );
}
