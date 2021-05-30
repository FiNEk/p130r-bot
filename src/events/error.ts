import { logger } from "../logger";

function error(error: Error) {
  logger.error(error.message, [error]);
}

export default error;
