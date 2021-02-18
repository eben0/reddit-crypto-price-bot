import { readFileSync, writeFileSync } from "fs";
import { defaultDbFile, writeSyncTime } from "./Constants";
import Logger from "./Logger";
import { wait } from "./Tools";

class Store {
  constructor(dbFile = defaultDbFile, sync = true) {
    this.logger = Logger.create(this.constructor.name);
    this.dbFile = dbFile;
    this.db = this.open();
    this._writing = false;
    if (sync) {
      this.writeSync();
    }
  }

  getAll() {
    return this.db.json;
  }

  get(key) {
    return this.db.json[key];
  }

  set(key, value) {
    this.db.json[key] = value;
  }

  replace(json) {
    this.db.json = Object.assign({}, json);
  }

  raw() {
    return JSON.stringify(this.db.json);
  }

  del(key) {
    delete this.db.json[key];
  }

  open() {
    this.logger.info(`reading ${this.dbFile}`);
    try {
      let raw = readFileSync(this.dbFile, "utf8");
      return {
        _raw: raw,
        json: JSON.parse(raw),
      };
    } catch (err) {
      this.logger.error({ err });
      return {};
    }
  }

  write() {
    if (this._writing) {
      this.logger.info(
        `another process writing, skipping. File: ${this.dbFile}`
      );
      return false;
    }
    this.logger.info(`writing ${this.dbFile}`);
    try {
      writeFileSync(this.dbFile, this.raw());
    } catch (err) {
      this.logger.error({ err });
      return false;
    }
    return true;
  }

  writeOpen() {
    let success = this.write();
    if (success) {
      this.db = this.open();
    }
    return Promise.resolve(success);
  }

  // need some race-condition protection
  writeSync() {
    return this.writeOpen()
      .then(() => wait(writeSyncTime))
      .then(() => this.writeSync());
  }
}

export default Store;
