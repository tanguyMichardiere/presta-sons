import { logger } from "../logger";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  { ms = 100, limit = 3000 }: { ms?: number; limit?: number } = {},
): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } catch (error) {
    logger.debug(error, "attempt 0 failed");
    try {
      return await fn();
    } catch (error) {
      logger.debug(error, "attempt 1 failed");
      let attempt = 2;
      let lastError = error;
      while (Date.now() < start + limit) {
        await sleep(ms * 2 ** (attempt - 2));
        try {
          return await fn();
        } catch (error) {
          logger.debug(error, `attempt ${attempt} failed`);
          attempt += 1;
          lastError = error;
        }
      }
      throw lastError;
    }
  }
}
