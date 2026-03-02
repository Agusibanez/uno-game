const asyncHandler = require("../utils/async-handler");
const statService = require("../services/stat.service");

const requests = asyncHandler(async (req, res) => {
  res.json(await statService.getRequestsStats());
});

const responseTimes = asyncHandler(async (req, res) => {
  res.json(await statService.getResponseTimesStats());
});

const statusCodes = asyncHandler(async (req, res) => {
  res.json(await statService.getStatusCodesStats());
});

const popularEndpoints = asyncHandler(async (req, res) => {
  res.json(await statService.getPopularEndpointsStats());
});

module.exports = {
  requests,
  responseTimes,
  statusCodes,
  popularEndpoints,
};
