import express from 'express';

type IPAddress = string;
type RequestCounter = {
  count: number;
  startTime: number;
};

const MAX_REQUESTS = 10;
const WINDOW_5_SEC = 5 * 1000;

export function rateLimiter(
  limit: number = MAX_REQUESTS,
  window: number = WINDOW_5_SEC
) {
  const requestCountsPerIp: Record<IPAddress, RequestCounter> = {};

  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const ip = req.ip;

    if (!ip) {
      next();
    } else {
      if (!requestCountsPerIp[ip]) {
        requestCountsPerIp[ip] = { count: 1, startTime: Date.now() };
      } else {
        if (Date.now() - requestCountsPerIp[ip].startTime > window) {
          requestCountsPerIp[ip] = { count: 1, startTime: Date.now() };
        } else if (requestCountsPerIp[ip].count >= limit) {
          console.debug('Rate limit exceeded for IP:', ip);
          return res
            .status(429)
            .json({ error: 'Too many requests, please try again later.' });
        } else {
          requestCountsPerIp[ip].count++;
        }
      }

      next();
    }
  };
}
