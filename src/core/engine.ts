import path from "path";
import { CommandoClient } from "discord.js-commando";
import config from "config";
import { logger } from "../logger";
import yaTTS from "./ya-tts";
import { promises as fs } from "fs";

export class Engine {
  public commandoClient = new CommandoClient({
    commandPrefix: config.get("prefix"),
  });
  private readonly TOKEN: string = config.get("token.discord");

  public async init(): Promise<void> {
    if (!this.TOKEN) {
      logger.error("token not found");
      process.exit(1);
    }
    //register commands
    this.commandoClient.registry
      .registerDefaultTypes()
      .registerGroups([
        ["adm", "Administration commands"],
        ["misc", "Misc commands"],
        ["pidor", "Contest commands"],
      ])
      .registerDefaultGroups()
      .registerDefaultCommands()
      .registerCommandsIn(path.resolve(__dirname, "../", "commands"));
    //register events
    this.registerEvents();
    //login to discord
    await this.commandoClient.login(this.TOKEN);

    // tts helloworld, remove later
    try {
      await yaTTS.refreshIamToken();
      const file = await yaTTS.synthesize("привет мир", { format: "oggopus" });
      await fs.writeFile(path.resolve(__dirname, "../../", "output.ogg"), file, { encoding: "utf8" });
    } catch (e) {
      logger.error(e, [e]);
    }
  }

  private registerEvents(): void {
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
