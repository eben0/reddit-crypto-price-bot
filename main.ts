import dotenv from "dotenv";
import PriceBot from "./src/PriceBot";
import CoinMarketCapAPI from "./src/CoinMarketCapAPI";

dotenv.config();
new PriceBot().start();
new CoinMarketCapAPI().start();
