// src
import Bot from "./Bot";
import { Err } from "./Constants";
import Store from "./Store";
import CoinMarketCapAPI from "./CoinMarketCapAPI";
import Template from "./Template";
import { botName } from "./Constants";
import { randomInt, logUnhandledRejection, unixTimestamp } from "./Tools";

class PriceBot extends Bot {
  constructor() {
    super();
    this.store = new Store();
    // we assume the listing were already fetched
    this.cmc = new CoinMarketCapAPI();
    this.listings = this.cmc.getListings();
    if (!this.listings.data) {
      throw new Error(Err.noListings);
    }
    this.re = this.cmc.buildRegex();
    this.template = new Template();
  }

  /**
   *
   * checks if we can reply
   * @param {_Comment} comment
   */
  canReply(comment) {
    return (
      // checking for bot name so we won't reply to ourselves
      this.outOf() &&
      comment.author.name !== botName &&
      !comment.locked &&
      comment.link_author !== "[deleted]" &&
      comment.subreddit_type === "public" &&
      !this.store.get(comment.parent_id) &&
      this.store.get("price_bot_start") < comment.created_utc &&
      // checking regex pattern
      this.re.test(comment.body)
    );
  }

  /**
   *
   * gets symbol from comment body
   * @param {_Comment} comment
   */
  getSymbol(comment) {
    // first part is the symbol
    let parts = (comment.body || "").split(this.re);
    return parts[1] && parts[1].trim();
  }

  /**
   *
   * CommentStream on item callback
   * @param {_Comment} comment
   */
  onComment(comment) {
    this.logger.info(`comment event ${comment.subreddit}`);
    if (this.canReply(comment)) {
      this.logger.info(`can reply to ${comment.permalink}`);
      let symbol = this.getSymbol(comment);
      if (!symbol) return;
      this.logger.info(`Found symbol ${symbol}`);
      let coin = this.cmc.getCoin(symbol);
      if (!coin) return;

      let tpl = this.template.render(coin);

      this.logger.info(
        `Replying to ${comment.author.name}; Symbol: ${symbol}; Price: ${coin.price}`
      );
      this.logger.info(comment.permalink, {
        author: comment.author.name,
        coin: coin,
        template: tpl,
      });

      comment
        .reply(tpl)
        .then(() => {
          this.logger.info(
            `Replied to ${comment.author.name}; Symbol: ${symbol}; Price: ${coin.price}`
          );
          this.store.set(comment.parent_id, true);
        })
        .catch((err) => {
          this.logger.error(`Failed to reply ${comment.permalink}`, {
            err,
          });
        });

      comment
        .upvote()
        .then(() => {
          this.logger.info(`Upvoted ${comment.permalink}`);
        })
        .catch((err) => {
          this.logger.error(`Failed to upvote ${comment.permalink}`, {
            err,
          });
        });
    }
  }

  outOf() {
    return randomInt(0, 2) === 1;
  }

  start() {
    this.logger.info("Starting Crypto Price Bot...");
    this.stream.on("item", (c) => this.onComment(c));
    this.store.set("price_bot_start", unixTimestamp());
    logUnhandledRejection(this.logger);
  }
}

export default PriceBot;
