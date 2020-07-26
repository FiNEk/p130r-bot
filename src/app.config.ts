import nodeConfig from "config";
import { logger } from "./logger";

// Про config/*.json
// default.json загружается всегда и первым по порядку
// все остальное (development или production) загружается после и перезаписывает/дополняет существующие значения.

interface AppConfig {
  prefix: string;
  botOwners: string[];
  token: {
    discord: string;
  };
}

const appConfig: AppConfig = {
  token: {
    discord: nodeConfig.get<string>("token.discord"),
  },
  prefix: nodeConfig.get<string>("prefix"),
  botOwners: nodeConfig.get<string[]>("botOwners") ?? [],
};

if (!appConfig.token.discord) {
  logger.error("DISCORD TOKEN NOT FOUND, EXITING");
  process.exit(1);
}

logger.info("Config loaded");
logger.debug(JSON.stringify(appConfig, null, 2));

export default appConfig;
