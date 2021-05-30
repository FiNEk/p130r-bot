import _ from "lodash";
import { getUnixTime, startOfToday } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import Database from "./db";
import PidorResult from "../entity/Result";
import { logger } from "../logger";

export class Game {
  private readonly guildId: string;

  constructor(guildId: string) {
    this.guildId = guildId;
  }

  async playToday(initiatorId: string): Promise<{ result: PidorResult | undefined; isNew: boolean }> {
    const today = utcToZonedTime(startOfToday(), "Europe/Moscow");
    logger.debug(today.toString());
    const unix = getUnixTime(today);
    logger.debug(unix.toString());
    return this.play(unix, initiatorId);
  }

  async play(date: number, initiatorId: string): Promise<{ result: PidorResult | undefined; isNew: boolean }> {
    try {
      let result = await Database.getResult(this.guildId, date);
      if (_.isNil(result)) {
        const user = (await this.isHatedAuthor(initiatorId)) ? initiatorId : await this.roll();
        if (!_.isNil(user)) {
          await Database.addResult(this.guildId, date, user);
          result = await Database.getResult(this.guildId, date);
        }
        return { result: result, isNew: true };
      }
      return { result: result, isNew: false };
    } catch (error) {
      logger.error(error);
      return { result: undefined, isNew: false };
    }
  }

  static getTodayTimestamp(): number {
    const today = utcToZonedTime(startOfToday(), "Europe/Moscow");
    return getUnixTime(today);
  }

  async controlledRoll(allowedPlayers: string[]): Promise<string | undefined> {
    const players = await Database.getPlayers(this.guildId);
    const filtered = players?.filter((player) => allowedPlayers.includes(player.id));
    return _.sample(filtered)?.id;
  }

  async roll(): Promise<string | undefined> {
    const players = await Database.getPlayers(this.guildId);
    return _.sample(players)?.id;
  }

  async registerWinner(guildId: string, unixTimestamp: number, winnerId: string) {
    await Database.addResult(guildId, unixTimestamp, winnerId);
    return Database.getResult(guildId, unixTimestamp);
  }

  async existingResult(guildId: string, unixTimestamp: number) {
    return await Database.getResult(guildId, unixTimestamp);
  }

  async isHatedAuthor(authorId: string): Promise<boolean> {
    const result = !!(await Database.getHatedAuthor(authorId));
    if (result) {
      logger.debug(`Author id was found in hated users`);
    }
    return result;
  }
}
