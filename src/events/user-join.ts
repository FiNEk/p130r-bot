import db from "../core/db";
import { GuildMember } from "discord.js";
import { logger } from "../logger";
import { isNullishOrEmpty } from "../utils";

// guildMemberAdd
async function userJoined(member: GuildMember) {
  logger.debug(`New user ${member.user.username} JOINED guild ${member.guild.name}`);
  const existingUser = await db.getGuildUser(member.id, member.guild.id);
  if (isNullishOrEmpty(existingUser)) {
    await db.addGuildUser(member.id, member.guild.id);
    return;
  }
  await db.updateGuildUser(member.id, member.guild.id, true);
}

export default userJoined;
