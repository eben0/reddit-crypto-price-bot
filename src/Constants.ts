import { ListingOptions } from "snoowrap/dist/objects";

export interface Options extends ListingOptions {
  pollTime?: number;
  subreddit?: string;
}

export const botName = "crypto-price-bot";

export const userAgent = `by u/${botName}`;

export const options: Options = {
  subreddit:
    "test+cryptocurrency+dogecoin+bitcoin+btc+bitcoincash+ethereum+litecoin+xrp+tronix+cardano+eos+coinbase",
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