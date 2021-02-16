// modules
import { config } from "dotenv";
import Snoowrap from "snoowrap";
import { CommentStream } from "snoostorm";

// src
import * as C from "./Constants";
import Store from "./Store";

class Bot {
    constructor() {
        // @todo: update env with CI/CD
        config();
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

    // @todo: use date lib
    getTime() {
        let now = new Date();
        let utc_ms = Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds(),
            now.getUTCMilliseconds()
        );
        return Math.floor(utc_ms / 1000);
    }
}

export default Bot;
