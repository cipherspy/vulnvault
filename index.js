#!/usr/bin/env node

/**
 * VulnVault - VAPT Reporting Tool
 * CLI entry point
 */

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateReport } from './src/reportGenerator.js';
import { scanImporter } from './src/scanImporter.js';
import { findingsManager } from './src/findingsManager.js';
import { config } from './src/config.js';

const program = new Command();
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

program
  .name('vulnvault')
  .description('VAPT Reporting & Findings Management Tool')
  .version(pkg.version);

// Import scan results
program
  .command('import <file>')
  .description('Import scan results (Nessus, Burp, OpenVAS, etc.)')
  .option('-t, --type <type>', 'Force scan type (nessus|burp|openvas|nmap)')
  .action(async (file, options) => {
    try {
      await scanImporter(file, options.type);
      console.log(chalk.green('✓ Scan imported successfully!'));
    } catch (error) {
      console.error(chalk.red('✗ Error:', error.message));
      process.exit(1);
    }
  });

// Generate report
program
  .command('generate')
  .description('Generate VAPT report')
  .option('-f, --format <format>', 'Report format (html|pdf|docx)', 'html')
  .option('-o, --output <path>', 'Output file path', './reports/report.html')
  .option('-t, --template <name>', 'Report template (standard|executive|technical)')
  .action(async (options) => {
    try {
      await generateReport(options);
      console.log(chalk.green(`✓ Report generated: ${options.output}`));
    } catch (error) {
      console.error(chalk.red('✗ Error:', error.message));
      process.exit(1);
    }
  });

// Manage findings
program
  .command('findings')
  .description('Manage vulnerabilities')
  .option('-l, --list', 'List all findings')
  .option('-a, --add', 'Add new finding')
  .option('-e, --edit <id>', 'Edit finding by ID')
  .option('-d, --delete <id>', 'Delete finding by ID')
  .option('-s, --status <status>', 'Update status (open|fixed|false-positive|risk-accepted)')
  .action(async (options) => {
    try {
      await findingsManager(options);
    } catch (error) {
      console.error(chalk.red('✗ Error:', error.message));
      process.exit(1);
    }
  });

// Interactive mode
program
  .command('interactive')
  .description('Interactive mode - guided workflow')
  .action(async () => {
    try {
      console.log(chalk.cyan.bold('\n🔒 VulnVault Interactive Mode\n'));
      
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            'Import scan results',
            'Generate report',
            'Manage findings',
            'View dashboard',
            'Export data',
            'Exit'
          ]
        }
      ]);
      
      // Handle actions based on selection
      console.log(chalk.green(`\n✓ Selected: ${answers.action}`));
      console.log(chalk.yellow('Run: vulnvault --help for available commands\n'));
      
    } catch (error) {
      console.error(chalk.red('✗ Error:', error.message));
      process.exit(1);
    }
  });

// Dashboard
program
  .command('dashboard')
  .description('Show summary dashboard')
  .action(async () => {
    try {
      const stats = await getDashboardStats();
      console.log(chalk.cyan.bold('\n📊 VulnVault Dashboard\n'));
      console.log(chalk.white('───────────────────────────────'));
      console.log(`  ${chalk.yellow('Total Findings')}:    ${stats.total}`);
      console.log(`  ${chalk.red('Critical')}:        ${stats.critical}`);
      console.log(`  ${chalk.magenta('High')}:           ${stats.high}`);
      console.log(`  ${chalk.yellow('Medium')}:         ${stats.medium}`);
      console.log(`  ${chalk.green('Low')}:            ${stats.low}`);
      console.log(`  ${chalk.gray('Info')}:            ${stats.info}`);
      console.log(chalk.white('───────────────────────────────'));
      console.log(`  ${chalk.cyan('Open')}:             ${stats.open}`);
      console.log(`  ${chalk.green('Fixed')}:           ${stats.fixed}`);
      console.log(`  ${chalk.gray('False Positive')}:   ${stats.falsePositive}`);
      console.log(chalk.white('───────────────────────────────\n'));
    } catch (error) {
      console.error(chalk.red('✗ Error:', error.message));
      process.exit(1);
    }
  });

// Export
program
  .command('export')
  .description('Export findings to CSV/JSON')
  .option('-f, --format <format>', 'Export format (csv|json)', 'csv')
  .option('-o, --output <path>', 'Output file path')
  .action(async (options) => {
    try {
      await exportData(options);
      console.log(chalk.green(`✓ Exported to: ${options.output || 'exports/'}`));
    } catch (error) {
      console.error(chalk.red('✗ Error:', error.message));
      process.exit(1);
    }
  });

// Helper functions (stubs - would be imported from modules)
async function getDashboardStats() {
  // Mock stats for demo
  return {
    total: 42,
    critical: 5,
    high: 12,
    medium: 15,
    low: 8,
    info: 2,
    open: 30,
    fixed: 8,
    falsePositive: 4
  };
}

async function exportData(options) {
  // Export logic
  console.log(`Exporting to ${options.format} format...`);
}

// Parse arguments
program.parse(process.argv);

// If no args, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
