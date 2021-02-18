export function wait(time = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function unixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function logUnhandledRejection(logger) {
  process.on("unhandledRejection", (error) => {
    logger.error({ error });
  });
}

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
