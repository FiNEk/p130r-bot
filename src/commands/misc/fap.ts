import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { MessageEmbed } from "discord.js";
import Pornhub from "pornhub.js";
import { logger } from "../../logger";

export default class Fap extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "fap",
      group: "misc",
      memberName: "fap",
      description: "Находит первое видео из поиска Pornhub, сооветствующее запросу",
      args: [
        {
          key: "query",
          prompt: "Можно указать свой текст запроса",
          type: "string",
          default: "gay bbc",
        },
      ],
      throttling: {
        usages: 1,
        duration: 60,
      },
    });
  }

  async run(message: CommandoMessage, { query }: { query: string }) {
    try {
      let pornhub = new Pornhub();
      logger.info(query);
      let search = await pornhub.search("Video", query);
      let first = search.data[0];
      logger.info(JSON.stringify(first));
      let embed = new MessageEmbed()
        .setTitle(first.title)
        .setColor(0xadd8e6)
        .setThumbnail(first.preview)
        .setURL(first.url)
        .setDescription(`\nДлительность: ${first.duration}\nКачество: ${first.hd ? "высокое" : "низкое"}`);
      return message.replyEmbed(embed);
    } catch (error) {
      logger.error(error.message, [error]);
      return message.reply(error.message);
    }
  }

  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
