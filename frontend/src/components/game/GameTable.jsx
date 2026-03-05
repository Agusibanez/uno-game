import UnoCard from "../cards/UnoCard";
import { parseTopCard } from "../../utils/card-ui";

export default function GameTable({ topCard, onDraw, discardVersion = 0 }) {
  const parsedTopCard = parseTopCard(topCard);

  return (
    <section className="card game-table">
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
