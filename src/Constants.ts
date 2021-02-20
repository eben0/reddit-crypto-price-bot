import { ListingOptions } from "snoowrap/dist/objects";
import { isProd } from "./Tools";

export interface Options extends ListingOptions {
  pollTime?: number;
  subreddit?: string;
}

export const version = process.env.VERSION || "alpha-0.0.1";
export const author = "/u/eben0";
export const botName = "crypto-price-bot";

export const userAgent = `${botName}:${version} (by u/${author})`;

const subreddits = [
  // "cryptocurrency",
  "dogecoin",
  "bitcoin",
  // "btc",
  "bitcoincash",
  "ethereum",
  "litecoin",
  "xrp",
  "tronix",
  "eos",
  // "coinbase",
];

export const options: Options = {
  subreddit: isProd() ? subreddits.join("+") : "test",
  limit: 100,
  pollTime: 60000,
};

export const GoodBadBotPattern = /(good|bad)\s+bot/i;

export const CMC = {
  listingsUri:
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  listingsDbFile: "db/listings.json",
  pollTime: 300000, // every 5 minutes
  timezone: "America/Los_Angeles",
  timezoneShort: "PST",
};

export const LoggerPaths = {
  errFile: "error.log",
  combinedFile: "combined.log",
};

export const replyTemplate = "templates/reply.md";

export const Err = {
  noListings: "Listings file is empty",
};

export const defaultDbFile = "db/store.json";
export const writeSyncTime = 5000;

export const goodBotText = `Yay! ${botName} is a good boi! ${botName} buys more coins!!!`;
