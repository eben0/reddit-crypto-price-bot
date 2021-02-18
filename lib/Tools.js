"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.wait = wait;
exports.unixTimestamp = unixTimestamp;
exports.logUnhandledRejection = logUnhandledRejection;

function wait() {
  var time =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function unixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function logUnhandledRejection(logger) {
  process.on("unhandledRejection", function (error) {
    logger.error({
      error: error,
    });
  });
}
