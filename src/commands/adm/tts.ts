import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { VoiceConnection } from "discord.js";
import { logger } from "../../logger";
import yaTTS from "../../core/ya-tts";
import { ReadableStreamBuffer } from "stream-buffers";
import path from "path";

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
        });
        const connection = await message.member.voice.channel.join();
        await this.playDrumRoll(connection);
        await this.playAudioStream(oggStream, connection);
        connection.disconnect();
        return null;
      }
      return message.reply("Нужно находится в голосовом канале");
    } catch (error) {
      return message.reply(error.message);
    }
  }

  private async playDrumRoll(connection: VoiceConnection): Promise<void> {
    try {
      const drumPath = path.resolve(__dirname, "../../../", "assets/drumroll.mp3");
      return new Promise((resolve, reject) => {
        const drumDispatcher = connection.play(drumPath);
        drumDispatcher.on("finish", () => resolve());
        drumDispatcher.on("error", (error) => {
          logger.error(error);
          connection.disconnect();
          reject(error);
        });
      });
    } catch (error) {
      logger.error(error);
      connection.disconnect();
    }
  }

  private async playAudioStream(stream: ReadableStreamBuffer, connection: VoiceConnection): Promise<void> {
    try {
      return new Promise<void>((resolve, reject) => {
        const audioDispatcher = connection
          .play(stream, {
            type: "ogg/opus",
          })
          .on("finish", () => resolve());
        stream.stop();
        audioDispatcher.on("error", (error) => {
          logger.error(error);
          connection.disconnect();
          reject(error.message);
        });
      });
    } catch (error) {
      logger.error(error);
      connection.disconnect();
    }
  }
}
