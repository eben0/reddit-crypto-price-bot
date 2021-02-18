"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _Store = _interopRequireDefault(require("./Store"));

var _Constants = require("./Constants");

var _Logger = _interopRequireDefault(require("./Logger"));

var _Tools = require("./Tools");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var CoinMarketCapAPI = /*#__PURE__*/ (function () {
  function CoinMarketCapAPI() {
    _classCallCheck(this, CoinMarketCapAPI);

    this.logger = _Logger["default"].create(this.constructor.name);
    this.store = new _Store["default"](_Constants.CMC.listingsDbFile, false);
  }

  _createClass(CoinMarketCapAPI, [
    {
      key: "getListings",
      value: function getListings() {
        return this.store.getAll();
      },
    },
    {
      key: "buildRegex",
      value: function buildRegex() {
        var pattern = this.getListings()
          .data.map(function (row) {
            return ""
              .concat(row.symbol.toLowerCase(), "|")
              .concat(row.slug.toLowerCase());
          })
          .join("|");
        return new RegExp("(".concat(pattern, ")\\s+price"), "i");
      },
    },
    {
      key: "fetchListings",
      value: function fetchListings() {
        var _this = this;

        this.logger.info("Fetching results...");
        return _axios["default"]
          .get(_Constants.CMC.listingsUri, {
            headers: {
              "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
            },
          })
          .then(function (response) {
            var res = response.data || {
              status: {
                error_code: 1,
                error_message: "error fetching results.",
              },
            };

            if (res.status.error_code > 0) {
              return Promise.reject({
                error_code: res.status.error_code,
                error_message: res.status.error_message,
              });
            }

            _this.logger.info(
              "storing ".concat(res.data.length, " entries...")
            );

            _this.store.replace(res);

            _this.store.write();
          })
          ["catch"](function (err) {
            _this.logger.error(
              "API call error: ".concat(err["static"] || err.message)
            );
          });
      },
    },
    {
      key: "getCoin",
      value: function getCoin(symbol) {
        symbol = symbol.toLowerCase();
        var coin = this.getListings().data.find(function (row) {
          return (
            row.symbol.toLowerCase() === symbol ||
            row.slug.toLowerCase() === symbol
          );
        });

        if (!(coin && coin.quote && coin.quote.USD)) {
          return null;
        }

        var obj = {
          name: coin.name,
          symbol: coin.symbol,
          price: coin.quote.USD.price,
          priceFormatted: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumSignificantDigits: 8,
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
              timeZone: _Constants.CMC.timezone,
            }).format(new Date(this.getListings().status.timestamp)) +
            " " +
            _Constants.CMC.timezoneShort,
        };

        if (obj.change > 0) {
          obj.changeIcon = "⬆";
        } else if (obj.change < 0) {
          obj.changeIcon = "⬇";
        }

        return obj;
      },
    },
    {
      key: "poll",
      value: function poll() {
        var _this2 = this;

        this.fetchListings()
          .then(function () {
            return (0, _Tools.wait)(_Constants.CMC.pollTime);
          })
          .then(function () {
            return _this2.poll();
          });
      },
    },
  ]);

  return CoinMarketCapAPI;
})();

var _default = CoinMarketCapAPI;
exports["default"] = _default;
