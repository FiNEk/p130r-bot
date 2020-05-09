// load .env
import { config } from "dotenv";
config();
// load other stuff
import "reflect-metadata";
import { Engine } from "./core/engine";
import { logger } from "./logger";
// start
new Engine().init().then(() => {
  logger.info("READY");
});
