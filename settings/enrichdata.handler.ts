// Special handler for handling opt-in corase-grained location data
import { BotInst } from "speedybot-mini";
export const enrichDataHandler = async (
  $bot: BotInst,
  enrichedData: EnrichedData
) => {
  await $bot
    .send(
      $bot.card({
        title: `Hi there`,
        subTitle: `Below is the data from the integration`,
      })
    )
    .catch((e) => console.log("#locationHandler", e));

  await $bot.sendJSON(enrichedData);
};

// TODO when payloads specified
export type EnrichedData = any;
