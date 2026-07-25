import type { Page } from 'playwright';
import type { RuleResult, TestType } from '../types';
export declare class RuleEngine {
    private page;
    constructor(page: Page);
    execute(type: TestType, target?: string): Promise<RuleResult>;
    private checkKeyboardReachability;
    private checkKeyboardTrap;
    private checkFocusVisibility;
    private checkFocusOrder;
    private checkModalFocusReturn;
}
