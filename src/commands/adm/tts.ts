import fs from "fs";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { logger } from "../../logger";
import yaTTS from "../../core/ya-tts";

export default class TTS extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "tts",
      aliases: ["say"],
      group: "adm",
      memberName: "tts",
      description: "Произнести `<текст>` в голосовом канале",
      args: [
        {
          key: "text",
          prompt: "Текст который нужно произнести",
          type: "string",
        },
      ],
      clientPermissions: ["MANAGE_MESSAGES"],
      userPermissions: ["MANAGE_MESSAGES"],
    });
  }

  async run(message: CommandoMessage, { text }: { text: string }) {
    try {
      if (message.member.voice.channel) {
        const oggStream = await yaTTS.synthesize(text, {
          format: "oggopus",
          voice: "filipp",
        });
        const connection = await message.member.voice.channel.join();
        const audioDispatcher = connection
          .play(oggStream, {
            type: "ogg/opus",
          })
          .on("end", () => {
            console.log("dispatcher finish");
            connection.disconnect();
          });
        return new Promise<Message | null>((resolve, reject) => {
          connection.on("disconnect", () => {
            resolve(null);
          });
          audioDispatcher.on("error", (error) => {
            logger.error(error);
            connection.disconnect();
            reject(message.reply(error.message));
          });
        });
      }
      return message.reply("Нужно находится в голосовом канале");
    } catch (error) {
      return message.reply(error.message);
    }
  }
}
