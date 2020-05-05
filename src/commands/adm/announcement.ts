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
          prompt: "add | get",
          type: "string",
          default: "get",
        },
        {
          key: "text",
          prompt: "какой текст добавить",
          type: "string",
          default: " ",
        },
      ],
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
    });
  }

  async run(message: CommandoMessage, { command, text }: { command: string; text: string }) {
    try {
      if (command === "get") {
        const randomAnnouncement = await db.getRandomAnnouncement();
        return message.reply(randomAnnouncement?.text);
      } else if (command === "add") {
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
