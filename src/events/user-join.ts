import db from "../core/db";
import { GuildMember } from "discord.js";

// guildMemberAdd
async function userJoined(member: GuildMember) {
  await db.updateGuildUser(member.id, member.guild.id, true);
}

export default userJoined;
