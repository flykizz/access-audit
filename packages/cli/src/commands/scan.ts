import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AxeScanner } from '@accessaudit/core';

export function createScanCommand(): Command {
  const command = new Command('scan')
    .description('Execute a static accessibility scan')
    .argument('<url>', 'Target URL to scan')
    .option('--rules, -r <rules>', 'Comma-separated list of rules to run')
    .option('--output, -o <format>', 'Output format: json, html, summary', 'summary')
    .option('--include-hidden', 'Include hidden elements in scan', false)
    .option('--timeout, -t <ms>', 'Timeout in milliseconds', '30000')
    .action(async (url, options) => {
      const spinner = ora('Starting accessibility scan...').start();

      try {
        const scanner = new AxeScanner();
        const rules = options.rules ? options.rules.split(',') : undefined;
        
        const result = await scanner.scan(url, rules);
        
        spinner.succeed(`Scan completed in ${result.scanTime}ms`);
        
        switch (options.output) {
          case 'json':
            console.log(JSON.stringify(result, null, 2));
            break;
          case 'html':
            printHtmlReport(result);
            break;
          case 'summary':
          default:
            printSummary(result);
            break;
        }
      } catch (error) {
        spinner.fail('Scan failed');
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  return command;
}

function printSummary(result: {
  url: string;
  scanTime: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: { id: string; severity: string; message: string }[];
}): void {
  console.log('\n' + chalk.bold('Accessibility Scan Summary'));
  console.log('='.repeat(50));
  console.log(chalk.cyan(`URL: ${result.url}`));
  console.log(chalk.cyan(`Scan Time: ${result.scanTime}ms`));
  console.log('');
  
  console.log(chalk.bold('Violations:'));
  console.log(`  ${chalk.red('Critical')}: ${result.critical}`);
  console.log(`  ${chalk.rgb(234, 88, 12)('Serious')}: ${result.serious}`);
  console.log(`  ${chalk.yellow('Moderate')}: ${result.moderate}`);
  console.log(`  ${chalk.blue('Minor')}: ${result.minor}`);
  console.log(`  ${chalk.bold('Total')}: ${result.totalViolations}`);
  
  if (result.violations.length > 0) {
    console.log('\n' + chalk.bold('Top Issues:'));
    result.violations.slice(0, 5).forEach((violation, index) => {
      const severityColor = {
        critical: chalk.red,
        serious: chalk.rgb(234, 88, 12),
        moderate: chalk.yellow,
        minor: chalk.blue,
      };
      console.log(`  ${index + 1}. [${severityColor[violation.severity as keyof typeof severityColor](violation.severity)}] ${violation.message}`);
    });
  }
  
  console.log('');
}

function printHtmlReport(result: {
  url: string;
  scanTime: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  violations: { id: string; wcagTag: string; severity: string; element: string; message: string; fixSuggestion: string }[];
}): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${result.url}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .violations { margin-top: 20px; }
    .violation { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
    .critical { border-left: 4px solid #dc2626; }
    .serious { border-left: 4px solid #ea580c; }
    .moderate { border-left: 4px solid #ca8a04; }
    .minor { border-left: 4px solid #2563eb; }
    .severity { font-weight: bold; text-transform: uppercase; }
    .fix { background: #f0fdf4; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>URL:</strong> ${result.url}</p>
    <p><strong>Scan Time:</strong> ${result.scanTime}ms</p>
    <p><strong>Critical:</strong> ${result.critical} | <strong>Serious:</strong> ${result.serious} | <strong>Moderate:</strong> ${result.moderate} | <strong>Minor:</strong> ${result.minor}</p>
    <p><strong>Total Violations:</strong> ${result.totalViolations}</p>
  </div>
  <div class="violations">
    <h2>Violations</h2>
    ${result.violations.map(v => `
    <div class="violation ${v.severity}">
      <p><span class="severity ${v.severity}">${v.severity}</span> ${v.message}</p>
      <div class="fix"><strong>Fix Suggestion:</strong> ${v.fixSuggestion}</div>
    </div>
    `).join('')}
  </div>
</body>
</html>`;
  
  console.log(html);
}
