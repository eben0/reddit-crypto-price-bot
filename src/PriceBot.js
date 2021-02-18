// src
import Bot from "./Bot";
import { Err, goodBotText } from "./Constants";
import Store from "./Store";
import CoinMarketCapAPI from "./CoinMarketCapAPI";
import Template from "./Template";
import { GoodBadBotPattern } from "./Constants";
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
    this.me = this.client.getMe();
  }

  /**
   *
   * checks if we can reply
   * @param {_Comment} comment
   */
  canSummon(comment) {
    return (
      this.outOf() &&
      !(this.store.get("unsubscribe") || []).includes(comment.author.id) &&
      comment.author.id !== this.client.me.id &&
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
    if (typeof comment === "string") return;
    this.logger.debug(`comment event`, {
      subreddit: comment.subreddit,
    });
    this.onPriceComment(comment);
    this.onGoodBadBotComment(comment);
    this.onDownVoteComment(comment);
  }

  /**
   * @param {_Comment} comment
   */
  onPriceComment(comment) {
    if (this.canSummon(comment)) {
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

      this.reply(comment, tpl).then(() => {
        this.logger.info(
          `Replied to ${comment.author.name}; Symbol: ${symbol}; Price: ${coin.price}`
        );
        this.store.set(comment.parent_id, true);
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

  /**
   * @param {_Comment} comment
   */
  onDownVoteComment(comment) {
    this.client
      .getComment(comment.parent_id)
      .fetch()
      .then((parentComment) => {
        if (parentComment.author.id === this.me.id && comment.score < 1) {
          this.logger.debug(
            "low score - deleting comment",
            parentComment.permalink
          );
          this.store.put("unsubscribe", parentComment.author.id);
          this.del(parentComment);
        }
      });
  }

  /**
   * @param {_Comment} comment
   */
  onGoodBadBotComment(comment) {
    if (GoodBadBotPattern.test(comment.body)) {
      this.client
        .getComment(comment.parent_id)
        .fetch()
        .then((parentComment) => {
          if (parentComment.author.id === this.client.me.id) {
            let bodyLower = comment.body.toLowerCase();
            if (bodyLower.includes("good bot")) {
              this.reply(comment, goodBotText);
            } else if (bodyLower.includes("bad bot")) {
              this.logger.debug(
                "bad bot replied - deleting comment",
                parentComment.permalink
              );
              this.store.put("unsubscribe", parentComment.author.id);
              this.del(parentComment);
            }
          }
        });
    }
  }

  /**
   *
   * @param {_Comment} comment
   * @param message
   * @return {Promise}
   */
  reply(comment, message) {
    return comment.reply(message).catch((err) => {
      this.logger.error(`Failed to reply ${comment.permalink}`, {
        err,
      });
      return err;
    });
  }

  /**
   *
   * @param {_Comment} comment
   * @return {Promise}
   */
  del(comment) {
    return comment.delete().catch((err) => {
      this.logger.error(`Failed to delete ${comment.permalink}`, {
        err,
      });
      return err;
    });
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
