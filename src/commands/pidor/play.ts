import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import { Game } from "../../core/game";
import Database from "../../core/db";
import { isNil as isNullish } from "lodash";
import { isNullishOrEmpty } from "../../utils";

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
      const unixNow = Game.getTodayTimestamp();
      const existingOne = await game.existingResult(message.guild.id, unixNow);
      const currentGuildMembers = await message.guild.members.fetch();

      if (!isNullish(existingOne)) {
        const existingWinner = currentGuildMembers.get(existingOne.winnerId);
        return message.say(`Пидор дня уже определен, это ${existingWinner?.displayName ?? "какой-то хуй"}`);
      }

      const randomPlayerId = await game.controlledRoll(currentGuildMembers.keyArray());
      if (isNullishOrEmpty(randomPlayerId)) {
        return message.say("Невозможно определить пидора дня, на сервере недостаточно активных игроков.");
      }
      if (!currentGuildMembers.has(randomPlayerId)) {
        return message.say(
          "Пидор дня был обнаружен, но похоже что он покинул этот сервер (вот пидор!). Попробуйте запустить игру ещё раз.",
        );
      }
      const winner = currentGuildMembers.get(randomPlayerId);
      await game.registerWinner(message.guild.id, unixNow, randomPlayerId);
      const announcement = await Database.getRandomAnnouncement();
      const winnerMessage = announcement?.text.replace(/{winner}/gi, winner?.toString() ?? "какой-то хуй");
      return message.say(winnerMessage);
    } catch (error) {
      logger.error(error);
      return message.reply("что-то пошло не так.");
    }
  }
}
