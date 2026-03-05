import UnoCard from "./UnoCard";

export default function UnoCardList({
  cards,
  selectedCardId,
  onSelect,
  disabled = false,
  showIds = false,
}) {
  if (!cards || cards.length === 0) {
    return <p className="muted">No tenes cartas en la mano.</p>;
  }

  const selectedCard = cards.find((card) => String(card.id) === String(selectedCardId));

  return (
    <div className="uno-hand-fan-wrap">
      <p className="hand-selected">
        Seleccionada: <b>{selectedCard ? selectedCard.label : "ninguna"}</b>
      </p>
      <div className="uno-hand-fan">
        {cards.map((card, index) => {
          const selected = String(card.id) === String(selectedCardId);
          const offset = index - (cards.length - 1) / 2;
          return (
            <div
              key={card.id}
              className={`uno-hand-item${selected ? " selected" : ""}`}
              style={{ "--offset": offset, "--z": selected ? 100 : index + 1 }}
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
