import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import Database from "../../core/db";
import Pidor from "../../entity/Result";
import _ from "lodash";
import { User, MessageEmbed } from "discord.js";

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
          prompt: "Опционально можно добавить параметр: me - статистика для себя, top - за текущий год, all - за все время",
          type: "string",
          default: "top",
        },
      ],
    });
  }

  async run(message: CommandoMessage, { type }: {type: string }) {
    try {
      const results = await Database.getGuildResults(message.guild.id);
      if (results === undefined) {
        return message.say('Похоже, пидоров здесь еще нет');
      }
      switch (type) {
        case "all":
          const all = this.all(results);
          const allEmbed = new MessageEmbed()
                              .setTitle('Результаты за все время')
                              .setColor(0x42aaf5)
                              .setDescription(all.map((item) => `${message.guild.member(new User(this.client, { id: item.userId }))?.displayName} - ${item.wins} ${(item.wins === 2 || item.wins === 3) ? 'раза' : 'раз'}`).join('\r\n'));
          return message.embed(allEmbed);
        case "me":
          return message.reply(`ты был пидором дня ${this.personal(results, message.author.id)} раз`);
        case "top":
        default:
          const top = this.top(results);
          const topEmbed = new MessageEmbed()
                              .setTitle('Результаты за текущий год')
                              .setColor(0x42aaf5)
                              .setDescription(top.map((item) => `${message.guild.member(new User(this.client, { id: item.userId }))?.displayName} - ${item.wins} ${(item.wins === 2 || item.wins === 3) ? 'раза' : 'раз'}`).join('\r\n'));
          return message.embed(topEmbed);
      }
    } catch (error) {
      logger.error(error);
      return message.reply("что-то пошло не так.");
    }
  }

  private personal(results: Pidor[], userId: string): number {
    const currentYear = new Date().getUTCFullYear();
    return results.filter((pidor) => (pidor.winnerId === userId) && (currentYear === new Date(pidor.resultTimestamp*1000).getUTCFullYear())).length;
  }

  private top(results: Pidor[]): { userId: string, wins: number }[] {
    const currentYear = new Date().getUTCFullYear();
    return this.all(results.filter((pidor) => currentYear === new Date(pidor.resultTimestamp*1000).getUTCFullYear()));
  }

  private all(results: Pidor[]): { userId: string, wins: number }[] {
    let result: { userId: string, wins: number }[] = [];
    const ordered = _.take(_.orderBy(_.groupBy(results, 'winnerId'), 'length'), 10);
    for (let pidor of ordered) {
      result.push({ userId: pidor[0].winnerId, wins: pidor.length });
    }
    return result;
  }
}
