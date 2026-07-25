import { describe, it, expect } from 'vitest';
import { ScannerAPI } from './scanner';

describe('ScannerAPI', () => {
  describe('constructor', () => {
    it('should create instance with baseUrl', () => {
      const api = new ScannerAPI('http://localhost:3000');
      expect(api).toBeDefined();
    });
  });
});