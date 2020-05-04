import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, printf } = format;
const rootFolder = path.resolve(__dirname, "../");
const myFormat = printf((info) => `${info.timestamp} [${info.level}]: - ${info.message}`);
const appendTimestamp = format((info) => {
  info.timestamp = new Date().toJSON();
  return info;
});

export const logger = createLogger({
  level: "info",
  exitOnError: true,
  format: combine(appendTimestamp(), myFormat),
  transports: [
    new transports.File({
      filename: "bot-error.log",
      dirname: rootFolder,
      level: "error",
      maxsize: 2500000,
    }),
    new transports.File({
      filename: "bot-combined.log",
      dirname: rootFolder,
      maxsize: 2500000,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console());
}
