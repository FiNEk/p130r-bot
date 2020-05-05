import fs from "fs";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, VoiceChannel } from "discord.js";
import { logger } from "../../logger";
import yaTTS from "../../core/ya-tts";
import { ReadableStreamBuffer } from "stream-buffers";

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
        await this.playAudioStream(oggStream, message.member.voice.channel);
        return null;
      }
      return message.reply("Нужно находится в голосовом канале");
    } catch (error) {
      return message.reply(error.message);
    }
  }

  private async playAudioStream(stream: ReadableStreamBuffer, channel: VoiceChannel): Promise<void> {
    const connection = await channel.join();
    const audioDispatcher = connection
      .play(stream, {
        type: "ogg/opus",
      })
      .on("finish", () => connection.disconnect());
    stream.stop();
    return new Promise<void>((resolve, reject) => {
      connection.on("disconnect", () => {
        resolve();
      });
      audioDispatcher.on("error", (error) => {
        logger.error(error);
        connection.disconnect();
        reject(error.message);
      });
    });
  }
}
