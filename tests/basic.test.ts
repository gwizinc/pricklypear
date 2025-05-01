import { describe, it, expect } from 'vitest';

describe('basic test suite', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should handle basic math', () => {
    expect(1 + 1).toBe(2);
    expect(5 * 5).toBe(25);
  });
});
