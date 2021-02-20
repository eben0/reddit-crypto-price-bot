import dotenv from "dotenv";
import PriceBot from "./PriceBot";
import CoinMarketCapAPI from "./CoinMarketCapAPI";
import Logger from "./Logger";
import { botName, version } from "./Constants";

class App {
  static start() {
    dotenv.config();
    Logger.create("App").info(`Starting ${botName}:${version}`);
    new CoinMarketCapAPI().start();
    new PriceBot().start();
  }
}

export default App;
