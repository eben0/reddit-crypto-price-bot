export const botName = "crypto-price-bot";

export const userAgent = `by u/${botName}`;

export const streamOpts = {
  subreddit:
    "test+cryptocurrency+dogecoin+bitcoin+btc+bitcoincash+ethereumeth+litecoin+xrp+tronix+cardano+eos+coinbase",
  results: 100,
};

// export const PATTERN = /(btc|bitcoin|eth|ethereum|doge|dogecoin)\s+price/i;

export const CMC = {
  listingsUri:
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  listingsDbFile: "db/listings.json",
  pollTime: 300000, // every 5 minutes
};

export const LoggerPaths = {
  errFile: "error.log",
  combinedFile: "combined.log",
};

export const replyTemplate = "templates/reply.md";

export const Err = {
  noListings: "Listings file is empty",
};
