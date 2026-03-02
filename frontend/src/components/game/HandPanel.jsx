import UnoCardList from "../cards/UnoCardList";
import { isWildCard } from "../../utils/card-ui";

export default function HandPanel({
  hand,
  selectedCard,
  selectedCardId,
  onSelectCard,
  chosenColor,
  onChosenColorChange,
  onPlay,
  onDraw,
  onSayUno,
}) {
  const wildSelected = isWildCard(selectedCard);

  return (
    <article className="card">
      <h2>Mi mano</h2>

      <UnoCardList cards={hand} selectedCardId={selectedCardId} onSelect={onSelectCard} />

      {wildSelected ? (
        <select
          className="select"
          value={chosenColor}
          onChange={(e) => onChosenColorChange(e.target.value)}
        >
          <option value="red">Color wild: rojo</option>
          <option value="blue">Color wild: azul</option>
          <option value="green">Color wild: verde</option>
          <option value="yellow">Color wild: amarillo</option>
        </select>
      ) : null}

      <div className="row wrap">
        <button className="btn primary" onClick={onPlay} type="button" disabled={!selectedCardId}>
          Jugar carta
        </button>
        <button className="btn" onClick={onDraw} type="button">
          Robar
        </button>
        <button className="btn" onClick={onSayUno} type="button">
          Decir UNO
        </button>
      </div>
    </article>
  );
}
