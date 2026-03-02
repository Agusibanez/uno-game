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

  return (
    <div className="uno-hand-grid">
      {cards.map((card) => (
        <UnoCard
          key={card.id}
          card={card}
          selected={String(card.id) === String(selectedCardId)}
          onClick={() => onSelect(card)}
          disabled={disabled}
          showId={showIds}
        />
      ))}
    </div>
  );
}
