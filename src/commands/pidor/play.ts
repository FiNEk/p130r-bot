import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import { Game } from "../../core/game";
import { User, Message } from "discord.js";

export default class Play extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "play",
      aliases: ["pidor", "pidor-play", "pidoroll"],
      group: "pidor",
      memberName: "play",
      description: "Выбирает победителя конкурса 'Пидор дня' на текущем сервере.",
    });
  }

  async run(message: CommandoMessage) {
    try {
      const game = new Game(message.guild.id);
      const result = await game.getTodayResult();
      const winnerUser = await new User(this.client, {id: result.result?.winnerId }).fetch();
      const winnerMember = await message.guild.member(winnerUser)?.fetch();
      if (result.isNew) {
        return message.say(`Победителем сегодняшней олимпиады становится ${winnerMember ?? winnerUser?.username ?? 'какой-то хуй'}`);
      } else {
        return message.say(`Пидор дня уже определен, это ${winnerMember?.displayName ?? winnerUser?.username ?? 'какой-то хуй'}`);
      }
    } catch (error) {
      logger.error(error);
      return message.reply("что-то пошло не так.");
    }
  }
}
