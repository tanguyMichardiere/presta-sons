import { logger } from "../logger";

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function exponentialBackoff<T>(process: () => Promise<T>, limit = 30000): Promise<T> {
  const start = Date.now();
  try {
    return await process();
  } catch (error) {
    logger.debug(error, "attempt 0 failed");
    try {
      return await process();
    } catch (error) {
      logger.debug(error, "attempt 1 failed");
      let attempt = 2;
      let lastError = error;
      while (Date.now() < start + limit) {
        await sleep(1000 * 2 ** (attempt - 2));
        try {
          return await process();
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
