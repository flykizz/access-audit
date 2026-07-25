import type { BehaviorTask, ScanTask, AuditConfig } from '../types';
import { CoverageTracker } from './coverage-tracker';
export declare class TaskGenerator {
    private coverageTracker;
    constructor(coverageTracker: CoverageTracker);
    generateTasks(config: AuditConfig): (ScanTask | BehaviorTask)[];
    private generateStaticTasks;
    private generateBehaviorTasks;
    private createBehaviorTask;
    private prioritizeTasks;
}
