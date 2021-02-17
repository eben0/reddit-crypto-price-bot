import { readFileSync, writeFileSync } from "fs";

const defaultDbFile = "db/store.json";
const writeSyncTime = 5000;

class Store {
  constructor(dbFile = defaultDbFile, sync = true) {
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
    try {
      let raw = readFileSync(this.dbFile, "utf8");
      return {
        _raw: raw,
        json: JSON.parse(raw),
      };
    } catch (err) {
      console.error(err);
      return {};
    }
  }

  write() {
    try {
      writeFileSync(this.dbFile, this.raw());
    } catch (err) {
      console.error(err);
    }
  }

  // need some race-condition protection
  writeSync() {
    setInterval(() => {
      if (this._writing || this.raw() === this.db._raw) return;
      this._writing = true;
      this.write();
      this.db = this.open();
      this._writing = false;
    }, writeSyncTime);
  }
}

export default Store;
