import Database from "./db";
import _ from "lodash";
import Pidor from "../entity/Result";
import { logger } from "../logger";

export class Game {
  private readonly guildId: string;

  constructor(guildId: string) {
    this.guildId = guildId;
  }

  async getTodayResult(): Promise<{ result: Pidor | undefined; isNew: boolean }> {
    const date = Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000);
    logger.info(date.toString(10));
    return this.getResult(date);
  }

  async getResult(date: number): Promise<{ result: Pidor | undefined; isNew: boolean }> {
    try {
      let result = await Database.getResult(this.guildId, date);
      logger.info(JSON.stringify(result));
      if (result === undefined) {
        const user = await this.roll();
        if (user !== undefined) {
          await Database.addResult(this.guildId, date, user);
          result = await Database.getResult(this.guildId, date);
        }
        return { result: result, isNew: true };
      } else {
        return { result: result, isNew: false };
      }
    } catch (error) {
      logger.error(error);
      return { result: undefined, isNew: false };
    }
  }

  async roll(): Promise<string | undefined> {
    const players = await Database.getPlayers(this.guildId);
    return _.sample(players)?.id;
  }
}
