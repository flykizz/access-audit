import type { AuditConfig, ScanTask, BehaviorTask } from '../types';
import { CoverageTracker } from './coverage-tracker';
export type StrategyType = 'incremental' | 'daily' | 'weekly' | 'on-demand';
export declare class StrategyScheduler {
    private taskGenerator;
    private coverageTracker;
    constructor(coverageTracker: CoverageTracker);
    schedule(strategy: StrategyType, config: AuditConfig): (ScanTask | BehaviorTask)[];
    private scheduleIncremental;
    private scheduleDaily;
    private scheduleWeekly;
    private scheduleOnDemand;
    private getTestTypeName;
}
