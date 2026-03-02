function parseIntParam(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function requireParamInt(req, res, name) {
  const n = parseIntParam(req.params?.[name]);
  if (n === null) {
    res.status(400).json({ message: `Invalid ${name}` });
    return null;
  }
  return n;
}

function requireAuthUserId(req, res) {
  const n = Number(req.user?.id);
  if (!Number.isInteger(n)) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return n;
}

module.exports = { parseIntParam, requireParamInt, requireAuthUserId };
