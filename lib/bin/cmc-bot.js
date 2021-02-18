#!/usr/bin/env node
"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _CoinMarketCapAPI = _interopRequireDefault(require("../CoinMarketCapAPI"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

_dotenv["default"].config();

var cmcBot = new _CoinMarketCapAPI["default"]();
cmcBot.poll();
