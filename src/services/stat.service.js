const { statRepo } = require("../repositories");

async function trackRequest(entry) {
  return statRepo.create(entry);
}

async function getRequestsStats() {
  const rows = await statRepo.findAll();

  const breakdown = rows.reduce((acc, r) => {
    const endpoint = r.endpointAccess;
    const method = r.requestMethod;
    if (!acc[endpoint]) acc[endpoint] = {};
    acc[endpoint][method] = (acc[endpoint][method] || 0) + (r.requestCount || 1);
    return acc;
  }, {});

  const totalRequests = rows.reduce(
    (sum, r) => sum + (r.requestCount || 1),
    0,
  );

  return {
    total_requests: totalRequests,
    breakdown,
  };
}

async function getResponseTimesStats() {
  const rows = await statRepo.findAll();

  const grouped = rows.reduce((acc, r) => {
    const endpoint = r.endpointAccess;
    if (!acc[endpoint]) acc[endpoint] = [];
    const avg = Number(r.responseTime?.avg ?? 0);
    acc[endpoint].push(avg);
    return acc;
  }, {});

  return Object.entries(grouped).reduce((acc, [endpoint, times]) => {
    const sum = times.reduce((s, t) => s + t, 0);
    acc[endpoint] = {
      avg: Number((sum / times.length).toFixed(2)),
      min: Math.min(...times),
      max: Math.max(...times),
    };
    return acc;
  }, {});
}

async function getStatusCodesStats() {
  const rows = await statRepo.findAll();

  return rows.reduce((acc, r) => {
    const key = String(r.statusCode);
    acc[key] = (acc[key] || 0) + (r.requestCount || 1);
    return acc;
  }, {});
}

async function getPopularEndpointsStats() {
  const rows = await statRepo.findAll();

  const endpointCounts = rows.reduce((acc, r) => {
    const endpoint = r.endpointAccess;
    acc[endpoint] = (acc[endpoint] || 0) + (r.requestCount || 1);
    return acc;
  }, {});

  const mostPopular = Object.entries(endpointCounts).reduce(
    (best, current) => (current[1] > best[1] ? current : best),
    ["", 0],
  );

  return {
    most_popular: mostPopular[0] || null,
    request_count: mostPopular[1] || 0,
  };
}

module.exports = {
  trackRequest,
  getRequestsStats,
  getResponseTimesStats,
  getStatusCodesStats,
  getPopularEndpointsStats,
};
