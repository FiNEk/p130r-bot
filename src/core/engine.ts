import { CommandoClient } from "discord.js-commando";
import { createConnection } from "typeorm";
import { logger } from "../logger";
import config from "../app.config";
import yaTTS from "./ya-tts";
import * as ChatCommands from "../commands";
import _ from "lodash";

export class Engine {
  public commandoClient = new CommandoClient({
    commandPrefix: config.prefix,
    owner: config.botOwners,
  });
  private readonly discordToken: string = config.token.discord;

  public async init(): Promise<void> {
    try {
      //sqlite
      await createConnection();
      //tts
      await yaTTS.init();
      //register commands
      const commandsArr = _.valuesIn(ChatCommands);
      logger.debug(`${commandsArr.length} commands loaded`);
      this.commandoClient.registry
        .registerDefaultTypes()
        .registerGroups([
          ["adm", "Administration commands"],
          ["misc", "Misc commands"],
          ["pidor", "Contest commands"],
        ])
        .registerDefaultGroups()
        .registerDefaultCommands({ eval: false, unknownCommand: false })
        .registerCommands(commandsArr);
      //register events
      this.registerEvents();
      //login to discord
      await this.commandoClient.login(this.discordToken);
    } catch (error) {
      logger.error("Startup failed");
      logger.error(error);
      process.exit(1);
    }
  }

  private registerEvents(): void {
    this.commandoClient.once("ready", () => {
      if (this.commandoClient.user) {
        logger.info(`Logged in as ${this.commandoClient.user.tag}!`);
      }
    });
    this.commandoClient.on("error", (error) => {
      logger.error(error.message, [error]);
    });
  }
}
