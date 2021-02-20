import { readFileSync, writeFileSync } from "fs";
import merge from "lodash.merge";
import { defaultDbFile, writeSyncTime } from "./Constants";
import Logger, { WinstonLogger } from "./Logger";
import { wait } from "./Tools";

declare interface StoreOptions {
  json?: object;
  _raw?: string;
}

class Store {
  private logger: WinstonLogger;
  protected dbFile: string;
  protected db: StoreOptions;
  private readonly _writing: boolean;

  constructor(dbFile: string = defaultDbFile, sync: boolean = true) {
    this.logger = Logger.create(this.constructor.name);
    this.dbFile = dbFile;
    this.db = this.open();
    this._writing = false;
    if (sync) {
      this.writeSync();
    }
  }

  getAll(): object {
    return this.db.json;
  }

  get(key): any {
    return this.db.json[key];
  }

  set(key, value) {
    this.db.json[key] = value;
  }

  replace(json) {
    this.db.json = merge({}, json);
  }

  raw(): string {
    return JSON.stringify(this.db.json);
  }

  del(key) {
    delete this.db.json[key];
  }

  put(collectionKey, item) {
    let collection = this.get(collectionKey) || [];
    collection.push(item);
    this.set(collectionKey, collection);
  }

  open(): StoreOptions {
    this.logger.debug(`reading ${this.dbFile}`);
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

  write(): boolean {
    if (this._writing) {
      this.logger.debug(
        `another process writing, skipping. File: ${this.dbFile}`
      );
      return false;
    }
    this.logger.debug(`writing ${this.dbFile}`);
    try {
      writeFileSync(this.dbFile, this.raw());
    } catch (err) {
      this.logger.error({ err });
      return false;
    }
    return true;
  }

  writeOpen(): Promise<boolean> {
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
