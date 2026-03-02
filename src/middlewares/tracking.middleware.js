const statService = require("../services/stat.service");

function trackingMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    const entry = {
      endpointAccess: req.originalUrl,
      requestMethod: req.method,
      statusCode: res.statusCode,
      responseTime: {
        avg: Number(durationMs.toFixed(2)),
        min: Number(durationMs.toFixed(2)),
        max: Number(durationMs.toFixed(2)),
      },
      requestCount: 1,
      timestamp: new Date(),
      userId: Number.isInteger(Number(req.user?.id)) ? Number(req.user.id) : null,
    };

    statService.trackRequest(entry).catch(() => {});
  });

  next();
}

module.exports = trackingMiddleware;
