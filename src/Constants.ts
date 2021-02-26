import { isProd } from "./Tools";

export interface Filters {
  size?: number
  pollTime?: number;
  after?: number;
  subreddits?: string[];
}

export const version = process.env.VERSION || "alpha-0.0.1";
export const author = "/u/eben0";
export const botName = "crypto-price-bot";

export const userAgent = `${botName}:${version} (by u/${author})`;

export const subreddits = [
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

export const filters: Filters = {
  size: 25,
  pollTime: 60000,
  after: 60000 * 60 * 2, // 2 hours
  subreddits: isProd() ? subreddits : ["test"],
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
