export class CoverageTracker {
    coverageData = {
        keyboardReachRate: 0,
        focusVisibleRate: 0,
        nameComputationRate: 0,
        roleSemanticsRate: 0,
        modalFocusReturnRate: 0,
        goldenPathCoverage: 0,
        componentInteractionCoverage: 0,
    };
    updateCoverage(type, value) {
        this.coverageData[type] = value;
    }
    getCoverage() {
        return { ...this.coverageData };
    }
    getMissingCoverage() {
        const missing = [];
        Object.entries(this.coverageData).forEach(([key, value]) => {
            if (value < 100) {
                missing.push(key);
            }
        });
        return missing;
    }
    calculateOverallScore() {
        const rates = Object.values(this.coverageData);
        if (rates.length === 0)
            return 0;
        return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
    }
}
