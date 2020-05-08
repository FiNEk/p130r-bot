import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { VoiceConnection } from "discord.js";
import { logger } from "../../logger";
import yaTTS from "../../core/ya-tts";
import { ReadableStreamBuffer } from "stream-buffers";
import path from "path";
import _ from "lodash";

export default class TTS extends Command {
  private readonly resultMessage?: string;
  private readonly soundEffectRegex: RegExp = /{[a-zA-Z]+}/i;
  constructor(client: CommandoClient, resultMessage?: string) {
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
      throttling: {
        usages: 1,
        duration: 30,
      },
      clientPermissions: ["SPEAK"],
      userPermissions: ["MANAGE_MESSAGES"],
    });
    this.resultMessage = resultMessage;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async run(message: CommandoMessage, { text }: { text: string }) {
    try {
      if (message.member.voice.channel) {
        const sequence = this.parseSequence(text);
        const ttsPromises: Promise<ReadableStreamBuffer>[] = [];
        sequence.forEach((part) => {
          if (!this.soundEffectRegex.test(part)) {
            ttsPromises.push(
              yaTTS.synthesize(part, {
                format: "oggopus",
              }),
            );
          }
        });
        const ttsParts = await Promise.all(ttsPromises);
        const connection = await message.member.voice.channel.join();
        let ttsCursor = 0;
        for (const part of sequence) {
          if (this.soundEffectRegex.test(part)) {
            const soundName = _.trim(part, "{}");
            logger.debug(`playing from file ${soundName}`);
            await this.playFromFile(soundName, connection);
          } else {
            logger.debug("playing TTS");
            await this.playAudioStream(ttsParts[ttsCursor], connection);
            ttsCursor++;
          }
        }
        connection.disconnect();
        if (this.resultMessage !== undefined) {
          return message.say(this.resultMessage);
        } else {
          return null;
        }
      } else {
        if (this.resultMessage !== undefined) {
          return message.say(this.resultMessage);
        } else {
          return message.reply("Нужно находится в голосовом канале");
        }
      }
    } catch (error) {
      return message.reply(error.message);
    }
  }

  private async playFromFile(effectName: string, connection: VoiceConnection): Promise<void> {
    try {
      // TODO вносить название саунда и путь к файлу в базу;
      const fullPath = effectName === "drums" ? path.resolve(__dirname, "../../../", "assets/drumroll.mp3") : "";
      return new Promise((resolve, reject) => {
        logger.debug(`looking for a sound file ${fullPath}`);
        const drumDispatcher = connection.play(fullPath);
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

  private parseSequence(text: string): string[] {
    const words = text.split(" ");
    logger.debug(words);
    const sentences: string[] = [];
    let sentence = "";
    for (const word of words) {
      if (this.soundEffectRegex.test(word)) {
        if (sentence !== "") {
          sentences.push(sentence.trimEnd());
          sentence = "";
        }
        sentences.push(word);
      } else {
        sentence += `${word} `;
      }
    }
    if (sentence !== "") {
      sentences.push(sentence);
    }
    logger.debug(sentences);
    return sentences;
  }
}
