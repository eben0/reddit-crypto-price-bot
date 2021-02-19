import path from "path";
import { createLogger, format, transports, Logger as WinLogger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { LoggerPaths } from "./Constants";

export declare interface WinstonLogger extends WinLogger {}

class Logger {
  static create(_label: string = ""): WinstonLogger {
    const loggerPath = process.env.LOGGER_PATH || "logs";
    const { combine, timestamp, label, json } = format;
    const logger = createLogger({
      level: process.env.LOG_LEVEL,
      format: combine(label({ label: _label }), timestamp(), json()),
      transports: [
        new transports.File({
          filename: path.join(loggerPath, LoggerPaths.errFile),
          level: "error",
        }),
        new transports.File({
          filename: path.join(loggerPath, LoggerPaths.combinedFile),
        }),
        new DailyRotateFile({
          filename: path.join(loggerPath, "rotate-%DATE%.log"),
          datePattern: "YYYY-MM-DD-HH",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
        }),
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      logger.add(
        new transports.Console({
          format: format.simple(),
        })
      );
    }

    return logger;
  }
}

export default Logger;
