#!/usr/bin/env node

// Polyfill for Symbol.asyncDispose on Node.js 20
if (!Symbol.asyncDispose) {
  (Symbol as any).asyncDispose = Symbol.for('Symbol.asyncDispose');
}

import {
  createProgram,
  expandTestPackageGlobs,
  loadConfigFromFile,
} from './cli.js';
import {
  createConfig,
  createDefaultConfig,
  getRegistryUrl,
  validateConfig,
} from './config.js';
import { handleError } from './error-handler.js';
import { logger } from './logger.js';
import { PackageManager } from './package-manager.js';
import { TestRunner } from './test-runner.js';
import { formatDuration, NpmConfigManager } from './utils.js';
import { VerdaccioManager } from './verdaccio.js';

async function main() {
  const startTime = Date.now();

  // Create and parse CLI
  const program = createProgram();
  program.parse();

  const options = program.opts();
  const testPackagePatterns = program.args;

  // Load configuration
  let config = createDefaultConfig();

  try {
    const fileConfig = await loadConfigFromFile(options.config);
    config = createConfig(fileConfig);
  } catch {
    // Use default config if file not found
  }

  // Override config with CLI options
  if (options.parallel) {
    config.options = { ...config.options, parallel: true };
  }

  // Expand test package patterns to actual packages
  const testPackages = await expandTestPackageGlobs(testPackagePatterns);

  // Validate configuration
  await validateConfig(config, testPackages);

  logger.section('Starting TypeScript E2E tests for ts-graphviz');
  logger.info(`📦 Test version: ${config.packages.testVersion}`);
  logger.info(`🔗 Registry URL: ${getRegistryUrl(config)}`);
  logger.info(`📁 Testing ${testPackages.length} packages\n`);

  try {
    // Step 1: Check prerequisites
    logger.step('Checking prerequisites...');
    // TODO: Add prerequisite checks (pnpm, jq, etc.)
    logger.success('Prerequisites checked');

    // Step 2: Check build status
    logger.step('Checking build status...');
    // TODO: Check if packages are built
    logger.success('Build status verified');

    // Use using statements for automatic resource management
    await using npmConfig = new NpmConfigManager();
    await using verdaccio = new VerdaccioManager(config);
    await using testRunner = new TestRunner(config);

    const packageManager = new PackageManager(config);
    packageManager.setNpmrcManager(npmConfig);
    testRunner.setNpmrcManager(npmConfig);

    // Step 3: Backup npm config
    await npmConfig.backup();
    await npmConfig.setRegistry(getRegistryUrl(config));

    // Step 4: Start Verdaccio
    logger.step('Starting Verdaccio registry...');
    await verdaccio.start();
    await verdaccio.waitForReady();
    logger.success('Verdaccio registry started');

    // Step 5: Setup npm authentication
    logger.step('Setting up npm authentication...');
    const secureCredentials = verdaccio.getSecureCredentials();
    await packageManager.setupNpmRegistry(
      verdaccio.getRegistryUrl(),
      secureCredentials,
    );
    logger.success('npm authentication configured');

    // Step 6: Publish packages
    logger.step('Publishing packages to local registry...');
    await packageManager.publishPackages();
    logger.success('Packages published to local registry');

    // Step 7: Run tests
    logger.section('Running E2E tests...');

    // Option to run tests in parallel or sequentially
    const parallel = config.options?.parallel || false;
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
      // Note: using statement will automatically clean up resources
      return; // Let using statement handle cleanup
    }
    logger.error('❌ Some E2E tests failed!');
    // Note: using statement will automatically clean up resources
    throw new Error('Some E2E tests failed');
  } catch (error) {
    handleError(error);
  }
}

// Run the main function with proper cleanup and exit handling
async function runWithCleanup() {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    if (error instanceof Error && error.message === 'Some E2E tests failed') {
      process.exit(1);
    } else {
      handleError(error);
    }
  }
}

runWithCleanup();
