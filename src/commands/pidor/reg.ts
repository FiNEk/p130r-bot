import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { logger } from "../../logger";
import Database from "../../core/db";

export default class Reg extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "reg",
            aliases: ["register"],
            group: "pidor",
            memberName: "reg",
            description: "Регистрирует в конкурсе 'Пидор дня' на текущем сервере."
        });
    }

    async run(message: CommandoMessage) {
        try {
            const user = await Database.getUser(message.author.id, message.guild.id, true);
            if (user && user.isPlaying) {
                return message.reply("ты уже зарегистрирован!");
            } else {
                await Database.addUser(message.author.id, message.guild.id, true);
                return message.reply("успешно зарегистрирован!");
            }
        } catch (error) {
            logger.error(error);
            return message.reply("что-то пошло не так.");
        }
    }
}