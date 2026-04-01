const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('../errors');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.tenantId = payload.tenantId;
    req.userId = payload.userId;
    req.role = payload.role;
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

module.exports = authenticate;
