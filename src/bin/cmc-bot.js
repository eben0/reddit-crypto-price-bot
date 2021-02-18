#!/usr/bin/env node
import dotenv from "dotenv";
import CoinMarketCapAPI from "../CoinMarketCapAPI";

dotenv.config();
const cmcBot = new CoinMarketCapAPI();
cmcBot.poll();
