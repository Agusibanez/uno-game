export default function PlayersPanel({
  players,
  currentPlayer,
  isJoined,
  isWaiting,
  isOwner,
  state,
  onJoin,
  onReady,
  onStart,
  onDeal,
  onRematch,
}) {
  return (
    <article className="card players-strip">
      <div className="row wrap players-actions">
        {!isJoined && isWaiting ? (
          <button className="btn" onClick={onJoin} type="button">
            Unirme
          </button>
        ) : null}
        {isJoined && isWaiting ? (
          <button className="btn" onClick={onReady} type="button">
            Ready
          </button>
        ) : null}
        {isOwner && isWaiting ? (
          <button className="btn primary" onClick={onStart} type="button">
            Iniciar partida
          </button>
        ) : null}
        {isOwner && state === "started" ? (
          <button className="btn" onClick={onDeal} type="button">
            Repartir 7
          </button>
        ) : null}
        {isOwner && state === "ended" ? (
          <button className="btn primary" onClick={onRematch} type="button">
            Jugar de nuevo
          </button>
        ) : null}
      </div>

      <div className="players-list-row">
        {players.map((player) => (
          <span
            key={player}
            className={`player-chip${player === currentPlayer ? " current" : ""}`}
          >
            {player}
          </span>
        ))}
      </div>
    </article>
  );
}
