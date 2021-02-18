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
