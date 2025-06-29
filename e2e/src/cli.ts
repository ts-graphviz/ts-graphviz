import { glob } from 'glob';
import { resolve, dirname, basename } from 'node:path';
import { access, readFile, stat } from 'node:fs/promises';
import { parse as parseYAML } from 'yaml';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import type { E2ERunnerConfig, TestPackage } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '../..');

/**
 * Create and configure CLI program
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('e2e-test')
    .description('E2E test runner for ts-graphviz packages')
    .version('1.0.0')
    .argument('<packages...>', 'Test package patterns (glob patterns supported)')
    .option('-c, --config <file>', 'Configuration file path', 'etc/e2e-test.yaml')
    .option('--parallel', 'Run tests in parallel', false)
    .helpOption('-h, --help', 'Show help information');

  return program;
}

/**
 * Load configuration from YAML file
 */
export async function loadConfigFromFile(configPath: string): Promise<Partial<E2ERunnerConfig>> {
  try {
    await access(configPath);
    const content = await readFile(configPath, 'utf8');
    return parseYAML(content) as Partial<E2ERunnerConfig>;
  } catch (error) {
    throw new Error(`Failed to load config file ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Expand glob patterns to test packages
 */
export async function expandTestPackageGlobs(patterns: string[]): Promise<TestPackage[]> {
  const testPackages: TestPackage[] = [];

  for (const pattern of patterns) {
    const paths = await glob(pattern, { 
      absolute: true,
      cwd: workspaceRoot
    });

    for (const path of paths) {
      try {
        // Check if it's a directory
        const pathStat = await stat(path);
        if (!pathStat.isDirectory()) continue;
        
        const packageJsonPath = resolve(path, 'package.json');
        await access(packageJsonPath);
        
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        const testCommand = packageJson.scripts?.test || 'npm test';
        
        testPackages.push({
          name: packageJson.name || basename(path),
          path,
          testCommand,
          metadata: {
            type: inferPackageType(packageJson)
          }
        });
      } catch {
        // Skip directories without valid package.json
      }
    }
  }

  if (testPackages.length === 0) {
    throw new Error(`No valid test packages found for patterns: ${patterns.join(', ')}`);
  }

  return testPackages;
}

/**
 * Infer package type from package.json
 */
function inferPackageType(packageJson: any): string {
  const hasTypeScript = ['tsx', 'typescript', '@types/node'].some(dep => 
    packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
  );
  
  const moduleType = packageJson.type === 'module' ? 'esm' : 'cjs';
  const language = hasTypeScript ? 'typescript' : 'javascript';
  
  return `${moduleType}-${language}`;
}