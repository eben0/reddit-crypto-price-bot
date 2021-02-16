import CoinMarketCapAPI from "../src/CoinMarketCapAPI";
import { config } from "dotenv";

config();
const cmc = new CoinMarketCapAPI(process.env.CMC_API_KEY);
cmc.fetchListings();
