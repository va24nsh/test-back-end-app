/**
 * Cron Job Scheduler
 * 
 * Manages all scheduled jobs in the application.
 */

import * as cron from 'node-cron';
import { ILogger } from '@adapters';
import { HelloWorldJob } from '@jobs/HelloWorldJob';
import { runCronWithContext } from '@utils/cronContextUtils';

export class CronJobScheduler {
  private readonly logger: ILogger;
  private readonly helloWorldJob: HelloWorldJob;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(dependencies: { 
    logger: ILogger; 
    helloWorldJob: HelloWorldJob;
  }) {
    this.logger = dependencies.logger;
    this.helloWorldJob = dependencies.helloWorldJob;
  }

  /**
   * Start all scheduled jobs
   */
  startAll(): void {
    this.logger.info('🚀 Starting cron job scheduler');

    // Hello World Job - Every hour at minute 0
    this.scheduleJob('hello-world', '0 * * * *', async () => {
      await runCronWithContext('hello-world', async () => {
        try {
          await this.helloWorldJob.execute();
        } catch (error) {
          this.logger.error('❌ Hello world job failed', { 
            errorName: error instanceof Error ? error.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          });
        }
      });
    });

    this.logger.info('✅ All cron jobs scheduled successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    this.logger.info('🛑 Stopping all cron jobs');

    for (const [jobName, job] of this.jobs) {
      job.stop();
      this.logger.info(`✅ Stopped job: ${jobName}`);
    }

    this.jobs.clear();
  }

  /**
   * Schedule a new job
   */
  private scheduleJob(name: string, cronExpression: string, task: () => Promise<void>): void {
    const scheduledTask = cron.schedule(cronExpression, task, {
      timezone: 'UTC'
    });

    this.jobs.set(name, scheduledTask);
    scheduledTask.start();

    this.logger.info(`📅 Scheduled job: ${name} with expression: ${cronExpression}`);
  }

  /**
   * Get status of all jobs
   */
  getJobStatus(): { [jobName: string]: boolean } {
    const status: { [jobName: string]: boolean } = {};
    
    for (const [jobName, job] of this.jobs) {
      // Check if job is running (ScheduledTask doesn't have getStatus, but we can check if it exists)
      status[jobName] = job !== null && job !== undefined;
    }

    return status;
  }
}

