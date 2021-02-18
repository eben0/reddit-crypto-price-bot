import axios from "axios";
import Store from "./Store";

import { CMC } from "./Constants";
import Logger from "./Logger";
import { logUnhandledRejection, wait } from "./Tools";

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
    this.logger.debug("Fetching results...");
    return axios
      .get(CMC.listingsUri, {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
        },
      })
      .then((response) => {
        let res = response.data || {
          status: { error_code: 1, error_message: "error fetching results." },
        };
        if (res.status.error_code > 0) {
          return Promise.reject({
            error_code: res.status.error_code,
            error_message: res.status.error_message,
          });
        }

        this.logger.debug(`storing ${res.data.length} entries...`);
        this.store.replace(res);
        this.store.write();
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
          timeZone: CMC.timezone,
        }).format(new Date(this.getListings().status.timestamp)) +
        " " +
        CMC.timezoneShort,
    };

    if (obj.change > 0) {
      obj.changeIcon = "⬆";
    } else if (obj.change < 0) {
      obj.changeIcon = "⬇";
    }

    return obj;
  }

  poll() {
    this.fetchListings()
      .then(() => wait(CMC.pollTime))
      .then(() => this.poll());
  }
}

export default CoinMarketCapAPI;
