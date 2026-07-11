const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const accessLogFile = path.join(logDir, "access.log");   // every request (operational)
const errorLogFile = path.join(logDir, "error.log");      // errors only

// WRITES ONE TIMESTAMPED LINE TO THE CONSOLE (LIVE DEV VISIBILITY) AND TO THE GIVEN LOG FILE (PERSISTENT)
function write(file, level, message) {
    const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    console.log(line.trim());
    fs.appendFile(file, line, () => {});   // async, "fire and forget" - doesn't block the response
}

function logAccess(message) { write(accessLogFile, "ACCESS", message); }
function logInfo(message) { write(accessLogFile, "INFO", message); }
function logError(message, err) { write(errorLogFile, "ERROR", err ? `${message}: ${err.message}` : message); }

module.exports = { logAccess, logInfo, logError };
