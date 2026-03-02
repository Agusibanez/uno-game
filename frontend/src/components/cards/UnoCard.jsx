import { cardColorClass, cardLabel } from "../../utils/card-ui";

export default function UnoCard({
  card,
  selected = false,
  onClick,
  disabled = false,
  showId = false,
}) {
  const colorClass = cardColorClass(card?.color);
  const valueText = cardLabel(card?.value);
  const className = `uno-card ${colorClass}${selected ? " selected" : ""}${disabled ? " disabled" : ""}`;

  return (
    <button className={className} type="button" onClick={onClick} disabled={disabled}>
      <span className="uno-card-inner">
        <span className="uno-corner top">{valueText}</span>
        <span className="uno-center">{valueText}</span>
        <span className="uno-corner bottom">{valueText}</span>
      </span>
      {showId ? <span className="uno-id">id: {card?.id}</span> : null}
    </button>
  );
}
