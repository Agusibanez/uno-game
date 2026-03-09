import { useMemo, useState } from "react";
import UnoCard from "./UnoCard";

export default function UnoCardList({
  cards,
  selectedCardId,
  onSelect,
  disabled = false,
  showIds = false,
}) {
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const cardsSafe = cards || [];
  const hoveredIndex = useMemo(
    () => cardsSafe.findIndex((card) => String(card.id) === String(hoveredCardId)),
    [cardsSafe, hoveredCardId],
  );

  if (cardsSafe.length === 0) {
    return <p className="muted">No tenes cartas en la mano.</p>;
  }

  const selectedCard = cardsSafe.find((card) => String(card.id) === String(selectedCardId));

  return (
    <div className="uno-hand-fan-wrap">
      <p className="hand-selected">
        Seleccionada: <b>{selectedCard ? selectedCard.label : "ninguna"}</b>
      </p>
      <div className="uno-hand-fan">
        {cardsSafe.map((card, index) => {
          const selected = String(card.id) === String(selectedCardId);
          const hovered = String(card.id) === String(hoveredCardId);
          const offset = index - (cardsSafe.length - 1) / 2;
          const spread =
            hoveredIndex < 0
              ? 0
              : index < hoveredIndex
                ? -14
                : index > hoveredIndex
                  ? 14
                  : 0;
          const raise = selected ? -46 : hovered ? -22 : 0;
          return (
            <div
              key={card.id}
              className={`uno-hand-item${selected ? " selected" : ""}${hovered ? " hovered" : ""}`}
              style={{
                "--offset": offset,
                "--z": selected ? 120 : hovered ? 110 : index + 1,
                "--spread": `${spread}px`,
                "--raise": `${raise}px`,
              }}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onFocus={() => setHoveredCardId(card.id)}
              onBlur={() => setHoveredCardId(null)}
            >
              <UnoCard
                card={card}
                selected={selected}
                onClick={() => onSelect(card)}
                disabled={disabled}
                showId={showIds}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
