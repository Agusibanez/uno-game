export function cardLabel(value) {
  const raw = String(value || "").toLowerCase();
  if (raw === "reverse") return "REV";
  if (raw === "skip") return "SKIP";
  if (raw === "wild") return "WILD";
  if (raw === "wild+4") return "WILD +4";
  return String(value ?? "");
}

export function cardColorClass(color) {
  const raw = String(color || "").toLowerCase();
  if (raw === "red") return "uno-red";
  if (raw === "blue") return "uno-blue";
  if (raw === "green") return "uno-green";
  if (raw === "yellow") return "uno-yellow";
  return "uno-black";
}

export function isWildCard(card) {
  if (!card) return false;
  const value = String(card.value || "").toLowerCase();
  return value === "wild" || value === "wild+4";
}

export function parseTopCard(topCard) {
  if (!topCard || topCard === "-") return null;

  if (topCard.includes(":")) {
    const [color, value] = topCard.split(":");
    if (!color || !value) return null;
    return {
      id: `top-${color}-${value}`,
      color: color.toLowerCase(),
      value,
      label: `${color} ${value}`,
    };
  }

  const parts = topCard.split(" ");
  if (parts.length < 2) return null;
  const color = parts.shift();
  const value = parts.join(" ");
  return {
    id: `top-${color}-${value}`,
    color: color.toLowerCase(),
    value,
    label: `${color} ${value}`,
  };
}
