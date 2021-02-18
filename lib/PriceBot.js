"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;

var _Bot2 = _interopRequireDefault(require("./Bot"));

var _Constants = require("./Constants");

var _Store = _interopRequireDefault(require("./Store"));

var _CoinMarketCapAPI = _interopRequireDefault(require("./CoinMarketCapAPI"));

var _Template = _interopRequireDefault(require("./Template"));

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true },
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
  return _setPrototypeOf(o, p);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return self;
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

var PriceBot = /*#__PURE__*/ (function (_Bot) {
  _inherits(PriceBot, _Bot);

  var _super = _createSuper(PriceBot);

  function PriceBot() {
    var _this;

    _classCallCheck(this, PriceBot);

    _this = _super.call(this);
    _this.store = new _Store["default"](); // we assume the listing were already fetched

    _this.cmc = new _CoinMarketCapAPI["default"]();
    _this.listings = _this.cmc.getListings();

    if (!_this.listings.data) {
      throw new Error(_Constants.Err.noListings);
    }

    _this.re = _this.cmc.buildRegex();
    _this.template = new _Template["default"]();
    _this.me = _this.client.getMe();
    return _this;
  }
  /**
   *
   * checks if we can reply
   * @param {_Comment} comment
   */

  _createClass(PriceBot, [
    {
      key: "canSummon",
      value: function canSummon(comment) {
        return (
          this.outOf() &&
          !(this.store.get("unsubscribe") || []).includes(comment.author.id) &&
          comment.author.id !== this.client.me.id &&
          !comment.locked &&
          comment.link_author !== "[deleted]" &&
          comment.subreddit_type === "public" &&
          !this.store.get(comment.parent_id) &&
          this.store.get("price_bot_start") < comment.created_utc && // checking regex pattern
          this.re.test(comment.body)
        );
      },
      /**
       *
       * gets symbol from comment body
       * @param {_Comment} comment
       */
    },
    {
      key: "getSymbol",
      value: function getSymbol(comment) {
        // first part is the symbol
        var parts = (comment.body || "").split(this.re);
        return parts[1] && parts[1].trim();
      },
      /**
       *
       * CommentStream on item callback
       * @param {_Comment} comment
       */
    },
    {
      key: "onComment",
      value: function onComment(comment) {
        if (typeof comment === "string") return;
        this.logger.debug("comment event", {
          subreddit: comment.subreddit,
        });
        this.onPriceComment(comment);
        this.onGoodBadBotComment(comment);
        this.onDownVoteComment(comment);
      },
      /**
       * @param {_Comment} comment
       */
    },
    {
      key: "onPriceComment",
      value: function onPriceComment(comment) {
        var _this2 = this;

        if (this.canSummon(comment)) {
          this.logger.info("can reply to ".concat(comment.permalink));
          var symbol = this.getSymbol(comment);
          if (!symbol) return;
          this.logger.info("Found symbol ".concat(symbol));
          var coin = this.cmc.getCoin(symbol);
          if (!coin) return;
          var tpl = this.template.render(coin);
          this.logger.info(
            "Replying to "
              .concat(comment.author.name, "; Symbol: ")
              .concat(symbol, "; Price: ")
              .concat(coin.price)
          );
          this.logger.info(comment.permalink, {
            author: comment.author.name,
            coin: coin,
            template: tpl,
          });
          this.reply(comment, tpl).then(function () {
            _this2.logger.info(
              "Replied to "
                .concat(comment.author.name, "; Symbol: ")
                .concat(symbol, "; Price: ")
                .concat(coin.price)
            );

            _this2.store.set(comment.parent_id, true);
          });
          comment
            .upvote()
            .then(function () {
              _this2.logger.info("Upvoted ".concat(comment.permalink));
            })
            ["catch"](function (err) {
              _this2.logger.error(
                "Failed to upvote ".concat(comment.permalink),
                {
                  err: err,
                }
              );
            });
        }
      },
      /**
       * @param {_Comment} comment
       */
    },
    {
      key: "onDownVoteComment",
      value: function onDownVoteComment(comment) {
        var _this3 = this;

        this.client
          .getComment(comment.parent_id)
          .fetch()
          .then(function (parentComment) {
            if (parentComment.author.id === _this3.me.id && comment.score < 1) {
              _this3.logger.debug(
                "low score - deleting comment",
                parentComment.permalink
              );

              _this3.store.put("unsubscribe", parentComment.author.id);

              _this3.del(parentComment);
            }
          });
      },
      /**
       * @param {_Comment} comment
       */
    },
    {
      key: "onGoodBadBotComment",
      value: function onGoodBadBotComment(comment) {
        var _this4 = this;

        if (_Constants.GoodBadBotPattern.test(comment.body)) {
          this.client
            .getComment(comment.parent_id)
            .fetch()
            .then(function (parentComment) {
              if (parentComment.author.id === _this4.client.me.id) {
                var bodyLower = comment.body.toLowerCase();

                if (bodyLower.includes("good bot")) {
                  _this4.reply(comment, _Constants.goodBotText);
                } else if (bodyLower.includes("bad bot")) {
                  _this4.logger.debug(
                    "bad bot replied - deleting comment",
                    parentComment.permalink
                  );

                  _this4.store.put("unsubscribe", parentComment.author.id);

                  _this4.del(parentComment);
                }
              }
            });
        }
      },
      /**
       *
       * @param {_Comment} comment
       * @param message
       * @return {Promise}
       */
    },
    {
      key: "reply",
      value: function reply(comment, message) {
        var _this5 = this;

        return comment.reply(message)["catch"](function (err) {
          _this5.logger.error("Failed to reply ".concat(comment.permalink), {
            err: err,
          });

          return err;
        });
      },
      /**
       *
       * @param {_Comment} comment
       * @return {Promise}
       */
    },
    {
      key: "del",
      value: function del(comment) {
        var _this6 = this;

        return comment["delete"]()["catch"](function (err) {
          _this6.logger.error("Failed to delete ".concat(comment.permalink), {
            err: err,
          });

          return err;
        });
      },
    },
    {
      key: "outOf",
      value: function outOf() {
        return (0, _Tools.randomInt)(0, 2) === 1;
      },
    },
    {
      key: "start",
      value: function start() {
        var _this7 = this;

        this.logger.info("Starting Crypto Price Bot...");
        this.stream.on("item", function (c) {
          return _this7.onComment(c);
        });
        this.store.set("price_bot_start", (0, _Tools.unixTimestamp)());
        (0, _Tools.logUnhandledRejection)(this.logger);
      },
    },
  ]);

  return PriceBot;
})(_Bot2["default"]);

var _default = PriceBot;
exports["default"] = _default;
