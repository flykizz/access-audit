#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createScanCommand } from './commands/scan.js';
import { createAuditCommand } from './commands/audit.js';

const program = new Command();

program
  .name('accessaudit')
  .description('Accessibility audit tool for EN 301 549 compliance')
  .version('0.1.0');

program.addCommand(createScanCommand());
program.addCommand(createAuditCommand());

program
  .command('rules')
  .description('List available accessibility rules')
  .option('--category <cat>', 'Filter rules by category')
  .action((options) => {
    const rules = [
      { id: 'color-contrast', name: 'Color Contrast', category: 'perceivable', severity: 'critical' },
      { id: 'image-alt', name: 'Image Alt', category: 'perceivable', severity: 'serious' },
      { id: 'label', name: 'Form Label', category: 'operable', severity: 'moderate' },
      { id: 'button-name', name: 'Button Name', category: 'operable', severity: 'serious' },
      { id: 'link-name', name: 'Link Name', category: 'operable', severity: 'serious' },
      { id: 'aria-valid-attr', name: 'ARIA Valid Attributes', category: 'robust', severity: 'moderate' },
    ];

    const filteredRules = options.category
      ? rules.filter(r => r.category === options.category)
      : rules;

    console.log('\n' + chalk.bold('Available Rules'));
    console.log('='.repeat(50));
    filteredRules.forEach(rule => {
      console.log(`${chalk.cyan(rule.id)} - ${rule.name}`);
      console.log(`  Category: ${rule.category}`);
      console.log(`  Severity: ${rule.severity}`);
      console.log('');
    });
  });

program.parse();
