import _ from "lodash";
import { startOfToday, getUnixTime } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import Database from "./db";
import Pidor from "../entity/Result";
import { logger } from "../logger";

export class Game {
  private readonly guildId: string;

  constructor(guildId: string) {
    this.guildId = guildId;
  }

  async getTodayResult(): Promise<{ result: Pidor | undefined; isNew: boolean }> {
    const today = utcToZonedTime(startOfToday(), "Europe/Moscow");
    logger.debug(today.toString());
    const unix = getUnixTime(today);
    logger.debug(unix.toString());
    return this.getResult(unix);
  }

  async getResult(date: number): Promise<{ result: Pidor | undefined; isNew: boolean }> {
    try {
      let result = await Database.getResult(this.guildId, date);
      logger.debug(JSON.stringify(result));
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
