import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import appConfig from "../../app.config";

export default class UnknownCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "unknown-command",
      group: "util",
      memberName: "unknown-command",
      description: "Откат для неизвестных команд.",
      examples: ["unknown-command kickeverybodyever"],
      unknown: true,
      hidden: true,
    });
  }
  run(msg: CommandoMessage): Promise<Message | Message[] | null> | null {
    return msg.reply(`Команда не найдена. ${appConfig.prefix}help чтобы увидеть помощь по доступным командам.`);
  }
}
