import axios, { AxiosResponse } from "axios";
import Promise from "bluebird";
import Store from "./Store";

import { CMC } from "./Constants";
import Logger, { WinstonLogger } from "./Logger";
import { wait } from "./Tools";

export declare interface CmcResponseStatus {
  error_code?: number;
  error_message?: string;
  timestamp?: number;
}

export declare interface CmcResponseData {
  name?: string;
  slug?: string;
  symbol?: string;
  quote?: { USD: { price: number; percent_change_1h: number } };
}

export declare interface CmcResponse {
  status?: CmcResponseStatus;
  data?: CmcResponseData[];
}

export declare interface CmcAxiosResponse extends AxiosResponse {
  data: { status?: CmcResponseStatus; data?: CmcResponseData[] };
}

class CoinMarketCapAPI {
  logger: WinstonLogger;
  store: Store;

  constructor() {
    this.logger = Logger.create(this.constructor.name);
    this.store = new Store(CMC.listingsDbFile, false);
  }

  getListings(): CmcResponse {
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

  fetchListings(): Promise<CmcResponse> {
    this.logger.debug("Fetching results...");
    return axios
      .get(CMC.listingsUri, {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
        },
      })
      .then((response: CmcAxiosResponse) => {
        let fallbackRes: CmcResponse = {
          status: { error_code: 1, error_message: "error fetching results." },
          data: [],
        };
        let res: CmcResponse = response.data || fallbackRes;
        if (res.status.error_code > 0) {
          return Promise.reject({
            error_code: res.status.error_code,
            error_message: res.status.error_message,
          });
        }

        this.logger.debug(`storing ${res.data.length} entries...`);
        this.store.replace(res);
        this.store.write();
        return res;
      })
      .catch((err) => {
        this.logger.error(`API call error: ${err.stack || err.message}`);
        return err;
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

    let maximumSignificantDigits = coin.quote.USD.price > 10 ? 6 : 8;

    let obj = {
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      priceFormatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumSignificantDigits,
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
      .then(() => this.poll())
      .catch(() => this.poll());
  }

  start() {
    this.logger.info("Starting CMC...");
    this.poll();
  }
}

export default CoinMarketCapAPI;
