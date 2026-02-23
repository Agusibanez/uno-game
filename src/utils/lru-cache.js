class LRUCache {
  constructor({ max = 50, maxAge = 30000 } = {}) {
    this.max = max;
    this.maxAge = maxAge;

    this.store = new Map();
  }

  _now() {
    return Date.now();
  }

  _isExpired(entry) {
    return !entry || entry.expiresAt <= this._now();
  }

  _touch(key, entry) {
    entry.expiresAt = this._now() + this.maxAge;

    this.store.delete(key);
    this.store.set(key, entry);
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (this._isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }

    this._touch(key, entry);
    return entry.value;
  }

  set(key, value) {
    const entry = {
      value,
      expiresAt: this._now() + this.maxAge,
    };

    if (this.store.has(key)) this.store.delete(key);
    this.store.set(key, entry);

    while (this.store.size > this.max) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }

  keys() {
    return Array.from(this.store.keys());
  }
}

module.exports = { LRUCache };
