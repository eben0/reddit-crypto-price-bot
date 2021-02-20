import dotenv from "dotenv";
import PriceBot from "./src/PriceBot";
import CoinMarketCapAPI from "./src/CoinMarketCapAPI";

dotenv.config();
new CoinMarketCapAPI().start();
new PriceBot().start();
