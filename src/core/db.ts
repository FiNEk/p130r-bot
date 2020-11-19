import { Equal, getConnection, InsertResult, UpdateResult } from "typeorm";
import { logger } from "../logger";
import PidorUser from "../entity/User";
import Pidor from "../entity/Result";
import Token from "../entity/Token";
import Announcement from "../entity/Announcement";
import HatedUser from "../entity/HatedUsers";
import ActiveGuildUser from "../entity/ActiveGuildUser";
import { isNullishOrEmpty } from "../utils";

class Database {
  async updateGuildUser(
    userId: string,
    guildId: string,
    joined: boolean,
  ): Promise<UpdateResult | InsertResult | undefined> {
    try {
      const connection = await getConnection();
      const existingUser = connection.getRepository(ActiveGuildUser).findOne({
        where: {
          id: userId,
          guildId,
        },
      });

      if (isNullishOrEmpty(existingUser)) {
        return await connection
          .createQueryBuilder()
          .insert()
          .into(ActiveGuildUser)
          .values([
            {
              id: userId,
              guildId,
              isActiveUser: joined,
            },
          ])
          .execute();
      }

      return await connection
        .createQueryBuilder()
        .update(ActiveGuildUser)
        .set({ isActiveUser: joined })
        .where("id = :id", { id: userId })
        .execute();
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

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
      logger.error(error.message, [error]);
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
      logger.error(error.message, [error]);
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
      logger.error(error.message, [error]);
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
      logger.error(error.message, [error]);
    }
  }

  async getResult(guildId: string, date: number): Promise<Pidor | undefined> {
    try {
      return getConnection()
        .getRepository(Pidor)
        .findOne({
          where: { guildId: guildId, resultTimestamp: Equal(date) },
        });
    } catch (error) {
      logger.error(error.message, [error]);
    }
  }

  async addResult(guildId: string, time: number, winnerId: string): Promise<void> {
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
      logger.error(error.message, [error]);
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
      logger.error(error.message, [error]);
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
      logger.error(error.message, [error]);
    }
  }

  async getHatedAuthor(userId: string): Promise<HatedUser | undefined> {
    try {
      return getConnection()
        .getRepository(HatedUser)
        .findOne({
          where: { id: userId },
        });
    } catch (error) {
      logger.error(error.message, [error]);
    }
  }

  async addHatedAuthor(userId: string): Promise<void> {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(HatedUser)
        .values({
          id: userId,
        })
        .execute();
    } catch (error) {
      logger.error(error.message, [error]);
    }
  }
}

const db = new Database();
export default db;
