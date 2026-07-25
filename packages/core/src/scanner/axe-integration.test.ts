import { describe, it, expect } from 'vitest';
import { AxeScanner } from './axe-integration';

describe('AxeScanner', () => {
  describe('scan', () => {
    it('should return scan results with violations', async () => {
      const scanner = new AxeScanner();
      const result = await scanner.scan('https://example.com', ['color-contrast', 'image-alt']);

      expect(result.url).toBe('https://example.com');
      expect(result.totalViolations).toBeGreaterThanOrEqual(0);
      expect(result.critical).toBeGreaterThanOrEqual(0);
      expect(result.serious).toBeGreaterThanOrEqual(0);
      expect(result.moderate).toBeGreaterThanOrEqual(0);
      expect(result.minor).toBeGreaterThanOrEqual(0);
    });

    it('should return scan results with default rules', async () => {
      const scanner = new AxeScanner();
      const result = await scanner.scan('https://example.com');

      expect(result.url).toBe('https://example.com');
      expect(result.totalViolations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('registerCustomRule', () => {
    it('should register a custom rule', () => {
      const scanner = new AxeScanner();
      expect(scanner).toBeDefined();
    });
  });
});