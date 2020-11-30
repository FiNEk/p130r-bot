import { Equal, getConnection, InsertResult, UpdateResult } from "typeorm";
import { difference } from "lodash";
import { logger } from "../logger";
import PidorPlayer from "../entity/PidorPlayer";
import PidorResult from "../entity/Result";
import YandexToken from "../entity/YandexToken";
import PidorAnnouncement from "../entity/PidorAnnouncement";
import HatedUser from "../entity/HatedUsers";
import User from "../entity/User";
import { isNullishOrEmpty } from "../utils";

class Database {
  async syncGuild(guildId: string, userIdsToSync: string[]): Promise<void> {
    try {
      const promises = [];
      const dbGuildUserIds = (await this.getAllGuildUsers(guildId))?.map((user) => user.id);
      const usersWhoLeft = difference(dbGuildUserIds, userIdsToSync);

      for (const userWhoLeft of usersWhoLeft) {
        promises.push(this.updateGuildUser(userWhoLeft, guildId, false));
        promises.push(this.updatePlayer(userWhoLeft, guildId, false));
      }
      await Promise.all(promises);
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

  async getGuildUser(userId: string, guildId: string): Promise<User | undefined> {
    try {
      return getConnection()
        .getRepository(User)
        .findOne({
          where: {
            id: userId,
            guildId,
          },
        });
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

  async getAllGuildUsers(guildId: string): Promise<User[] | undefined> {
    try {
      return getConnection().getRepository(User).find({
        where: {
          guildId,
        },
      });
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

  async addGuildUser(userId: string, guildId: string): Promise<InsertResult | undefined> {
    try {
      return getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            id: userId,
            guildId,
            isActiveUser: true,
          },
        ])
        .execute();
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

  async updateGuildUser(userId: string, guildId: string, joined: boolean): Promise<UpdateResult | undefined> {
    try {
      // const existingUser = await this.getGuildUser(userId, guildId);
      // if (isNullishOrEmpty(existingUser)) {
      //   return this.addGuildUser(userId, guildId);
      // }

      return await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({ isActiveUser: joined })
        .where("id = :id", { id: userId })
        .execute();
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

  async getPlayer(userId: string, guildId: string, playing?: boolean): Promise<PidorPlayer | undefined> {
    try {
      return getConnection()
        .getRepository(PidorPlayer)
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

  async updatePlayer(userId: string, guildId: string, playing: boolean): Promise<UpdateResult | undefined> {
    try {
      return getConnection()
        .createQueryBuilder()
        .update(PidorPlayer)
        .set({ isPlaying: playing })
        .where("id = :id", { id: userId })
        .execute();
    } catch (e) {
      logger.error(e.message, [e]);
    }
  }

  async addPlayer(userId: string, guildId: string, playing?: boolean): Promise<void> {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(PidorPlayer)
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

  async getPlayers(guildId: string): Promise<PidorPlayer[] | undefined> {
    try {
      return getConnection()
        .getRepository(PidorPlayer)
        .find({
          where: { guildId: guildId },
        });
    } catch (error) {
      logger.error(error.message, [error]);
    }
  }

  async addToken(token: string, expiresAt: number): Promise<void> {
    try {
      await getConnection()
        .createQueryBuilder()
        .insert()
        .into(YandexToken)
        .values({
          expiresAt,
          token,
        })
        .execute();
    } catch (error) {
      logger.error(error.message, [error]);
    }
  }

  async getToken(): Promise<YandexToken | undefined> {
    try {
      return getConnection()
        .getRepository(YandexToken)
        .createQueryBuilder("token")
        .orderBy("token.tid", "ASC")
        .getOne();
    } catch (error) {
      logger.error(error);
    }
  }

  async getResult(guildId: string, date: number): Promise<PidorResult | undefined> {
    try {
      return getConnection()
        .getRepository(PidorResult)
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
        .into(PidorResult)
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
        .into(PidorAnnouncement)
        .values({
          text,
        })
        .execute();
    } catch (error) {
      logger.error(error.message, [error]);
    }
  }

  async getRandomAnnouncement(): Promise<PidorAnnouncement | undefined> {
    try {
      return getConnection().getRepository(PidorAnnouncement).createQueryBuilder().orderBy("RANDOM()").getOne();
    } catch (error) {
      logger.error(error);
    }
  }

  async getGuildResults(guildId: string): Promise<PidorResult[] | undefined> {
    try {
      return getConnection()
        .getRepository(PidorResult)
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
