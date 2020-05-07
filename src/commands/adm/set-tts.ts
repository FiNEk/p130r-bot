import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import yaTTS from "../../core/ya-tts";

export default class SetTTS extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "set-tts",
      group: "adm",
      memberName: "set-tts",
      description:
        'Настройки ТТС. Доступные значения `"oksana" | "jane" | "omazh" | "zahar" | "erkanyavas" | "alena" | "filipp" | "alyss" | "nick"`',
      args: [
        {
          key: "voice",
          prompt:
            'Установить другой голос. Доступные значения `"oksana" | "jane" | "omazh" | "zahar" | "erkanyavas" | "alena" | "filipp" | "alyss" | "nick"`',
          type: "string",
        },
      ],
      // clientPermissions: ["MANAGE_MESSAGES"],
      // userPermissions: ["MANAGE_MESSAGES"],
      ownerOnly: true,
    });
  }

  async run(message: CommandoMessage, { voice }: { voice: string }) {
    try {
      yaTTS.voice = voice;
      return message.reply("успешно изменено");
    } catch (error) {
      logger.error(error);
      return message.reply(error.message);
    }
  }
}
