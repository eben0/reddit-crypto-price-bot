"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.goodBotText = exports.writeSyncTime = exports.defaultDbFile = exports.Err = exports.replyTemplate = exports.LoggerPaths = exports.CMC = exports.GoodBadBotPattern = exports.streamOpts = exports.userAgent = exports.botName = void 0;
var botName = "crypto-price-bot";
exports.botName = botName;
var userAgent = "by u/".concat(botName);
exports.userAgent = userAgent;
var streamOpts = {
  subreddit:
    "test+cryptocurrency+dogecoin+bitcoin+btc+bitcoincash+ethereum+litecoin+xrp+tronix+cardano+eos+coinbase",
  results: 100,
};
exports.streamOpts = streamOpts;
var GoodBadBotPattern = /(good|bad)\s+bot/i;
exports.GoodBadBotPattern = GoodBadBotPattern;
var CMC = {
  listingsUri:
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  listingsDbFile: "db/listings.json",
  pollTime: 300000,
  // every 5 minutes
  timezone: "America/Los_Angeles",
  timezoneShort: "PST",
};
exports.CMC = CMC;
var LoggerPaths = {
  errFile: "error.log",
  combinedFile: "combined.log",
};
exports.LoggerPaths = LoggerPaths;
var replyTemplate = "templates/reply.md";
exports.replyTemplate = replyTemplate;
var Err = {
  noListings: "Listings file is empty",
};
exports.Err = Err;
var defaultDbFile = "db/store.json";
exports.defaultDbFile = defaultDbFile;
var writeSyncTime = 5000;
exports.writeSyncTime = writeSyncTime;
var goodBotText = "Yay! "
  .concat(botName, " is a good boi! ")
  .concat(botName, " buys more coins!!!");
exports.goodBotText = goodBotText;
