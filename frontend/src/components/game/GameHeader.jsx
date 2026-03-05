export default function GameHeader({
  gameId,
  state,
  currentPlayer,
  drawStack,
  onBack,
}) {
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

      <button className="btn" onClick={onBack} type="button">
        Volver al lobby
      </button>
    </header>
  );
}
