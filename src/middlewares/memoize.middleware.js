const { LRUCache } = require("../utils/lru-cache");

function defaultKey(req) {
  return `${req.method}:${req.originalUrl}`;
}

function memoizeMiddleware(config = {}) {
  const {
    max = 50,
    maxAge = 30000,
    key = defaultKey,
    methods = ["GET"],
    exclude = (req) => false,
  } = config;

  const cache = new LRUCache({ max, maxAge });

  function middleware(req, res, next) {
    try {
      if (!methods.includes(req.method)) {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
          cache.clear();
        }
        return next();
      }

      if (req.headers.authorization) return next();

      if (exclude(req)) return next();

      const cacheKey = key(req);

      const cached = cache.get(cacheKey);
      if (cached) {
        res.set("X-Cache", "HIT");
        return res.status(cached.status).json(cached.body);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        const status = res.statusCode || 200;
        if (status === 200) {
          cache.set(cacheKey, { status, body });
        }

        res.set("X-Cache", "MISS");
        return originalJson(body);
      };

      return next();
    } catch (e) {
      return next(e);
    }
  }

  middleware.cache = cache;
  return middleware;
}

module.exports = { memoizeMiddleware };
