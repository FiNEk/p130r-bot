import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";

export default class SetActivity extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "activity",
      group: "misc",
      memberName: "activity",
      description: "Выставить новый статус бота",
      args: [
        {
          key: "text",
          prompt: "Какой статус установить?",
          type: "string",
        },
      ],
      ownerOnly: true,
    });
  }

  async run(message: CommandoMessage, { text }: { text: string }) {
    try {
      this.client.user?.setActivity(text);
      return null;
    } catch (error) {
      logger.error(error.message, [error]);
      return message.reply(error.message);
    }
  }
}
