// src
import Bot from "./Bot";
import { PATTERN } from "./Constants";
import Store from "./Store";
import { listingsDbFile } from "./CoinMarketCapAPI";

class PriceBot extends Bot {
    constructor() {
        super();
        this.listings = new Store(listingsDbFile, false);
    }

    /**
     *
     * checks if we can reply
     * @param {_Comment} comment
     */
    canReply(comment) {
        return (
            // checking for bot name so we won't reply to ourselves
            // comment.author.name !== C.botName &&
            !comment.locked &&
            comment.link_author !== "[deleted]" &&
            comment.subreddit_type === "public" &&
            !this.store.get(comment.parent_id) &&
            this.store.get("price_bot_start") < comment.created_utc &&
            // checking regex pattern
            PATTERN.test(comment.body)
        );
    }

    /**
     *
     * gets symbol from comment body
     * @param {_Comment} comment
     */
    getSymbol(comment) {
        // first part is the symbol
        let parts = (comment.body || "").split(PATTERN);
        let symbol = parts[1];
        return symbol ? symbol.toUpperCase() : null;
    }

    getCoinPrice(symbol) {
        let coin = (this.listings.get("data") || []).find(
            (row) => row.symbol.toUpperCase() === symbol
        );

        if (!(coin && coin.quote && coin.quote.USD)) {
            return null;
        }

        return {
            price: coin.quote.USD.price,
            priceFormatted: new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(coin.quote.USD.price),
            change: coin.quote.USD.percent_change_24h,
            bull: coin.quote.USD.percent_change_24h > 0,
        };
    }

    /**
     *
     * CommentStream on item callback
     * @param {_Comment} comment
     */
    onComment(comment) {
        if (this.canReply(comment)) {
            let symbol = this.getSymbol(comment);
            if (symbol) {
                // replying

                let report = {
                    user: comment.author.name,
                    symbol: symbol,
                    price: this.getCoinPrice(symbol),
                };

                this.store.set(comment.link_url, report);

                console.log({
                    ...report,
                    link_url: comment.link_url,
                });

                // console.log(`replying to ${comment.author.name}`);
                /*comment
                    .reply(`${symbol} price is $49,256.63 (+3.64%)`)
                    .then(() => comment.upvote());*/
                this.store.set(comment.parent_id, true);
            }
        }
    }

    start() {
        this.stream.on("item", (c) => this.onComment(c));
        this.store.set("price_bot_start", this.getTime());
    }
}

export default PriceBot;
