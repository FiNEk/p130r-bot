import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import Database from "../../core/db";
import { fromUnixTime, getYear } from "date-fns";
import Pidor from "../../entity/Result";
import _ from "lodash";
import { MessageEmbed } from "discord.js";
import { pluralize } from "numeralize-ru";
import { randomColor } from "../../utils";

export default class Stat extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "stat",
      aliases: ["pidorstat", "top-pidor"],
      group: "pidor",
      memberName: "stat",
      description: "Отображает статистику игры 'Пидор дня' на текущем сервере.",
      args: [
        {
          key: "type",
          prompt:
            "Опционально можно добавить параметр: me - статистика для себя, top - за текущий год, all - за все время",
          type: "string",
          default: "top",
          oneOf: ["top", "me", "all"],
        },
      ],
    });
  }

  async run(message: CommandoMessage, { type }: { type: string }) {
    try {
      const dbResults = (await Database.getGuildResults(message.guild.id)) ?? [];
      const results = await this.resolveExistingMembers(dbResults, message);
      if (results.length === 0) {
        return message.say("Похоже, пидоров здесь еще нет");
      }
      const wasSomeUsersFiltered = dbResults.length !== results.length;
      switch (type) {
        case "all":
          const all = this.all(results);
          let allEmbed = new MessageEmbed()
            .setTitle("Результаты за все время")
            .setColor(randomColor())
            .addFields(
              all.map((item, idx) => ({
                name: `${idx === 0 ? "👑 " : ""}${message.guild.members.cache.get(item.userId)?.displayName}`,
                value: `● ${item.wins} ${pluralize(item.wins, "раз", "раза", "раз")}`,
              })),
            );
          if (wasSomeUsersFiltered) {
            allEmbed = allEmbed.setFooter("Некоторые пидоры покинули этот сервер, их результаты были скрыты.");
          }
          return message.embed(allEmbed);
        case "me":
          const result = this.personal(results, message.author.id);
          return message.reply(`ты был пидором дня ${result} ${pluralize(result, "раз", "раза", "раз")}`);
        case "top":
        default:
          const top = this.top(results);
          let topEmbed = new MessageEmbed()
            .setTitle("Результаты за текущий год")
            .setColor(randomColor())
            .addFields(
              top.map((item, idx) => ({
                name: `${idx === 0 ? "👑 " : ""}${message.guild.members.cache.get(item.userId)?.displayName}`,
                value: `● ${item.wins} ${pluralize(item.wins, "раз", "раза", "раз")}`,
              })),
            );
          if (wasSomeUsersFiltered) {
            topEmbed = topEmbed.setFooter("Некоторые пидоры покинули этот сервер, их результаты были скрыты.");
          }
          return message.embed(topEmbed);
      }
    } catch (error) {
      logger.error(error);
      return message.reply("что-то пошло не так.");
    }
  }

  private async resolveExistingMembers(results: Pidor[], message: CommandoMessage) {
    const existingMembers = await message.guild.members.fetch();
    return results.filter((result) => existingMembers.has(result.winnerId));
  }

  private personal(results: Pidor[], userId: string): number {
    const currentYear = getYear(new Date());
    return results.filter(
      (pidor) => pidor.winnerId === userId && currentYear === getYear(fromUnixTime(pidor.resultTimestamp)),
    ).length;
  }

  private top(results: Pidor[]): { userId: string; wins: number }[] {
    const currentYear = getYear(new Date());
    return this.all(results.filter((pidor) => currentYear === getYear(fromUnixTime(pidor.resultTimestamp))));
  }

  private all(results: Pidor[]): { userId: string; wins: number }[] {
    const result: { userId: string; wins: number }[] = [];
    const ordered = _.take(_.orderBy(_.groupBy(results, "winnerId"), "length", "desc"), 10);
    for (const pidor of ordered) {
      result.push({ userId: pidor[0].winnerId, wins: pidor.length });
    }
    return result;
  }
}
