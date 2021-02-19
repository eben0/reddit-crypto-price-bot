import { Logger } from "winston";

export function wait(time: number = 0): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function unixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function logUnhandledRejection(logger: Logger) {
  process.on("unhandledRejection", (error: Error) => {
    logger.error(error ? error.stack : error.message, { error });
  });
}

export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
