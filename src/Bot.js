// modules
import Snoowrap from "snoowrap";
import { CommentStream } from "snoostorm";

// src
import * as C from "./Constants";
import Store from "./Store";
import Logger from "./Logger";

class Bot {
  constructor() {
    this.logger = Logger.create(this.constructor.name);
    this.client = this.newSnoowrap();
    this.stream = this.newCommentStream();
    this.store = new Store();
  }

  newSnoowrap() {
    return new Snoowrap({
      userAgent: C.userAgent,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    });
  }

  newCommentStream() {
    return new CommentStream(this.client, C.streamOpts);
  }

  unixTimestamp() {
    return Math.floor(Date.now() / 1000);
  }
}

export default Bot;
