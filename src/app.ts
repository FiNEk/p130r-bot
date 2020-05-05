import "reflect-metadata";
import { Engine } from "./core/engine";
import { logger } from "./logger";

new Engine().init().then(() => {
  logger.info("READY");
});
