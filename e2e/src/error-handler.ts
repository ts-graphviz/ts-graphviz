import { logger } from './logger.js';

export class E2EError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'E2EError';
  }
}

export class ConfigurationError extends E2EError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONFIG_ERROR', cause);
    this.name = 'ConfigurationError';
  }
}

export class VerdaccioError extends E2EError {
  constructor(message: string, cause?: Error) {
    super(message, 'VERDACCIO_ERROR', cause);
    this.name = 'VerdaccioError';
  }
}

export class TestExecutionError extends E2EError {
  constructor(
    message: string,
    public readonly testName: string,
    cause?: Error,
  ) {
    super(message, 'TEST_EXECUTION_ERROR', cause);
    this.name = 'TestExecutionError';
  }
}

export class PackagePublishError extends E2EError {
  constructor(
    message: string,
    public readonly packageName: string,
    cause?: Error,
  ) {
    super(message, 'PACKAGE_PUBLISH_ERROR', cause);
    this.name = 'PackagePublishError';
  }
}

/**
 * Handles errors gracefully with appropriate logging and cleanup
 */
export function handleError(
  error: unknown,
  cleanup?: () => Promise<void>,
): never {
  if (error instanceof E2EError) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.cause) {
      logger.debug('Caused by:', error.cause);
    }
  } else if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.debug('Stack trace:', error.stack);
  } else {
    logger.error(`Unknown error: ${String(error)}`);
  }

  if (cleanup) {
    cleanup()
      .catch((cleanupError) => {
        logger.error('Cleanup failed:', cleanupError);
      })
      .finally(() => {
        process.exit(1);
      });
  } else {
    process.exit(1);
  }

  // TypeScript requires a never return, but process.exit() already terminates
  throw new Error('Process should have exited');
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cleanup?: () => Promise<void>,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, cleanup);
    }
  };
}
