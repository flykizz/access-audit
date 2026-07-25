import { describe, it, expect } from 'vitest';
import { CoverageTracker } from './coverage-tracker';

describe('CoverageTracker', () => {
  describe('updateCoverage', () => {
    it('should update coverage data', () => {
      const tracker = new CoverageTracker();
      tracker.updateCoverage('keyboardReachRate', 95);

      const coverage = tracker.getCoverage();
      expect(coverage.keyboardReachRate).toBe(95);
    });
  });

  describe('getCoverage', () => {
    it('should return current coverage data', () => {
      const tracker = new CoverageTracker();
      const coverage = tracker.getCoverage();

      expect(coverage).toHaveProperty('keyboardReachRate');
      expect(coverage).toHaveProperty('focusVisibleRate');
      expect(coverage).toHaveProperty('goldenPathCoverage');
    });
  });

  describe('getMissingCoverage', () => {
    it('should return missing coverage items', () => {
      const tracker = new CoverageTracker();
      tracker.updateCoverage('keyboardReachRate', 100);
      tracker.updateCoverage('focusVisibleRate', 90);

      const missing = tracker.getMissingCoverage();
      expect(missing).toContain('focusVisibleRate');
      expect(missing).not.toContain('keyboardReachRate');
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate overall coverage score', () => {
      const tracker = new CoverageTracker();
      tracker.updateCoverage('keyboardReachRate', 80);
      tracker.updateCoverage('focusVisibleRate', 100);

      const score = tracker.calculateOverallScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});