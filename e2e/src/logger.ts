import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private getLevelValue(level: LogLevel): number {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelValue(level) >= this.getLevelValue(this.level);
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray(`🔍 ${message}`), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue(`ℹ️  ${message}`), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.log(chalk.yellow(`⚠️  ${message}`), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(chalk.red(`❌ ${message}`), ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(chalk.green(`✅ ${message}`), ...args);
    }
  }

  section(title: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue.bold(`\n🚀 ${title}`));
    }
  }

  step(message: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.blue(`📋 ${message}`));
    }
  }

  running(message: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.cyan(`🏃 ${message}`));
    }
  }

  cleanup(message: string): void {
    if (this.shouldLog('info')) {
      console.log(chalk.yellow(`🧹 ${message}`));
    }
  }
}

// Default logger instance
export const logger = new Logger('debug');
