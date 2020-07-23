import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { UserResolvable } from "discord.js";
import { logger } from "../../logger";
import _ from "lodash";
import TTS from "./tts";

export default class TTSat extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "ttsat",
      aliases: ["sayat"],
      group: "adm",
      memberName: "ttsat",
      description: "Произнести `<юзеру>` `<текст>` в голосовом канале",
      args: [
        {
          key: "user",
          type: "user",
          prompt: "Юзер которому адресовать сообщение",
        },
        {
          key: "text",
          prompt: "Текст который нужно произнести",
          type: "string",
        },
      ],
      throttling: {
        usages: 1,
        duration: 30,
      },
      clientPermissions: ["SPEAK"],
      // userPermissions: ["MANAGE_MESSAGES"],
    });
  }

  public async run(message: CommandoMessage, { text, user }: { text: string; user?: UserResolvable }) {
    try {
      if (!_.isNil(user)) {
        const guildMember = message.guild.member(user);
        if (!_.isNil(guildMember) && !_.isNil(guildMember.voice.channel)) {
          await new TTS(this.client).play(guildMember.voice.channel, text);
          return null;
        } else {
          return message.reply("Юзер должен находится в голосовом канале.");
        }
      } else {
        return message.reply("Юзер не найден");
      }
    } catch (error) {
      logger.error(error.message, [error]);
      return message.reply(error.message);
    }
  }
}
