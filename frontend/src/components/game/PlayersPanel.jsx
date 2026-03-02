export default function PlayersPanel({
  players,
  isJoined,
  isWaiting,
  isOwner,
  state,
  onJoin,
  onReady,
  onStart,
  onDeal,
}) {
  return (
    <article className="card">
      <h2>Sala</h2>
      <div className="row wrap">
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
      </div>

      <h3>Jugadores</h3>
      <ul className="list">
        {players.map((player) => (
          <li key={player}>{player}</li>
        ))}
      </ul>
    </article>
  );
}
