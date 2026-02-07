import { describe, it, expect } from 'vitest';
import { TermName } from '../ValueTypes/TermName';

describe('TermName', () => {
  it('should accept WS/SS short forms', () => {
    expect(new TermName('WS24').toString()).toBe('WS2024');
    expect(new TermName('ss25').toString()).toBe('SS2025');
  });

  it('should accept long season names', () => {
    expect(new TermName('Winter 2024').toString()).toBe('WS2024');
    expect(new TermName('Summer2025').toString()).toBe('SS2025');
  });

  it('should accept year ranges', () => {
    expect(new TermName('WS24/25').toString()).toBe('WS2024/25');
    expect(new TermName('Winter 2024/2025').toString()).toBe('WS2024/25');
    expect(new TermName('SS2025/26').toString()).toBe('SS2025/26');

    // Century rollover: 2099 -> 2100
    expect(new TermName('WS2099/2100').toString()).toBe('WS2099/00');
  });

  it('should throw for invalid values', () => {
    expect(() => new TermName('Term To Delete')).toThrow();
    expect(() => new TermName('2024WS')).toThrow();
    expect(() => new TermName('WS2')).toThrow();
    expect(() => new TermName('WS2025/24')).toThrow();
    expect(() => new TermName('WS24/24')).toThrow();
    expect(() => new TermName('SS2025/24')).toThrow();

    // Should be 2099/00, not 2099/01
    expect(() => new TermName('WS2099/01')).toThrow();
  });
});
