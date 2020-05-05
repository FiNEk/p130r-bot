import { createLogger, format, transports } from "winston";
import path from "path";

const rootFolder = path.resolve(__dirname, "../");
const logFormat = format.combine(
  format.colorize(),
  format.align(),
  format.printf((info) => `[${info.level}]: ${info.message}`),
);

export const logger = createLogger({
  level: "info",
  exitOnError: true,
  format: logFormat,
  transports: [
    new transports.Console(),
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
