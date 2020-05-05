import { getConnection } from "typeorm";
import { logger } from "../logger";
import { User as PidorUser, Token } from "../entity";

class Database {
  async getUser(userId: string, guildId: string, playing?: boolean): Promise<PidorUser | undefined> {
    try {
      return getConnection()
        .getRepository(PidorUser)
        .findOne({
          where: {
            id: userId,
            guildId: guildId,
            isPlaying: playing ?? false,
          },
        });
    } catch (error) {
      logger.error(error);
      return undefined;
    }
  }

  async addUser(userId: string, guildId: string, playing?: boolean) {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(PidorUser)
        .values({
          id: userId,
          guildId: guildId,
          isPlaying: playing ?? true,
        })
        .onConflict(`(id, guildId) DO UPDATE SET isPlaying=${playing ?? true ? 1 : 0}`)
        .execute();
    } catch (error) {
      logger.error(error);
    }
  }

  async addToken(token: string, expiresAt: number) {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Token)
        .values({
          expiresAt,
          token,
        })
        .execute();
    } catch (error) {
      logger.error("addToken");
      logger.error(error);
    }
  }
}

const db = new Database();
export default db;
