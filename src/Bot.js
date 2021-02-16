// modules
import { config } from "dotenv";
import Snoowrap from "snoowrap";
import { CommentStream, SubmissionStream } from "snoostorm";

// src
import * as C from "./Constants";

class Bot {
    constructor() {
        config();
        this.client = this.newSnoowrap();
    }

    newSnoowrap() {
        return new Snoowrap({
            userAgent: C.userAgent,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        });
    }

    /**
     *
     * checks if we can reply
     * @param {_Comment} comment
     */
    canReply(comment) {
        return (
            // checking for bot name so we won't recursively reply to ourselves
            comment.author.name !== C.botName &&
            // checking regex pattern
            C.PATTERN.test(comment.body)
        );
    }

    /**
     *
     * gets symbol from comment body
     * @param {_Comment} comment
     */
    getSymbol(comment) {
        // first part is the symbol
        let parts = (comment.body || "").split(C.PATTERN);
        let symbol = parts[1];
        return symbol ? symbol.toUpperCase() : null;
    }

    /**
     *
     * CommentStream on item callback
     * @param {_Comment} comment
     */
    onComment(comment) {
        if (this.canReply()) {
            let symbol = this.getSymbol(comment);
            if (symbol) {
                // replying
                console.log(`replying to ${comment.author.name}`);
                comment
                    .reply(`${symbol} price is $49,256.63 (+3.64%)`)
                    .then(() => comment.upvote());
            }
        }
    }

    /**
     * @param {_Submission} sub
     */
    onSubmissionStream(sub) {
        sub.comments.forEach(this.onComment);
    }

    stream() {
        const stream = new SubmissionStream(this.client, C.streamOpts);
        stream.on("item", this.onComment);
    }
}

export default Bot;
