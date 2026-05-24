// server/utils/logger.js
// Structured logging utility
import config from '../config/index.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = config.isDevelopment ? levels.debug : levels.info;

class Logger {
  constructor() {
    this.level = currentLevel;
  }

  _log(level, message, meta = {}) {
    if (level > this.level) return;

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: Object.keys(levels)[level],
      message,
      env: config.env,
      ...meta,
    };

    if (config.isDevelopment) {
      console.log(JSON.stringify(logData, null, 2));
    } else {
      console.log(JSON.stringify(logData));
    }
  }

  error(message, meta = {}) {
    this._log(levels.error, message, meta);
  }

  warn(message, meta = {}) {
    this._log(levels.warn, message, meta);
  }

  info(message, meta = {}) {
    this._log(levels.info, message, meta);
  }

  debug(message, meta = {}) {
    this._log(levels.debug, message, meta);
  }

  // Request logging
  logRequest(req) {
    this.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  // Error logging
  logError(err, req = null) {
    this.error(err.message, {
      stack: err.stack,
      ...(req && {
        url: req.url,
        method: req.method,
        ip: req.ip,
      }),
    });
  }

  // Database operation logging
  logDb(operation, collection, meta = {}) {
    this.debug(`DB: ${operation} on ${collection}`, meta);
  }
}

export const logger = new Logger();
export default logger;