"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("path"));

var _winston = require("winston");

var _Constants = require("./Constants");

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

var Logger = /*#__PURE__*/ (function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, null, [
    {
      key: "create",
      value: function create() {
        var _label =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : "";

        var loggerPath = process.env.LOGGER_PATH || "logs";
        var combine = _winston.format.combine,
          timestamp = _winston.format.timestamp,
          label = _winston.format.label,
          json = _winston.format.json;
        return (0, _winston.createLogger)({
          format: combine(
            label({
              label: _label,
            }),
            timestamp(),
            json()
          ),
          transports: [
            new _winston.transports.Console(),
            new _winston.transports.File({
              filename: _path["default"].join(
                loggerPath,
                _Constants.LoggerPaths.errFile
              ),
              level: "error",
            }),
            new _winston.transports.File({
              filename: _path["default"].join(
                loggerPath,
                _Constants.LoggerPaths.combinedFile
              ),
            }),
          ],
        });
      },
    },
  ]);

  return Logger;
})();

var _default = Logger;
exports["default"] = _default;
