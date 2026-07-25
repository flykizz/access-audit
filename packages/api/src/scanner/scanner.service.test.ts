import { describe, it, expect } from 'vitest';
import { ScannerService } from './scanner.service';

describe('ScannerService', () => {
  describe('staticScan', () => {
    it('should return scan result', async () => {
      const service = new ScannerService();
      const result = await service.staticScan({ url: 'https://example.com' });

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('totalViolations');
      expect(result).toHaveProperty('violations');
    });
  });

  describe('getRules', () => {
    it('should return all rules', () => {
      const service = new ScannerService();
      const result = service.getRules();

      expect(result.total).toBeGreaterThan(0);
      expect(result.rules).toBeInstanceOf(Array);
    });

    it('should filter rules by category', () => {
      const service = new ScannerService();
      const result = service.getRules('perceivable');

      expect(result.total).toBeGreaterThan(0);
      result.rules.forEach(rule => {
        expect(rule.category).toBe('perceivable');
      });
    });
  });
});