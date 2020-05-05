import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import { Game } from "../../core/game";
import { User } from "discord.js";
import Database from "../../core/db";
import TTS from "../adm/tts";

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
      const winnerUser = await new User(this.client, { id: result.result?.winnerId }).fetch();
      const winnerMember = await message.guild.member(winnerUser)?.fetch();
      const announcement = await Database.getRandomAnnouncement();
      const winnerMessage = announcement?.text.replace(
        "{winner}",
        winnerMember?.toString() ?? winnerUser?.username ?? "какой-то хуй",
      );
      const ttsMessage = announcement?.text.replace("{winner}", winnerMember?.displayName ?? "какой-то хуй") ?? "";
      if (result.isNew) {
        new TTS(this.client, winnerMessage).run(message, { text: ttsMessage });
        return null;
      } else {
        return message.say(
          `Пидор дня уже определен, это ${winnerMember?.displayName ?? winnerUser?.username ?? "какой-то хуй"}`,
        );
      }
    } catch (error) {
      logger.error(error);
      return message.reply("что-то пошло не так.");
    }
  }
}
