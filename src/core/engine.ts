import { CommandoClient } from "discord.js-commando";
import { createConnection } from "typeorm";
import { logger } from "../logger";
import config from "../app.config";
import yaTTS from "./ya-tts";
import * as ChatCommands from "../commands";
import * as DiscordEvents from "../events";
import _ from "lodash";
import { isNullishOrEmpty } from "../utils";
import db from "./db";

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
      //sync
      await this.syncServers();
    } catch (error) {
      logger.error("Startup failed");
      logger.error(error.message, [error]);
      process.exit(1);
    }
  }

  private registerEvents(): void {
    this.commandoClient.once("ready", () => {
      if (this.commandoClient.user) {
        logger.info(`Logged in as ${this.commandoClient.user.tag}!`);
      }
    });
    this.commandoClient.on("error", DiscordEvents.error);
    this.commandoClient.on("guildMemberAdd", DiscordEvents.userJoined);
    this.commandoClient.on("guildMemberRemove", DiscordEvents.userLeft);
  }

  private async syncServers() {
    logger.info("Syncing servers...");
    const promises = [];
    for (const guildElement of Array.from(this.commandoClient.guilds.cache)) {
      const [guildId, Guild] = guildElement;
      logger.debug(`Syncing ${guildId}`);
      if (!isNullishOrEmpty(Guild)) {
        const members = (await Guild.members.fetch()).map((member) => member.id);
        promises.push(db.syncGuild(guildId, members));
      }
    }
    await Promise.all(promises);
    logger.info("Server sync done!");
  }
}
