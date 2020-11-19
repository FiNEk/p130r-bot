import { createLogger, format, transports } from "winston";
import path from "path";
import { isNullishOrEmpty } from "./utils";
import { valuesIn } from "lodash";

function customPrint(info: TransformableInfo) {
  const meta = valuesIn(info.metadata);
  let out = `${info.timestamp} [${info.level}]: ${info.message}`;
  if (!isNullishOrEmpty(meta)) {
    for (const error of meta) {
      if (!isNullishOrEmpty(error.stack)) {
        out = out + "\n" + error.stack;
      }
    }
  }
  return out;
}

const rootFolder = path.resolve(__dirname, "../");
const logFormat = format.combine(
  format.colorize(),
  format.align(),
  format.timestamp(),
  format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  format.printf(customPrint),
);

export const logger = createLogger({
  level: "info",
  exitOnError: true,
  format: logFormat,
  transports: [
    new transports.Console({ level: process.env.NODE_ENV === "development" ? "debug" : "info" }),
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

interface TransformableInfo {
  level: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
