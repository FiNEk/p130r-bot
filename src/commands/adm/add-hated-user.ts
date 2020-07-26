import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { User } from "discord.js";
import Database from "../../core/db";
import { logger } from "../../logger";

export default class AddHatedUser extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "hate",
      group: "adm",
      memberName: "hate",
      description: "Добавить юзера в список плохих мальчиков и девочек",
      args: [
        {
          key: "user",
          prompt: "Какого юзера ненавидеть? (@user)",
          type: "user",
        },
      ],
      ownerOnly: true,
    });
  }

  async run(message: CommandoMessage, { user }: { user: User }) {
    try {
      if (user) {
        const alreadyExists = await Database.getHatedAuthor(user.id);
        if (!alreadyExists) {
          await Database.addHatedAuthor(user.id);
          return message.reply("Добавлено!");
        }
        return message.reply("Уже добавлен");
      }
      return null;
    } catch (error) {
      logger.error(error);
      return message.reply(error.message);
    }
  }
}
