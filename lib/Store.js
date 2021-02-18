"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;

var _fs = require("fs");

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

var Store = /*#__PURE__*/ (function () {
  function Store() {
    var dbFile =
      arguments.length > 0 && arguments[0] !== undefined
        ? arguments[0]
        : _Constants.defaultDbFile;
    var sync =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, Store);

    this.logger = _Logger["default"].create(this.constructor.name);
    this.dbFile = dbFile;
    this.db = this.open();
    this._writing = false;

    if (sync) {
      this.writeSync();
    }
  }

  _createClass(Store, [
    {
      key: "getAll",
      value: function getAll() {
        return this.db.json;
      },
    },
    {
      key: "get",
      value: function get(key) {
        return this.db.json[key];
      },
    },
    {
      key: "set",
      value: function set(key, value) {
        this.db.json[key] = value;
      },
    },
    {
      key: "replace",
      value: function replace(json) {
        this.db.json = Object.assign({}, json);
      },
    },
    {
      key: "raw",
      value: function raw() {
        return JSON.stringify(this.db.json);
      },
    },
    {
      key: "del",
      value: function del(key) {
        delete this.db.json[key];
      },
    },
    {
      key: "open",
      value: function open() {
        this.logger.info("reading ".concat(this.dbFile));

        try {
          var raw = (0, _fs.readFileSync)(this.dbFile, "utf8");
          return {
            _raw: raw,
            json: JSON.parse(raw),
          };
        } catch (err) {
          this.logger.error({
            err: err,
          });
          return {};
        }
      },
    },
    {
      key: "write",
      value: function write() {
        if (this._writing) {
          this.logger.info(
            "another process writing, skipping. File: ".concat(this.dbFile)
          );
          return false;
        }

        this.logger.info("writing ".concat(this.dbFile));

        try {
          (0, _fs.writeFileSync)(this.dbFile, this.raw());
        } catch (err) {
          this.logger.error({
            err: err,
          });
          return false;
        }

        return true;
      },
    },
    {
      key: "writeOpen",
      value: function writeOpen() {
        var success = this.write();

        if (success) {
          this.db = this.open();
        }

        return Promise.resolve(success);
      }, // need some race-condition protection
    },
    {
      key: "writeSync",
      value: function writeSync() {
        var _this = this;

        return this.writeOpen()
          .then(function () {
            return (0, _Tools.wait)(_Constants.writeSyncTime);
          })
          .then(function () {
            return _this.writeSync();
          });
      },
    },
  ]);

  return Store;
})();

var _default = Store;
exports["default"] = _default;
