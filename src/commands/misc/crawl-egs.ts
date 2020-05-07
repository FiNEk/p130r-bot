import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import puppeteer from "puppeteer";
import { logger } from "../../logger";

type EgsCrawlResult = {
  gameName: string;
  gameUrl: string;
  coverUrl: string;
  freeUntil: string;
};

export default class FreeGame extends Command {
  private readonly coverXpath =
    '//*[@id="dieselReactWrapper"]/div/div[4]/main/div/div/div/div/div[2]/section[2]/div/div/section/div/div[1]/div/div/a/div/div/div[1]/div[1]/div/img';
  private readonly gameXpath =
    '//*[@id="dieselReactWrapper"]/div/div[4]/main/div/div/div/div/div[2]/section[2]/div/div/section/div/div[1]/div/div/a/div/div/div[3]';
  private readonly hrefXpath =
    '//*[@id="dieselReactWrapper"]/div/div[4]/main/div/div/div/div/div[2]/section[2]/div/div/section/div/div[1]/div/div/a';

  constructor(client: CommandoClient) {
    super(client, {
      name: "freegame",
      aliases: ["epicfree", "freeshit", "egs"],
      group: "misc",
      memberName: "freegame",
      description: "Узнать какую игру сейчас раздают в Epic Store бесплатно",
      throttling: {
        usages: 1,
        duration: 60 * 60,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async run(message: CommandoMessage) {
    try {
      const reply = (await message.reply("ждите...")) as Message;
      const egsData = await this.crawlEgs();
      const embedMsg = FreeGame.buildEmbed(egsData);
      await reply.edit(" ");
      return await reply.edit(embedMsg);
    } catch (error) {
      logger.error(error.message, [error]);
      return message.reply(error.message);
    }
  }

  private static buildEmbed(data: EgsCrawlResult): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`🎮 ${data.gameName}`)
      .setColor(0x0088ff)
      .setThumbnail(data.coverUrl)
      .setDescription(`** ${data.freeUntil} **\n${data.gameUrl}`);
  }

  private async crawlEgs(): Promise<EgsCrawlResult> {
    try {
      const browser = await puppeteer.launch();
      const egsPage = await browser.newPage();
      await egsPage.setViewport({ width: 1920, height: 926 });
      await egsPage.goto("https://www.epicgames.com/store/en-US/free-games");
      await egsPage.waitForXPath(this.gameXpath);
      const egsData = await egsPage.evaluate(
        (gameXpath: string, coverXpath: string, hrefXpath: string) => {
          const currentGame = document.evaluate(gameXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue as HTMLAnchorElement;
          const gameCover = document.evaluate(coverXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue as HTMLImageElement;
          const gameUrl = document.evaluate(coverXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            .singleNodeValue as HTMLAnchorElement;
          const gameInfo = currentGame.innerText.split("\n");
          return {
            gameUrl: gameUrl.href,
            gameName: gameInfo[0],
            freeUntil: gameInfo[1],
            coverUrl: gameCover.src,
          };
        },
        this.gameXpath,
        this.coverXpath,
        this.hrefXpath,
      );
      await browser.close();
      return egsData;
    } catch (error) {
      logger.error(error.message, [error]);
      return error;
    }
  }
}
