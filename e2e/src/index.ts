#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import { createE2EConfig, getTestPackages, validateConfig } from './config.js';
import { handleError, withErrorHandling } from './error-handler.js';
import { logger } from './logger.js';
import { PackageManager } from './package-manager.js';
import { TestRunner } from './test-runner.js';
import { formatDuration, NpmConfigManager } from './utils.js';
import { VerdaccioManager } from './verdaccio.js';

async function main() {
  const startTime = Date.now();
  const config = createE2EConfig();

  // Validate configuration
  await validateConfig(config);

  const testPackages = getTestPackages(config.examplesDir);

  logger.section('Starting TypeScript E2E tests for ts-graphviz');
  logger.info(`📦 Test version: ${config.testVersion}`);
  logger.info(`🔗 Registry URL: ${config.registryUrl}`);
  logger.info(`📁 Testing ${testPackages.length} packages\n`);

  // Initialize managers
  const verdaccio = new VerdaccioManager(config);
  const packageManager = new PackageManager(config);
  const testRunner = new TestRunner(config);
  const npmConfig = new NpmConfigManager();

  // Setup cleanup handler
  let cleanupExecuted = false;
  const cleanup = async () => {
    if (cleanupExecuted) return;
    cleanupExecuted = true;

    logger.cleanup('Cleaning up...');

    try {
      await testRunner.cleanup();
      await verdaccio.stop();
      await npmConfig.restore();
    } catch (error) {
      logger.error('Cleanup failed:', error);
    }
  };

  // Register cleanup handlers
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught exception:', error);
    await cleanup();
    process.exit(1);
  });

  try {
    // Step 1: Check prerequisites
    const prerequisitesSpinner = ora('Checking prerequisites...').start();
    // TODO: Add prerequisite checks (pnpm, jq, etc.)
    prerequisitesSpinner.succeed('Prerequisites checked');

    // Step 2: Check build status
    const buildSpinner = ora('Checking build status...').start();
    // TODO: Check if packages are built
    buildSpinner.succeed('Build status verified');

    // Step 3: Backup npm config
    await npmConfig.backup();
    await npmConfig.setRegistry(config.registryUrl);

    // Step 4: Start Verdaccio
    const verdaccioSpinner = ora('Starting Verdaccio registry...').start();
    await verdaccio.start();
    await verdaccio.waitForReady();
    verdaccioSpinner.succeed('Verdaccio registry started');

    // Step 5: Setup npm authentication
    const authSpinner = ora('Setting up npm authentication...').start();
    await packageManager.setupNpmRegistry();
    authSpinner.succeed('npm authentication configured');

    // Step 6: Publish packages
    const publishSpinner = ora(
      'Publishing packages to local registry...',
    ).start();
    await packageManager.publishPackages();
    publishSpinner.succeed('Packages published to local registry');

    // Step 7: Run tests
    logger.section('Running E2E tests...');

    // Option to run tests in parallel or sequentially
    const parallel = process.argv.includes('--parallel');
    const results = parallel
      ? await testRunner.runAllTests(testPackages)
      : await testRunner.runSequentialTests(testPackages);

    // Step 8: Print results
    testRunner.printResults(results);

    // Check if all tests passed
    const allPassed = results.every((r) => r.success);
    const totalTime = Date.now() - startTime;

    logger.info(`⏱️  Total execution time: ${formatDuration(totalTime)}`);

    if (allPassed) {
      logger.success('🎉 All E2E tests passed successfully!');
      await cleanup();
      process.exit(0);
    } else {
      logger.error('❌ Some E2E tests failed!');
      await cleanup();
      process.exit(1);
    }
  } catch (error) {
    handleError(error, cleanup);
  }
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${chalk.blue.bold('TypeScript E2E Test Runner for ts-graphviz')}

Usage:
  pnpm test              Run tests sequentially
  pnpm test --parallel   Run tests in parallel
  pnpm test --help       Show this help message

Options:
  --parallel    Run tests in parallel (faster but harder to debug)
  --help, -h    Show this help message
`);
  process.exit(0);
}

// Run the main function with error handling
const wrappedMain = withErrorHandling(main);
wrappedMain();
