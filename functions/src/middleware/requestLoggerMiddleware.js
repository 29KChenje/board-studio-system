export const requestLoggerMiddleware = (req, _res, next) => {
  req.requestStartedAt = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};
