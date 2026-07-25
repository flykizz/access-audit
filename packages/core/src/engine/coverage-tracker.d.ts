import type { CoverageData } from '../types';
export declare class CoverageTracker {
    private coverageData;
    updateCoverage(type: keyof CoverageData, value: number): void;
    getCoverage(): CoverageData;
    getMissingCoverage(): string[];
    calculateOverallScore(): number;
}
