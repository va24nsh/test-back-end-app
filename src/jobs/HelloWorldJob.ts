/**
 * Hello World Job
 * 
 * Sample job that prints hello world.
 */

import { ILogger } from '@adapters';

export class HelloWorldJob {
  private readonly logger: ILogger;

  constructor(dependencies: { 
    logger: ILogger;
  }) {
    this.logger = dependencies.logger;
  }

  async execute(): Promise<void> {
    this.logger.info('🔄 Starting hello world job', {
      jobName: 'HelloWorldJob'
    });

    try {
      this.logger.info('👋 Hello World!', {
        jobName: 'HelloWorldJob',
        timestamp: new Date().toISOString()
      });

      this.logger.info('✅ Hello world job completed', {
        jobName: 'HelloWorldJob'
      });

    } catch (error) {
      this.logger.error('❌ Hello world job failed', {
        jobName: 'HelloWorldJob',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}

