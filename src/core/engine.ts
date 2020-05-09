import config from "config";
import { CommandoClient } from "discord.js-commando";
import { createConnection } from "typeorm";
import { logger } from "../logger";
import yaTTS from "./ya-tts";
import * as ChatCommands from "../commands";
import _ from "lodash";

export class Engine {
  public commandoClient = new CommandoClient({
    commandPrefix: config.get("prefix"),
    owner: ["66140245917179904", "75200170815397888"],
  });
  private readonly DISCORD_TOKEN: string = config.get("token.discord");

  public async init(): Promise<void> {
    if (!this.DISCORD_TOKEN) {
      logger.error("discord token not found");
      process.exit(1);
    }
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
    await this.commandoClient.login(this.DISCORD_TOKEN);
  }

  private registerEvents(): void {
    this.commandoClient.once("ready", () => {
      if (this.commandoClient.user) {
        logger.info(`Logged in as ${this.commandoClient.user.tag}!`);
        this.commandoClient.user.setActivity("Бью дедлайна палкой").catch((err) => {
          logger.error(err.message, [err]);
        });
      }
    });
    this.commandoClient.on("error", (error) => {
      logger.error(error.message, [error]);
    });
    // hate deadline
    // this.commandoClient.on("message", (message) => {
    //   if (message.author.id === "132271100347416576") {
    //     const deadlinePidor = message.guild?.emojis.cache.get("629750562203631656");
    //     if (!_.isNil(deadlinePidor)) {
    //       message.react(deadlinePidor);
    //     }
    //   }
    // });
  }
}
