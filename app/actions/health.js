exports.getHealth = async (_req, res, _next) => {
  res.status(200).send({
    success: true,
    uptime: process.uptime(),
    requestedAt: res.requestedAt
  });
};
