import { Equal, getConnection } from "typeorm";
import { logger } from "../logger";
import PidorUser from "../entity/User";
import Pidor from "../entity/Result";
import Token from "../entity/Token";
import Announcement from "../entity/Announcement";

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

  async addUser(userId: string, guildId: string, playing?: boolean): Promise<void> {
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

  async addToken(token: string, expiresAt: number): Promise<void> {
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
      logger.error(error);
    }
  }

  async getToken(): Promise<Token | undefined> {
    try {
      return getConnection().getRepository(Token).createQueryBuilder("token").orderBy("token.tid", "ASC").getOne();
    } catch (error) {
      logger.error(error);
    }
  }

  async getPlayers(guildId: string): Promise<PidorUser[] | undefined> {
    try {
      return getConnection()
        .getRepository(PidorUser)
        .find({
          where: { guildId: guildId },
        });
    } catch (error) {
      logger.error(error);
    }
  }

  async getResult(guildId: string, date: number): Promise<Pidor | undefined> {
    try {
      return getConnection()
        .getRepository(Pidor)
        .findOne({
          where: [{ guildId: guildId }, { resultDate: Equal(date) }],
        });
    } catch (error) {
      logger.error(error);
    }
  }

  async addResult(guildId: string, time: number, winnerId: string) {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Pidor)
        .values({
          guildId: guildId,
          resultTimestamp: time,
          winnerId: winnerId,
        })
        .execute();
    } catch (error) {
      logger.error(error);
    }
  }

  async addAnnouncement(text: string): Promise<void> {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Announcement)
        .values({
          text,
        })
        .execute();
    } catch (error) {
      logger.error(error);
    }
  }

  async getRandomAnnouncement(): Promise<Announcement | undefined> {
    try {
      return getConnection().getRepository(Announcement).createQueryBuilder().orderBy("RANDOM()").getOne();
    } catch (error) {
      logger.error(error);
    }
  }

  async getGuildResults(guildId: string): Promise<Pidor[] | undefined> {
    try {
      return getConnection()
        .getRepository(Pidor)
        .find({
          where: { guildId: guildId },
        });
    } catch (error) {
      logger.error(error);
    }
  }
}

const db = new Database();
export default db;
