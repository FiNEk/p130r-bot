// import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
// import { User } from "discord.js";
//
// export default class Nuke extends Command {
//   constructor(client: CommandoClient) {
//     super(client, {
//       name: "nuke",
//       aliases: ["bomba", "bombanut", "wipe"],
//       group: "adm",
//       memberName: "nuke",
//       description: "Удаляет все сообщения за последние `<N-минут>` из чата",
//       args: [
//         {
//           key: "time",
//           prompt: "Необходимо указать количество минут",
//           type: "integer",
//         },
//         {
//           key: "user",
//           prompt: "Можно указать юзера (через @)",
//           type: "user",
//           default: 0,
//         },
//       ],
//       clientPermissions: ["MANAGE_MESSAGES"],
//       userPermissions: ["MANAGE_MESSAGES"],
//     });
//   }
//
//   async run(message: CommandoMessage, { time, user }: { time: number; user: User }) {
//     try {
//       const timestamp = +new Date() - time * 60000;
//       // TODO fetch fatter chunks
//       const allMessages = await message.channel.messages.fetch({
//         before: message.id,
//         limit: 100,
//       });
//       const toRemove = allMessages.filter((m) => {
//         // TODO check if message older than 14 days
//         if (user) {
//           return m.author.username === user.username && m.createdTimestamp >= timestamp;
//         }
//         return m.createdTimestamp >= timestamp;
//       });
//       await message.channel.bulkDelete(toRemove);
//       return message.reply(`вайпанул ${toRemove.size} сообщений в этом канале`);
//     } catch (error) {
//       return message.reply(error.message);
//     }
//   }
// }
