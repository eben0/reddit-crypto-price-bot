import path from "path";
import { createLogger, format, transports } from "winston";
import { LoggerPaths } from "./Constants";

class Logger {
  static create(_label = "") {
    const loggerPath = process.env.LOGGER_PATH || "logs";
    const { combine, timestamp, label, json } = format;
    return createLogger({
      format: combine(label({ label: _label }), timestamp(), json()),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: path.join(loggerPath, LoggerPaths.errFile),
          level: "error",
        }),
        new transports.File({
          filename: path.join(loggerPath, LoggerPaths.combinedFile),
        }),
      ],
    });
  }
}

export default Logger;
