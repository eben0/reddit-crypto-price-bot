#!/usr/bin/env node
"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _PriceBot = _interopRequireDefault(require("../PriceBot"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

_dotenv["default"].config();

var bot = new _PriceBot["default"]();
bot.start();
