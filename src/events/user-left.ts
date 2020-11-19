import db from "../core/db";
import { GuildMember } from "discord.js";

// guildMemberRemove
async function userLeft(member: GuildMember) {
  await db.updateGuildUser(member.id, member.guild.id, false);
}

export default userLeft;
