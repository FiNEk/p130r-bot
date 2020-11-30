import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { resolve } from "path";
import { readFileSync } from "fs";
import { CronJob } from "cron";
import { logger } from "../logger";
import db from "./db";
import YandexToken from "../entity/YandexToken";
import { ReadableStreamBuffer } from "stream-buffers";

class YaTTS {
  private currentVoice: AvailableTTSvoices | string = "filipp";
  private readonly yndKey: string;
  private readonly serviceAccId: string = "aje6hdd4lhb0k1g1lvsu";
  private readonly serviceKeyId: string = "ajeg9479o31bv4d0lcn1";
  private request: AxiosInstance = axios.create({
    baseURL: "https://tts.api.cloud.yandex.net",
    responseType: "arraybuffer",
  });
  private tokenRefresh: CronJob;

  constructor() {
    this.yndKey = readFileSync(resolve(__dirname, "../../", "yandex.pem")).toString();
    if (!this.yndKey) {
      throw new Error("Yandex key not found");
    }
    this.tokenRefresh = new CronJob("0 */6 * * *", async () => {
      logger.info("Updating iamtoken @cronjob");
      const newToken = await this.refreshIamToken();
      this.setAuthHeader(newToken);
    });
    this.tokenRefresh.start();
  }

  set voice(voice: AvailableTTSvoices | string) {
    const availableVoices = ["oksana", "jane", "omazh", "zahar", "erkanyavas", "alena", "filipp", "alyss", "nick"];
    if (availableVoices.includes(voice)) {
      this.currentVoice = voice;
    } else {
      throw new Error("Unavailable voice");
    }
  }
  get voice(): string {
    return String(this.currentVoice) as AvailableTTSvoices;
  }

  public async init(): Promise<void> {
    const lastToken = await YaTTS.getLocalToken();
    if (lastToken) {
      this.setAuthHeader(lastToken.token);
    } else {
      const newToken = await this.refreshIamToken();
      this.setAuthHeader(newToken);
    }
  }

  private static async getLocalToken(): Promise<YandexToken | undefined> {
    const tokenRecord = await db.getToken();
    const now = Math.floor(new Date().getTime() / 1000);
    if (tokenRecord) {
      const maxAge = tokenRecord.expiresAt - 6 * 3600; // минус 6 часов от 12 часов.
      if (now < maxAge) {
        logger.info("good token");
        return tokenRecord;
      }
      logger.info("token outdated");
      return;
    }
    return;
  }

  public async synthesize(text: string, options?: TTSOptions): Promise<ReadableStreamBuffer> {
    try {
      const reqBody = new URLSearchParams();
      reqBody.append("text", text);
      reqBody.append("voice", this.voice);
      if (options) {
        for (const [key, value] of _.toPairs(options)) {
          if (key !== "voice") {
            const str = `${value}`;
            reqBody.append(key, str);
          }
        }
      }
      const res = await this.request.post("/speech/v1/tts:synthesize", reqBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const stream = new ReadableStreamBuffer({
        frequency: 10,
        chunkSize: 2048,
        autoDestroy: true,
      });
      stream.put(Buffer.from(res.data));
      return stream;
    } catch (e) {
      logger.error(e, [e]);
      if (e.code === 401) {
        logger.info("token expired");
        const newToken = await this.refreshIamToken();
        this.setAuthHeader(newToken);
        return this.synthesize(text, options);
      } else {
        throw new Error("Failed to get TTS file");
      }
    }
  }

  private setAuthHeader(iamToken: string): void {
    this.request.defaults.headers.common["Authorization"] = `Bearer ${iamToken}`;
  }

  private async refreshIamToken(): Promise<string> {
    logger.info("generating new token");
    const response = await this.getIamToken();
    const unixTime = Math.floor(Date.parse(response.expiresAt) / 1000);
    await db.addToken(response.iamToken, unixTime);
    return response.iamToken;
  }

  private async getIamToken(): Promise<IamTokenResponse> {
    try {
      const jwt = this.generateAuthJwt().toString();
      const headers = {
        typ: "JWT",
        alg: "PS256",
        kid: this.serviceKeyId,
      };
      const { data } = await axios.post<IamTokenResponse>(
        "https://iam.api.cloud.yandex.net/iam/v1/tokens",
        {
          jwt,
        },
        {
          headers,
        },
      );
      return data;
    } catch (e) {
      logger.error(e, [e]);
      throw new Error("Failed to get new iam token");
    }
  }

  private generateAuthJwt(): string {
    const now = Math.floor(new Date().getTime() / 1000);
    const payload = {
      aud: "https://iam.api.cloud.yandex.net/iam/v1/tokens",
      iss: this.serviceAccId,
      iat: now,
      exp: now + 3600,
    };
    return jwt.sign(payload, this.yndKey, { algorithm: "PS256", keyid: this.serviceKeyId });
  }
}

type IamTokenResponse = { iamToken: string; expiresAt: string };
type TTSOptions = {
  ssml?: string;
  lang?: "ru-RU" | "en-US" | "tr-TR";
  emotion?: "neutral" | "good" | "evil";
  speed?: number; // min 0.1, max 3.0
  format?: "lpcm" | "oggopus";
  sampleRateHertz?: "48000" | "16000" | "8000";
};
type AvailableTTSvoices = "oksana" | "jane" | "omazh" | "zahar" | "erkanyavas" | "alena" | "filipp" | "alyss" | "nick"; // alyss, nick - english voices | alena, filipp - premium voices
export default new YaTTS();
