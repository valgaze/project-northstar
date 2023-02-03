import CultureBot from "./../../settings/config";
import {
  LocationGenerator,
  locationHandler,
} from "./../../settings/location.handler";
import { Guard } from "./mini-router";
import { validateWebhook } from "./validateWebhook";
import { ENVELOPES, finale, BotInst } from "speedybot-mini";
export interface Env {
  BOT_TOKEN: string;
  WEBHOOK_SECRET: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    let json: unknown | {};

    try {
      json = await request.json();
    } catch (e) {
      json = {};
    }

    const urlRef = new URL(request.url);
    const { pathname } = urlRef;
    const hooks = {
      "/location": async (
        request: Request,
        env: Env,
        ctx: ExecutionContext
      ) => {
        // Location handler
        // RoomID + MessageID are not private values
        // MessageID can be used as a 1-time-link implementation
        const { cf } = request;
        const {
          city,
          colo,
          continent,
          country,
          latitude,
          longitude,
          postalCode,
          region,
          timezone,
        } = (cf as IncomingRequestCfProperties) || {};

        const urlRef = new URL(request.url);
        const { searchParams } = urlRef;

        const roomId = searchParams.get("roomId") || null;
        const messageId = searchParams.get("messageId") || null;
        if (!roomId || !messageId) {
          return new Response("Missing parameters", { status: 422 });
        }
        if (roomId && messageId) {
          const payload = {
            city,
            colo,
            continent,
            country,
            latitude,
            longitude,
            postalCode,
            region,
            timezone,
          };

          const BotConfig = {
            roomId: roomId as string,
            SpeedybotInst: CultureBot,
            token: env.BOT_TOKEN,
            url: request.url,
          };

          const Bot = new BotInst(BotConfig);
          // Validate this is a request by checking messageId
          const check = await Bot.deleteMessage(messageId as string);
          if (check.status === 404) {
            return new Response("Sorry, that link is no longer valid", {
              status: 401,
            });
          } else {
            const locationDetails = LocationGenerator(
              request.cf as IncomingRequestCfProperties<unknown>
            );

            // Run handler
            ctx.waitUntil(
              new Promise(async (resolve) =>
                resolve(locationHandler(Bot, locationDetails))
              )
            );
            // Page content (disposable)
            const html = `You can close this window.<script>window.close();window.addEventListener("load", window.close);setTimeout(window.close, 301);</script>`;
            return new Response(html, {
              status: 200,
              headers: {
                "content-type": "text/html;charset=UTF-8",
              },
            });
          }
        } else {
          return new Response(finale());
        }
      },
      "/": {
        method: "POST",
        async handler(request: Request, env: Env, ctx: ExecutionContext) {
          CultureBot.setToken(env.BOT_TOKEN);
          const signature = request.headers.get("x-spark-signature");
          const secret = env.WEBHOOK_SECRET;
          // Validate webhook if on webhook and secret present
          if (secret && signature) {
            const proceed = await validateWebhook(json, secret, signature);
            if (proceed === false) {
              return new Response("Webhook Secret Rejected");
            }
          }

          ctx.waitUntil(
            new Promise<void>(async (resolve, reject) => {
              try {
                const isEnvelope = CultureBot.isEnvelope(json);
                if (isEnvelope) {
                  await CultureBot.processIncoming(json as ENVELOPES);
                }
              } catch (e) {
                reject(e);
                return new Response(
                  `Something happened, but backend is up and running: ${e}`
                );
              }
            })
          );
          return new Response(finale());
        },
      },
    };
    return Guard(hooks, request, env, ctx);
  },
};
