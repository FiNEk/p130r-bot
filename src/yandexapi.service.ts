import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import _ from "lodash";
import { logger } from "./logger";

export class YandexApiService {
  private readonly yndKey: string;
  private readonly serviceAccId: string = "aje6hdd4lhb0k1g1lvsu";
  private readonly serviceKeyId: string = "ajeg9479o31bv4d0lcn1";
  private request: AxiosInstance = axios.create({
    baseURL: "https://tts.api.cloud.yandex.net",
    responseType: "arraybuffer",
  });
  constructor() {
    const pemPath = path.resolve(__dirname, "../", "private.pem");
    logger.info(`reading pem key in ${pemPath}`);
    this.yndKey = fs.readFileSync(pemPath).toString();
    if (!this.yndKey) {
      throw new Error("JWT pem not found");
    }
  }

  public setAuthHeader(iamToken: string) {
    this.request.defaults.headers.common["Authorization"] = `Bearer ${iamToken}`;
  }

  public async getIAMtoken(): Promise<IamTokenResponse> {
    try {
      const jwt = this.generateAuthJwt().toString();
      console.log(jwt);
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

  public async getTTS(text: string, options?: TTSOptions) {
    try {
      const reqBody = new URLSearchParams();
      reqBody.append("text", text);
      if (options) {
        for (const [key, value] of _.toPairs(options)) {
          const str = `${value}`;
          reqBody.append(key, str);
        }
      }
      const res = await this.request.post("/speech/v1/tts:synthesize", reqBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return Buffer.from(res.data);
    } catch (e) {
      logger.error(e, [e]);
      throw new Error("Failed to get TTS file");
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
  voice?: "oksana" | "jane" | "omazh" | "zahar" | "erkanyavas" | "alena" | "filipp" | "alyss" | "nick"; // alyss, nick - english voices | alena, filipp - premium voices (RU ONLY)
  emotion?: "neutral" | "good" | "evil";
  speed?: number; // min 0.1, max 3.0
  format?: "lpcm" | "oggopus";
  sampleRateHertz?: "48000" | "16000" | "8000";
};
