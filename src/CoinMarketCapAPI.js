import axios from "axios";
import Store from "./Store";
import { config } from "dotenv";

const listingsUri =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";

export const listingsDbFile = "db/listings.json";

class CoinMarketCapAPI {
    constructor(apiKey) {
        config();
        this.apiKey = process.env.CMC_API_KEY;
        this.store = new Store(listingsDbFile, false);
    }

    fetchListings() {
        console.log("CMC: Fetching results...");
        axios
            .get(listingsUri, {
                headers: {
                    "X-CMC_PRO_API_KEY": this.apiKey,
                },
            })
            .then((response) => {
                console.log("CMC: Storing results...");
                this.store.replace(response.data);
                this.store.write();
                console.log("CMC: Done.");
            })
            .catch((err) => {
                console.log("CMC: API call error:", err.message);
            });
    }
}

export default CoinMarketCapAPI;
