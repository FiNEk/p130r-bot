import "reflect-metadata";
import path from "path";
import { CommandoClient } from "discord.js-commando";
import config from "config";
import { logger } from "../logger";
import { createConnection, Connection } from "typeorm";

export class Engine {
  public db: Connection;
  public commandoClient = new CommandoClient({
    commandPrefix: config.get("prefix"),
  });
  private readonly TOKEN: string = config.get("token.discord");

  public async init() {
    if (!this.TOKEN) {
      logger.error("token not found");
      process.exit(1);
    }
    this.db = await createConnection();
    //register commands
    this.commandoClient.registry
      .registerDefaultTypes()
      .registerGroups([
        ["misc", "Misc commands"],
        ["adm", "Administration commands"],
        ["audio", "Audio related commands"],
      ])
      .registerDefaultGroups()
      .registerDefaultCommands()
      .registerCommandsIn(path.resolve(__dirname, "../", "commands"));
    //register events
    this.registerEvents();
    //login to discord
    await this.commandoClient.login(this.TOKEN);
  }

  private registerEvents() {
    this.commandoClient.once("ready", () => {
      if (this.commandoClient.user) {
        logger.info(`Logged in as ${this.commandoClient.user.tag}!`);
        this.commandoClient.user.setActivity("Oppressing minorities").catch((err) => {
          logger.error(err.message, [err]);
        });
      }
    });
    this.commandoClient.on("error", (error) => {
      logger.error(error.message, error);
    });
  }
}
