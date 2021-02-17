import axios from "axios";
import Store from "./Store";

import { CMC } from "./Constants";
import Logger from "./Logger";

class CoinMarketCapAPI {
  constructor() {
    this.logger = Logger.create(this.constructor.name);
    this.store = new Store(CMC.listingsDbFile, false);
  }

  getListings() {
    return this.store.getAll();
  }

  buildRegex() {
    let pattern = this.getListings()
      .data.map(
        (row) => `${row.symbol.toLowerCase()}|${row.slug.toLowerCase()}`
      )
      .join("|");
    return new RegExp(`(${pattern})\\s+price`, "i");
  }

  fetchListings() {
    this.logger.info("Fetching results...");
    axios
      .get(CMC.listingsUri, {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
        },
      })
      .then((response) => {
        this.logger.info("Storing results...");
        this.store.replace(response.data);
        this.store.write();
        this.logger.info("Done.");
      })
      .catch((err) => {
        this.logger.error(`API call error: ${err.static || err.message}`);
      });
  }

  getCoin(symbol) {
    symbol = symbol.toLowerCase();
    let coin = this.getListings().data.find(
      (row) =>
        row.symbol.toLowerCase() === symbol || row.slug.toLowerCase() === symbol
    );

    if (!(coin && coin.quote && coin.quote.USD)) {
      return null;
    }

    let obj = {
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      priceFormatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumSignificantDigits: 8,
      }).format(coin.quote.USD.price),
      change: coin.quote.USD.percent_change_1h,
      changeFormatted: coin.quote.USD.percent_change_1h.toFixed(2) + "%",
      changeIcon: "",
      bull: coin.quote.USD.percent_change_1h > 0,
      date:
        new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZone: "est",
        }).format(new Date(this.getListings().status.timestamp)) + " EST",
    };

    if (obj.change > 0) {
      obj.changeIcon = "⬆";
    } else if (obj.change < 0) {
      obj.changeIcon = "⬇";
    }

    return obj;
  }

  poll() {
    this.logger.info("Polling...");
    this.fetchListings();
    setInterval(() => {
      this.logger.info("Polling...");
      this.fetchListings();
    }, CMC.pollTime);
  }
}

export default CoinMarketCapAPI;
