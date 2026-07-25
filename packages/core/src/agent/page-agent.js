import { chromium } from 'playwright';
import { RuleEngine } from './rule-engine';
import { logger } from '../utils/logger';
class MockLLMProvider {
    async analyze(_page, type, _target) {
        const insights = {
            'keyboard-reachability': 'Checking if all interactive elements are reachable via keyboard',
            'keyboard-trap': 'Checking for keyboard trap conditions in focusable elements',
            'focus-visibility': 'Checking if focus indicators are visible',
            'focus-order': 'Checking if tab order follows visual layout',
            'modal-focus-return': 'Checking if focus returns to trigger after modal close',
        };
        return {
            status: 'unknown',
            insight: insights[type],
        };
    }
}
export class PageAgent {
    page = null;
    llmProvider;
    constructor(llmProvider) {
        this.llmProvider = llmProvider || new MockLLMProvider();
    }
    async init() {
        const browser = await chromium.launch({ headless: true });
        this.page = await browser.newPage();
    }
    async executeTask(task) {
        const { type, target, name } = task;
        if (!this.page) {
            await this.init();
        }
        try {
            const currentPage = this.page;
            if (!currentPage) {
                throw new Error('Page not initialized');
            }
            const llmResult = await this.llmProvider.analyze(currentPage, type, target);
            const ruleResult = await this.executeRule(type, target);
            return this.mergeResults(llmResult, ruleResult, type, target || '', name);
        }
        catch (error) {
            logger.error(`Behavior test failed: ${error.message}`);
            return {
                testType: type,
                targetElement: target || '',
                status: 'error',
                expectedBehavior: '',
                actualBehavior: error.message,
                llmInsight: undefined,
                fixSuggestion: undefined,
            };
        }
    }
    async executeRule(type, target) {
        if (!this.page) {
            return { status: 'unknown', details: {} };
        }
        const ruleEngine = new RuleEngine(this.page);
        return ruleEngine.execute(type, target);
    }
    mergeResults(llmResult, ruleResult, testType, targetElement, name) {
        let status = ruleResult.status;
        let llmInsight = llmResult.insight;
        let fixSuggestion;
        if (status === 'unknown') {
            status = llmResult.status;
        }
        if (status === 'fail') {
            fixSuggestion = this.getFixSuggestion(testType);
        }
        const expectedBehavior = this.getExpectedBehavior(testType);
        const actualBehavior = this.getActualBehavior(testType, ruleResult.details);
        return {
            testType,
            targetElement,
            status,
            expectedBehavior,
            actualBehavior,
            llmInsight,
            fixSuggestion,
        };
    }
    getExpectedBehavior(testType) {
        const behaviors = {
            'keyboard-reachability': 'All interactive elements should be reachable via keyboard',
            'keyboard-trap': 'Focus should not be trapped within a modal',
            'focus-visibility': 'Focus indicators should be visible',
            'focus-order': 'Tab order should follow visual layout',
            'modal-focus-return': 'Focus should return to trigger element after modal close',
        };
        return behaviors[testType];
    }
    getActualBehavior(testType, details) {
        const behaviors = {
            'keyboard-reachability': `Found ${details.unreachableCount} unreachable elements`,
            'keyboard-trap': details.isTrapped ? 'Focus is trapped' : 'Focus loop is working',
            'focus-visibility': details.hasFocusVisible ? 'Focus indicator is visible' : 'Focus indicator is hidden',
            'focus-order': details.isCorrectOrder ? 'Tab order is correct' : 'Tab order does not follow visual layout',
            'modal-focus-return': details.focusReturned ? 'Focus returned to trigger' : 'Focus did not return to trigger',
        };
        return behaviors[testType];
    }
    getFixSuggestion(testType) {
        const suggestions = {
            'keyboard-reachability': 'Add tabindex="0" to all interactive elements and ensure proper focus management',
            'keyboard-trap': 'Implement focus trapping with Tab/Shift+Tab navigation between first and last elements',
            'focus-visibility': 'Add visible focus styles using outline or box-shadow CSS properties',
            'focus-order': 'Adjust tabindex values or reorganize HTML to match visual layout',
            'modal-focus-return': 'Store trigger element reference and restore focus after modal closes',
        };
        return suggestions[testType];
    }
}
