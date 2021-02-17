import { readFileSync } from "fs";
import { replyTemplate } from "./Constants";
import Logger from "./Logger";

class Template {
  constructor() {
    this.logger = Logger.create(this.constructor.name);
    this.tpl = this.open();
  }

  render(args) {
    return this.tpl.replace(/{(.*?)}/g, (match, p1) => args[p1]);
  }

  open() {
    try {
      return readFileSync(replyTemplate, "utf8");
    } catch (err) {
      this.logger.error(err);
      return "";
    }
  }
}

export default Template;
