import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import Database from "../../core/db";

export default class Unreg extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "unreg",
      aliases: ["unregister"],
      group: "pidor",
      memberName: "unreg",
      description: "Выводит из участия в конкурсе 'Пидор дня' на текущем сервере.",
    });
  }

  async run(message: CommandoMessage) {
    try {
      const user = await Database.getPlayer(message.author.id, message.guild.id, true);
      if (user) {
        await Database.addPlayer(message.author.id, message.guild.id, false);
        return message.reply("ты больше не участвуешь в фестивале.");
      } else {
        return message.reply("ты не зарегистрирован.");
      }
    } catch (error) {
      logger.error(error);
      return message.reply("что-то пошло не так.");
    }
  }
}
