class Ok {
  constructor(value) {
    this.value = value;
  }

  isOk() {
    return true;
  }

  isErr() {
    return false;
  }

  map(fn) {
    return new Ok(fn(this.value));
  }

  chain(fn) {
    return fn(this.value);
  }

  mapError() {
    return this; 
  }

  unwrapOr() {
    return this.value;
  }

  unwrap() {
    return this.value;
  }
}

class Err {
  constructor(error) {
    this.error = error;
  }

  isOk() {
    return false;
  }

  isErr() {
    return true;
  }

  map() {
    return this; 
  }

  chain() {
    return this; 
  }

  mapError(fn) {
    return new Err(fn(this.error));
  }

  unwrapOr(defaultValue) {
    return defaultValue;
  }

  unwrap() {
    throw this.error;
  }
}

function ok(value) {
  return new Ok(value);
}

function err(error) {
  return new Err(error);
}

class ResultAsync {
  constructor(thunk) {
    this.thunk = thunk; 
  }

  static ok(value) {
    return new ResultAsync(() => Promise.resolve(ok(value)));
  }

  static err(error) {
    return new ResultAsync(() => Promise.resolve(err(error)));
  }

  static fromPromise(promiseFactory, onError) {
    return new ResultAsync(() =>
      promiseFactory()
        .then((val) => ok(val))
        .catch((e) => err(onError ? onError(e) : e)),
    );
  }

  map(fn) {
    return new ResultAsync(() =>
      this.thunk().then((r) => (r.isOk() ? r.map(fn) : r)),
    );
  }

  chain(fn) {
    return new ResultAsync(() =>
      this.thunk().then((r) => {
        if (r.isErr()) return r;
        return fn(r.value).thunk();
      }),
    );
  }

  mapError(fn) {
    return new ResultAsync(() =>
      this.thunk().then((r) => (r.isErr() ? r.mapError(fn) : r)),
    );
  }

  run() {
    return this.thunk();
  }
}

module.exports = { Ok, Err, ok, err, ResultAsync };
