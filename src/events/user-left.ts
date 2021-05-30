// import db from "../core/db";
// import { GuildMember, PartialGuildMember } from "discord.js";
// import { logger } from "../logger";
// import { isNullishOrEmpty } from "../utils";
//
// // guildMemberRemove
// async function userLeft(member: GuildMember | PartialGuildMember) {
//   if (isNullishOrEmpty(member.user)) {
//     return;
//   }
//   logger.debug(`New user ${member.user.username} LEFT guild ${member.guild.name}`);
//   const existingUser = await db.getGuildUser(member.id, member.guild.id);
//   if (isNullishOrEmpty(existingUser)) {
//     await db.addGuildUser(member.id, member.guild.id);
//     return;
//   }
//   await db.updateGuildUser(member.id, member.guild.id, false);
//   return;
// }
//
// export default userLeft;
