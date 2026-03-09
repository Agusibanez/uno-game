import UnoCard from "../cards/UnoCard";
import { parseTopCard } from "../../utils/card-ui";

function OpponentHand({ player, isCurrentTurn }) {
  const maxVisible = Math.min(Math.max(Number(player?.handCount || 0), 1), 10);
  const cards = Array.from({ length: maxVisible }, (_, i) => i);

  return (
    <article className={`opponent-hand${isCurrentTurn ? " current" : ""}`}>
      <p className="opponent-name">
        {player?.username} ({player?.handCount ?? 0})
      </p>
      <div className="opponent-cards" aria-hidden="true">
        {cards.map((i) => (
          <span
            key={`${player?.playerId || "x"}-${i}`}
            className="opponent-card-back"
            style={{ "--offset": i }}
          />
        ))}
      </div>
    </article>
  );
}

export default function GameTable({
  topCard,
  onDraw,
  discardVersion = 0,
  participants = [],
  myId = null,
  currentPlayer = "-",
}) {
  const parsedTopCard = parseTopCard(topCard);
  const opponents = participants.filter((p) => p.playerId !== myId);

  return (
    <section className="card game-table">
      {opponents.length > 0 ? (
        <div className="opponents-row">
          {opponents.map((player) => (
            <OpponentHand
              key={player.playerId}
              player={player}
              isCurrentTurn={player.username === currentPlayer}
            />
          ))}
        </div>
      ) : null}

      <div className="table-zone">
        <button className="draw-pile" type="button" onClick={onDraw} title="Robar carta del mazo">
          <span className="draw-layer layer-a" />
          <span className="draw-layer layer-b" />
          <span className="draw-label">Mazo</span>
        </button>

        <div className="discard-zone">
          <span className="draw-label">Descarte</span>
          {parsedTopCard ? (
            <div key={`${parsedTopCard.id}-${discardVersion}`} className="discard-card-pop">
              <UnoCard card={parsedTopCard} disabled />
            </div>
          ) : (
            <div className="top-placeholder">Sin carta</div>
          )}
        </div>
      </div>
    </section>
  );
}
