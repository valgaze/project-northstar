// Special handler for handling opt-in corase-grained location data
import { BotInst } from "speedybot-mini";
export const locationHandler = async ($bot: BotInst, location: Location) => {
  await $bot
    .send(
      $bot
        .card({
          title: `Good ${location.tod}`,
          subTitle: `Note: this timezone + location data is not stored/collected/sold and is not hyper-accurate. It's accurate enough to understand if its dark/light outside whenever a user is located`,
        })
        .setTable([
          ["Country", location.country as string],
          ["City", location.city as string],
          ["Region", location.region as string],
          ["Timezone", location.timezone as string],
        ])
        .setUrl(
          `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
          "See map 🗺"
        )
    )
    .catch((e) => console.log("#locationHandler", e));
};

//
export type TOD = "morning" | "afternoon" | "evening" | "error"; // time of day, ex. 'morning' | 'afternoon' | 'evening' | 'error'
export type Location = {
  city: string; // ex. 'Los Angeles'
  colo: string; // ex. 'LAX', IATA airport code of colo facility where request came in
  continent: string; // ex. 'NA',
  latitude: string;
  longitude: string;
  country: string; // ex. 'US'
  postalCode: string; // ex90210
  region: string;
  state: string; // trick: if US, will be set otherwise 'error'
  timezone: string; // ex. 'America/Los_Angeles'
  tod: TOD;
};

export type IncomingLocation = Partial<{
  city: string; // ex. 'Los Angeles'
  colo: string; // ex. 'LAX', "The three-letter IATA airport code of the data center that the request hit"
  continent: string;
  country: string;
  latitude: string;
  longitude: string;
  postalCode: string; // ex90210
  region: string;
  timezone: string; // ex. 'America/Los_Angeles'
}>;

export const defaultLocationData = {
  city: "error",
  colo: "error",
  continent: "error",
  latitude: "error",
  longitude: "error",
  country: "error",
  postalCode: "error",
  region: "error",
  state: "error",
  tod: "error",
  timezone: "error",
};

export const LocationGenerator = (candidate: IncomingLocation): Location => {
  const {
    city = "error",
    colo = "error",
    continent = "error",
    country = "error",
    latitude = "error",
    longitude = "error",
    postalCode = "error",
    region = "error",
    timezone = "error",
  } = candidate;
  let tod = "error";
  try {
    const date = new Date().toLocaleString("en-US", { timeZone: timezone });
    const hour = new Date(date).getHours();
    // 10~3 is evening
    if (20 <= hour || hour <= 3) {
      tod = "evening";
    }

    if (hour <= 11) {
      tod = "morning";
    }

    if (12 <= hour && hour <= 16) {
      tod = "afternoon";
    }

    if (17 <= hour && hour <= 19) {
      tod = "evening";
    }
  } catch (e) {
    tod = "error";
  }

  const res: Location = {
    city,
    colo,
    continent,
    country,
    latitude,
    longitude,
    postalCode,
    region,
    state: region,
    tod: tod as TOD,
    timezone,
  };
  return res;
};
