import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import { AxeScanner, CoverageTracker, PageAgent, PathDiscoverer, ReportGenerator } from '@accessaudit/core';
import type { AuditConfig, BehaviorTask, BehaviorResult, ScanResult, GoldenPath, StaticViolation } from '@accessaudit/core';

export function createAuditCommand(): Command {
  const command = new Command('audit')
    .description('Execute a complete accessibility audit with dynamic analysis and full flow analysis')
    .option('--config, -c <path>', 'Path to config file')
    .option('--urls, -u <urls>', 'Comma-separated list of URLs')
    .option('--static', 'Include static scan', true)
    .option('--behavior', 'Include behavior tests', true)
    .option('--discover', 'Enable path discovery', true)
    .option('--full-site', 'Enable full site crawling', false)
    .option('--golden-path <path>', 'Path to golden path config')
    .option('--output, -o <dir>', 'Output directory', './reports')
    .option('--depth <n>', 'Path discovery depth', '3')
    .option('--max-paths <n>', 'Maximum discovered paths', '10')
    .option('--max-pages <n>', 'Maximum pages for full site scan', '20')
    .option('--provider <name>', 'LLM provider (doubao, qwen, glm, deepseek, openai)', 'qwen')
    .option('--api-key <key>', 'LLM API key')
    .option('--base-url <url>', 'LLM base URL')
    .option('--model <name>', 'LLM model name')
    .action(async (options) => {
      const spinner = ora('Starting accessibility audit...').start();

      try {
        let config: AuditConfig;
        
        if (options.config) {
          const configFile = await fs.readFile(options.config, 'utf-8');
          config = JSON.parse(configFile);
        } else {
          config = {
            includeStaticScan: options.static,
            includeBehaviorTest: options.behavior,
            scanRules: ['color-contrast', 'image-alt', 'label', 'button-name', 'link-name', 'aria-valid-attr'],
            behaviorTests: ['keyboard-reachability', 'keyboard-trap', 'focus-visibility', 'focus-order', 'modal-focus-return'],
            goldenPaths: [],
            enablePathDiscovery: options.discover,
            maxDiscoveredPaths: parseInt(options.maxPaths || '10'),
            pathDiscoveryDepth: parseInt(options.depth || '3'),
            enableFullSiteScan: options.fullSite,
            maxPages: parseInt(options.maxPages || '20'),
          };
        }

        const urls = options.urls || options.U ? (options.urls || options.U).split(',') : ['https://example.com'];
        const fullSiteScan = config.enableFullSiteScan || options.fullSite;
        const maxPages = config.maxPages || parseInt(options.maxPages || '20');
        
        spinner.text = `Auditing ${urls.length} URLs...${fullSiteScan ? ' (Full site mode)' : ''}`;

        const allScanResults: ScanResult[] = [];
        const allBehaviorResults: BehaviorResult[] = [];
        const coverageTracker = new CoverageTracker();
        const discoveredPaths: GoldenPath[] = [];

        for (const url of urls) {
          if (config.enablePathDiscovery) {
            const discoverer = new PathDiscoverer();
            
            if (fullSiteScan) {
              spinner.text = `Full site crawling ${url}... (max ${maxPages} pages)`;
              const discoveryResult = await discoverer.discoverAllPages(url, maxPages);
              discoveredPaths.push(...discoveryResult.paths);
              coverageTracker.updateCoverage('goldenPathCoverage', discoveryResult.pathCoverage);
            } else {
              spinner.text = `Discovering paths for ${url}...`;
              const discoveryResult = await discoverer.discover(url, config.pathDiscoveryDepth, config.maxDiscoveredPaths);
              discoveredPaths.push(...discoveryResult.paths);
              coverageTracker.updateCoverage('goldenPathCoverage', discoveryResult.pathCoverage);
            }
          }
        }

        const allPathsToTest = discoveredPaths.length > 0 ? discoveredPaths : [
          {
            id: 'manual-path',
            name: 'Manual Path',
            steps: urls.map((url: string) => ({ name: url, url })),
            priority: 'high',
            businessWeight: 100,
          },
        ];

        spinner.text = `Testing ${allPathsToTest.length} ${fullSiteScan ? 'pages' : 'paths'}...`;

        for (const path of allPathsToTest) {
          spinner.text = `Analyzing ${fullSiteScan ? 'page' : 'path'}: ${path.name}`;

          for (const step of path.steps) {
            if (config.includeStaticScan) {
              spinner.text = `Static scanning ${step.url}...`;
              const scanner = new AxeScanner();
              const scanResult = await scanner.scan(step.url, config.scanRules);
              allScanResults.push(scanResult);
            }

            if (config.includeBehaviorTest) {
              spinner.text = `Dynamic analysis ${step.url}...`;
              const agent = new PageAgent(undefined, {
                provider: options.provider as 'doubao' | 'qwen' | 'glm' | 'deepseek' | 'openai',
                apiKey: options.apiKey,
                baseUrl: options.baseUrl,
                model: options.model,
              });
              
              for (const testType of config.behaviorTests) {
                const task: BehaviorTask = {
                  type: testType,
                  name: getTestTypeName(testType),
                  priority: 'high',
                  target: step.url,
                };
                const behaviorResult = await agent.executeTask(task);
                allBehaviorResults.push(behaviorResult);

                if (testType === 'keyboard-reachability') {
                  coverageTracker.updateCoverage('keyboardReachRate', 
                    behaviorResult.status === 'pass' ? 100 : 50);
                } else if (testType === 'focus-visibility') {
                  coverageTracker.updateCoverage('focusVisibleRate', 
                    behaviorResult.status === 'pass' ? 100 : 50);
                } else if (testType === 'modal-focus-return') {
                  coverageTracker.updateCoverage('modalFocusReturnRate', 
                    behaviorResult.status === 'pass' ? 100 : 50);
                }
              }
              
              await agent.close();
            }
          }
        }

        spinner.succeed('Audit completed');

        const outputDir = options.output || options.O || './reports';
        await fs.ensureDir(outputDir);

        const reportGenerator = new ReportGenerator();
        const jsonReport = await reportGenerator.generate(
          allScanResults,
          allBehaviorResults,
          coverageTracker.getCoverage(),
          { format: 'json' },
          fullSiteScan ? 'full-site' : 'path-discovery'
        );
        const jsonReportPath = `${outputDir}/audit-report-${Date.now()}.json`;
        await fs.writeFile(jsonReportPath, typeof jsonReport === 'string' ? jsonReport : JSON.stringify(jsonReport, null, 2));

        const htmlReport = await reportGenerator.generate(
          allScanResults,
          allBehaviorResults,
          coverageTracker.getCoverage(),
          { format: 'html' },
          fullSiteScan ? 'full-site' : 'path-discovery'
        );
        const htmlReportPath = `${outputDir}/audit-report-${Date.now()}.html`;
        await fs.writeFile(htmlReportPath, typeof htmlReport === 'string' ? htmlReport : JSON.stringify(htmlReport));

        console.log('\n' + chalk.bold('Accessibility Audit Report'));
        console.log('='.repeat(60));
        console.log(chalk.cyan(`JSON Report: ${jsonReportPath}`));
        console.log(chalk.cyan(`HTML Report: ${htmlReportPath}`));
        console.log(chalk.grey(`Scan Mode: ${fullSiteScan ? 'Full Site' : 'Path Discovery'}`));
        console.log(chalk.grey(`Total Pages Scanned: ${allScanResults.length}`));
        console.log('');

        console.log(chalk.bold('📊 Coverage Summary'));
        console.log('-'.repeat(60));
        const coverage = coverageTracker.getCoverage();
        console.log(`  Page Coverage: ${coverage.goldenPathCoverage}%`);
        console.log(`  Keyboard Reachability: ${coverage.keyboardReachRate}%`);
        console.log(`  Focus Visibility: ${coverage.focusVisibleRate}%`);
        console.log(`  Modal Focus Return: ${coverage.modalFocusReturnRate}%`);
        console.log(`  Overall Score: ${coverageTracker.calculateOverallScore()}%`);
        console.log('');

        console.log(chalk.bold('🔍 Discovered ' + (fullSiteScan ? 'Pages' : 'Paths')));
        console.log('-'.repeat(60));
        discoveredPaths.slice(0, 10).forEach((path, index) => {
          const priorityColor = {
            critical: chalk.red,
            high: chalk.rgb(234, 88, 12),
            medium: chalk.yellow,
            low: chalk.blue,
          };
          console.log(`  ${index + 1}. ${path.name}`);
          console.log(`     Priority: ${priorityColor[path.priority](path.priority)}`);
          console.log(`     URL: ${path.urlPattern || 'N/A'}`);
        });
        if (discoveredPaths.length > 10) {
          console.log(`  ... and ${discoveredPaths.length - 10} more`);
        }
        console.log('');

        const totalViolations = allScanResults.reduce((sum, r) => sum + r.totalViolations, 0);
        const passCount = allBehaviorResults.filter(br => br.status === 'pass').length;
        const failCount = allBehaviorResults.filter(br => br.status === 'fail').length;
        
        console.log(chalk.bold('📈 Test Results'));
        console.log('-'.repeat(60));
        console.log(`  Total Violations (Static): ${totalViolations}`);
        console.log(`  Behavior Tests Passed: ${chalk.green(passCount)}`);
        console.log(`  Behavior Tests Failed: ${chalk.red(failCount)}`);
        console.log('');

        console.log(chalk.bold('📋 Per-Page Violations'));
        console.log('-'.repeat(60));
        allScanResults.forEach((scan, index) => {
          console.log(`  ${index + 1}. ${scan.url}`);
          if (scan.totalViolations > 0) {
            console.log(`     Violations: ${scan.critical} critical, ${scan.serious} serious, ${scan.moderate} moderate, ${scan.minor} minor`);
            scan.violations.forEach(v => {
              console.log(`       - ${v.severity}: ${v.message}`);
              console.log(`         DOM Path: ${v.domPath}`);
              console.log(`         Selector: ${v.selector}`);
            });
          } else {
            console.log(`     ✓ No violations found`);
          }
        });
        console.log('');

      } catch (error) {
        spinner.fail('Audit failed');
        console.error(chalk.red(`Error: ${(error as Error).message}`));
        process.exit(1);
      }
    });

  return command;
}

function getTestTypeName(testType: string): string {
  const names: Record<string, string> = {
    'keyboard-reachability': '键盘可达性检测',
    'keyboard-trap': '键盘陷阱检测',
    'focus-visibility': '焦点可见性检测',
    'focus-order': '焦点顺序检测',
    'modal-focus-return': 'Modal 焦点回弹检测',
  };
  return names[testType] || testType;
}