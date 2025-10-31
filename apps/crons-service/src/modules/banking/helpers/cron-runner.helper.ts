import { Logger } from '@nestjs/common';
import { calculateDurationSeconds } from '@crons-service/modules/banking/helpers/banking.helpers';

export async function runCronJob<T>(
  jobName: string,
  logger: Logger,
  handler: () => Promise<T>,
): Promise<void> {
  const startTime = Date.now();
  logger.log(`[CRON] ${jobName} started at ${new Date().toISOString()}`);

  try {
    await handler();
    const duration = calculateDurationSeconds(startTime);
    logger.log(`[CRON] ${jobName} completed in ${duration}s`);
  } catch (error) {
    logger.error(`[ERROR] ${jobName} failed: ${error.message}`, error.stack);
  }
}
