import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";

export default class Roll extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "roll",
      group: "misc",
      memberName: "roll",
      description: "Ролл рандомного числа в диапазоне 1 - 100 (по умолчанию)",
      args: [
        {
          key: "range",
          prompt: "Можно предоставить собственный диапазон",
          type: "string",
          default: "1-100",
        },
      ],
    });
  }

  async run(message: CommandoMessage, { range }: { range: string }) {
    try {
      if (range.indexOf("-") === -1) {
        // only max range
        const numOnly = /^[0-9]+$/;
        if (!numOnly.test(range)) return message.reply("максимальный ролл должен быть цифрой");
        const rangeMax = parseInt(range, 10);
        const roll = Roll.randomNumber(1, rangeMax);
        return message.reply(`роллит ${roll}`);
      }
      // full range
      const format = /^[0-9]+-[0-9]+$/;
      if (!format.test(range)) return message.reply("Неправильный формат диапазона. Нужно: `69-420`");
      const dashIndex = range.indexOf("-");
      const rangeMin = parseInt(range.slice(0, dashIndex), 10);
      const rangeMax = parseInt(range.slice(dashIndex + 1), 10);
      if (rangeMin > rangeMax) return message.reply("минимум не может быть больше максимума");
      const roll = Roll.randomNumber(rangeMin, rangeMax);
      return message.reply(`роллит ${roll}`);
    } catch (error) {
      logger.error(error.message, [error]);
      return message.reply(error.message);
    }
  }

  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
