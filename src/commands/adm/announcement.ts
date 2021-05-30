import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import db from "../../core/db";

export default class Announcement extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "announcement",
      aliases: ["announcer", "ann"],
      group: "adm",
      memberName: "announcement",
      description: "Добавить новый или получить случайный анонс победителя олимпиады ПИДОР ДНЯ",
      args: [
        {
          key: "command",
          prompt: "add or get",
          type: "string",
          default: "get",
          oneOf: ["add", "get"],
        },
        {
          key: "text",
          prompt: "какой текст добавить",
          type: "string",
        },
      ],
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
    });
  }

  async run(message: CommandoMessage, { command, text }: { command: "add" | "get"; text: string }) {
    try {
      if (command === "get") {
        const randomAnnouncement = await db.getRandomAnnouncement();
        return message.reply(randomAnnouncement?.text ?? "Что-то пошло не так...");
      } else if (command === "add") {
        if (text.length === 0) {
          return message.reply("нельзя добавить пустой анонс");
        }
        if (!/{winner}/.test(text)) {
          return message.reply("не найден {winner}");
        }
        await db.addAnnouncement(text);
        return message.reply("успешно добавлено");
      } else {
        return message.reply("неизвестная команда");
      }
    } catch (error) {
      logger.error(error);
      return message.reply(error.message);
    }
  }
}
