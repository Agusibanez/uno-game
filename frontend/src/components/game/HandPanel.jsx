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
  onSayUno,
  onChallenge,
  challengablePlayers = [],
  challengedPlayerId,
  onChallengedPlayerIdChange,
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
        <button className="btn" onClick={onSayUno} type="button">
          Decir UNO
        </button>
        <select
          className="select"
          value={challengedPlayerId || ""}
          onChange={(e) => onChallengedPlayerIdChange(Number(e.target.value) || "")}
        >
          <option value="">Elegir jugador para desafiar...</option>
          {challengablePlayers.map((player) => (
            <option key={player.playerId} value={player.playerId}>
              {player.username}
            </option>
          ))}
        </select>
        <button className="btn" onClick={onChallenge} type="button" disabled={!challengedPlayerId}>
          Desafiar UNO
        </button>
      </div>
    </article>
  );
}
