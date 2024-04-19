// logger.ts
import winston, { createLogger, transports, format } from 'winston';

// Configure transports (e.g., console, file, etc.)
const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(), // Enable colorization
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    format.errors({ stack: true }), // Log stack traces for errors
    format.splat(), // Interpolate string with util.format
    format.simple() // Output log data in a human-readable format
  )
});

// Define log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
  }
};

// Create a Winston logger instance
const logger = createLogger({
  level: 'info', // Default log level
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    format.errors({ stack: true }), // Log stack traces for errors
    format.splat() // Interpolate string with util.format
  ),
  transports: [
    consoleTransport
    // Add more transports as needed (e.g., file transport)
  ]
});

// Apply colors to the console transport
winston.addColors(customLevels.colors);

// Dynamically adjust log level based on environment
if (process.env.NODE_ENV === 'production') {
  logger.level = 'warn'; // Only log warnings and errors in production
}

export default logger;
