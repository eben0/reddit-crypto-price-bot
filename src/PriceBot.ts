// modules
import EventEmitter from "events";
import { Comment } from "snoowrap/dist/objects";
import { SnooShift } from "snooshift";
import { CommentSearchOptions } from "snooshift/dist/SearchOptions";

// src
import {
  goodBotText,
  GoodBadBotPattern,
  botName,
  userAgent,
  filters,
} from "./Constants";
import Store from "./Store";
import CoinMarketCapAPI from "./CoinMarketCapAPI";
import Template from "./Template";
import { randomInt, logUnhandledRejection, unixTimestamp } from "./Tools";
import Logger, { WinstonLogger } from "./Logger";

class PriceBot {
  protected logger: WinstonLogger;
  protected client: SnooShift;
  protected store: Store;
  protected interval: NodeJS.Timeout;

  private cmc: CoinMarketCapAPI;
  public re: RegExp;
  private template: Template;

  constructor() {
    this.logger = Logger.create(this.constructor.name);
    this.client = this.newSnooShift();
    this.store = new Store();
    this.store = new Store();
    // we assume the listing were already fetched
    this.cmc = new CoinMarketCapAPI();
    this.re = this.cmc.buildRegex();
    this.template = new Template();
  }

  /**
   * new client
   */
  newSnooShift(): SnooShift {
    return new SnooShift({
      userAgent,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    });
  }

  /**
   * poll
   * @param options
   * @param emitter
   */
  async poll(options: CommentSearchOptions, emitter: EventEmitter) {
    try {
      let comments: Comment[] | any[] = await this.client.searchComments(
        options
      );
      this.logger.info(`Got ${comments.length} comments`);
      for (const comment of comments) {
        if (
          this.store.in("processed_comments", comment.id) ||
          this.isDeleted(comment)
        )
          continue;
        this.store.put("processed_comments", comment.id);
        emitter.emit("item", comment);
      }
      return comments;
    } catch (error) {
      emitter.emit("error", error);
      return error;
    }
  }

  newCommentStream() {
    let options: CommentSearchOptions = {
      subreddit: filters.subreddits.join(","),
      size: filters.size,
      after: Math.floor((Date.now() - filters.after) / 1000),
    };
    const emitter: EventEmitter = new EventEmitter();
    this.interval = setInterval(async () => {
      await this.poll(options, emitter);
    }, filters.pollTime);
    return emitter;
  }

  end() {
    clearInterval(this.interval);
  }

  /**
   *
   * checks if we can reply
   */
  canSummon(comment: Comment) {
    return (
      !(this.store.get("unsubscribe") || []).includes(
        comment.author_fullname
      ) &&
      !this.store.get(comment.parent_id) &&
      !this.isMe(comment) &&
      // checking regex pattern
      this.re.test(comment.body)
    );
  }

  /**
   *
   * gets symbol from comment body
   * @param comment
   */
  getSymbol(comment: Comment) {
    // first part is the symbol
    let parts = (comment.body || "").split(this.re);
    return parts[1] && parts[1].trim();
  }

  /**
   *
   * CommentStream on item callback
   * @param comment
   */
  async onComment(comment: Comment) {
    this.logger.debug(`comment event`, {
      subreddit: comment.subreddit,
      body: comment.body.substr(0, 20),
      author: comment.author,
    });
    await this.onPriceComment(comment);
    //await this.onGoodBadBotComment(comment);
    //await this.onDownVoteComment(comment);
  }

  /**
   *
   * @param comment
   */
  async onPriceComment(comment: Comment | any) {
    if (this.canSummon(comment)) {
      this.logger.info(`can reply to ${comment.permalink}`);
      let symbol = this.getSymbol(comment);
      if (!symbol) return;
      this.logger.info(`Found symbol ${symbol}`);
      let coin = this.cmc.getCoin(symbol);
      if (!coin) return;

      let tpl = this.template.render(coin);
      this.logger.info(
        `Replying to ${comment.author}; Symbol: ${symbol}; Price: ${coin.price}`
      );
      this.logger.debug(comment.permalink, {
        author: comment.author,
        coin: coin,
        template: tpl,
      });

      await this.reply(comment, tpl);
      this.logger.info(
        `Replied to ${comment.author}; Symbol: ${symbol}; Price: ${coin.price}`
      );
      this.store.set(comment.parent_id, true);

      await comment.upvote().catch((err) => {
        this.logger.error(`Failed to upvote ${comment.permalink}`, {
          err,
        });
      });
      this.logger.info(`Upvoted ${comment.permalink}`);
    }
  }

  /**
   *
   * @param comment
   */
  async onDownVoteComment(comment: Comment) {
    let parentComment = await this.client.getComment(comment.parent_id);
    if (
      !this.isDeleted(parentComment) &&
      this.isMe(parentComment) &&
      comment.score < 1
    ) {
      this.logger.debug(
        "low score - deleting comment",
        parentComment.permalink
      );
      this.store.put("unsubscribe", parentComment.author.id);
      await this.del(parentComment);
    }
  }

  /**
   *
   * @param comment
   */
  async onGoodBadBotComment(comment: Comment) {
    if (GoodBadBotPattern.test(comment.body)) {
      let parentComment = await this.client.getComment(comment.parent_id);
      if (this.isMe(parentComment) && !this.isDeleted(parentComment)) {
        let bodyLower = comment.body.toLowerCase();
        if (bodyLower.includes("good bot")) {
          await this.reply(comment, goodBotText);
        } else if (bodyLower.includes("bad bot")) {
          this.logger.debug(
            "bad bot replied - deleting comment",
            parentComment.permalink
          );
          this.store.put("unsubscribe", parentComment.author.id);
          await this.del(parentComment);
        }
      }
    }
  }

  /**
   *
   * @param comment
   * @param message
   */
  reply(comment: Comment, message: string): Promise<Comment | any> {
    return comment.reply(message).catch((err) => {
      this.logger.error(`Failed to reply ${comment.permalink}`, {
        err,
      });
      return err;
    });
  }

  /**
   *
   * @param {Comment} comment
   */
  async del(comment: Comment): Promise<Comment | any> {
    return comment.delete().catch((err) => {
      this.logger.error(`Failed to delete ${comment.permalink}`, {
        err,
      });
      return err;
    });
  }

  /**
   * checks for me
   * @param comment
   */
  isMe(comment: Comment | any): boolean {
    return comment.author === botName;
  }

  /**
   * is comment deleted
   * @param comment
   */
  isDeleted(comment: Comment | any): boolean {
    let list = ["[deleted]", "[removed]"];
    return list.includes(comment.body) || list.includes(comment.author);
  }

  /**
   *random put of 3
   */
  outOf(): boolean {
    return randomInt(0, 2) === 1;
  }

  /**
   * on error event
   * @param error
   */
  onError(error: Error) {
    this.logger.error(error.stack || error.message, { error });
  }

  /**
   * start
   */
  start() {
    this.logger.info("Starting Crypto Price Bot...");
    const stream = this.newCommentStream();
    stream.on("item", (comment: Comment) => this.onComment(comment));
    stream.on("error", (error: Error) => this.onError(error));
    this.store.set("price_bot_start", unixTimestamp());
    logUnhandledRejection(this.logger);
  }
}

export default PriceBot;
