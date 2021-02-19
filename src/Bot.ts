// modules
import Snoowrap, { Comment, Listing } from "snoowrap";
import EventEmitter from "events";

// src
import { options, userAgent } from "./Constants";
import Store from "./Store";
import Logger, { WinstonLogger } from "./Logger";

import { wait } from "./Tools";

class Bot {
  protected logger: WinstonLogger;
  protected client: Snoowrap;
  protected store: Store;
  protected items: Set<string>;
  protected stream: EventEmitter;

  constructor() {
    this.logger = Logger.create(this.constructor.name);
    this.client = this.newSnoowrap();
    this.stream = this.newCommentStream();
    this.store = new Store();
  }

  newSnoowrap(): Snoowrap {
    return new Snoowrap({
      userAgent,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    });
  }

  /**
   *
   * based on Snoostorm idea
   * instead of intervals i use chained promised with a timeout
   * @param emitter
   */
  poll(emitter: EventEmitter): Promise<any> {
    return this.client
      .getNewComments(options.subreddit, options)
      .then((comments: Listing<Comment>) => {
        for (const comment of comments) {
          if (this.items.has(comment.id)) continue;
          this.items.add(comment.id);
          emitter.emit("item", comment);
        }
        return comments;
      })
      .catch((error) => {
        emitter.emit("error", error);
        return error;
      });
  }

  newCommentStream() {
    const emitter: EventEmitter = new EventEmitter();
    this.poll(emitter)
      .then(() => wait(options.pollTime))
      .then(() => this.poll(emitter));
    return emitter;
  }
}

export default Bot;
