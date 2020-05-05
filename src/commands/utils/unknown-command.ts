import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";

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
    return msg.reply(
      `Команда не найдена. ${msg.anyUsage(
        "help",
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        msg.guild ? undefined : null,
        msg.guild ? undefined : null,
      )} чтобы увидеть помощь по доступным командам.`,
    );
  }
}
