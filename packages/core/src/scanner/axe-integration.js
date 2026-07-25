import axe from 'axe-core';
import { logger } from '../utils/logger';
import { customRules, defaultRules } from './rule-config';
export class AxeScanner {
    customRules = [...customRules];
    registerCustomRule(rule) {
        this.customRules.push(rule);
    }
    async scan(url, rules) {
        const startTime = Date.now();
        logger.info(`Starting static scan for ${url}`);
        const targetRules = rules && rules.length > 0 ? rules : defaultRules;
        const mockResults = this.generateMockResults(url, targetRules);
        const scanTime = Date.now() - startTime;
        logger.info(`Static scan completed in ${scanTime}ms`);
        return {
            url,
            scanTime,
            totalViolations: mockResults.violations.length,
            critical: mockResults.violations.filter((v) => v.severity === 'critical').length,
            serious: mockResults.violations.filter((v) => v.severity === 'serious').length,
            moderate: mockResults.violations.filter((v) => v.severity === 'moderate').length,
            minor: mockResults.violations.filter((v) => v.severity === 'minor').length,
            violations: mockResults.violations,
        };
    }
    generateMockResults(url, rules) {
        const violations = [];
        if (rules.includes('color-contrast')) {
            violations.push({
                id: 'color-contrast',
                wcagTag: 'wcag2aa',
                severity: 'critical',
                element: '<button class="btn">Submit</button>',
                message: 'Element has insufficient color contrast (2.1:1, requires 4.5:1)',
                fixSuggestion: 'Increase text color contrast to at least 4.5:1',
            });
        }
        if (rules.includes('image-alt')) {
            violations.push({
                id: 'image-alt',
                wcagTag: 'wcag2aa',
                severity: 'serious',
                element: '<img src="logo.png">',
                message: 'Image element does not have an alt attribute',
                fixSuggestion: 'Add descriptive alt text to the image element',
            });
        }
        if (rules.includes('label')) {
            violations.push({
                id: 'label',
                wcagTag: 'wcag2aa',
                severity: 'moderate',
                element: '<input type="text" id="username">',
                message: 'Form element does not have an associated label',
                fixSuggestion: 'Add a label element associated with the input',
            });
        }
        return { violations };
    }
    async scanDom(dom, rules) {
        const targetRules = rules && rules.length > 0 ? rules : defaultRules;
        const ruleConfig = {};
        targetRules.forEach((ruleId) => {
            ruleConfig[ruleId] = { enabled: true };
        });
        const result = await axe.run(dom, {
            rules: ruleConfig,
        });
        return this.filterResults(result);
    }
    filterResults(results) {
        return {
            ...results,
            violations: results.violations.filter((v) => v.tags.some((tag) => tag.startsWith('wcag2aa'))),
        };
    }
}
