"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;

var _fs = require("fs");

var _Constants = require("./Constants");

var _Logger = _interopRequireDefault(require("./Logger"));

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

var Template = /*#__PURE__*/ (function () {
  function Template() {
    _classCallCheck(this, Template);

    this.logger = _Logger["default"].create(this.constructor.name);
    this.tpl = this.open();
  }

  _createClass(Template, [
    {
      key: "render",
      value: function render(args) {
        return this.tpl.replace(/{(.*?)}/g, function (match, p1) {
          return args[p1];
        });
      },
    },
    {
      key: "open",
      value: function open() {
        try {
          return (0, _fs.readFileSync)(_Constants.replyTemplate, "utf8");
        } catch (err) {
          this.logger.error(err);
          return "";
        }
      },
    },
  ]);

  return Template;
})();

var _default = Template;
exports["default"] = _default;
