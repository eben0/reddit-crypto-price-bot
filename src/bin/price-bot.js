#!/usr/bin/env node

import dotenv from "dotenv";
import PriceBot from "../PriceBot";

dotenv.config();
const bot = new PriceBot();
bot.start();
