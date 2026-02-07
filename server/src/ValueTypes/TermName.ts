import { IllegalArgumentException } from '../Exceptions/IllegalArgumentException';

/**
 * TermName value type.
 *
 * Canonical forms:
 * - WS2024
 * - SS2025
 * - WS2024/25
 * - SS2025/26
 *
 * Accepted inputs include (case-insensitive):
 * - WS24, WS2024, WS24/25, WS2024/25
 * - Winter 2024, Winter2024, Winter 2024/25
 * - SS25, SS2025, SS25/26, SS2025/26
 * - Summer 2025, Summer2025, Summer 2025/26
 */
export class TermName {
  // Accepts common term name inputs like:
  // - WS24, WS2024, Winter 2024
  // - WS24/25, Winter 2024/2025
  // - SS25, Summer2025, SS2025/26
  // Note: chronological correctness of ranges is validated in code after matching.
  private static readonly TERM_REGEX = /^(ws|winter|ss|summer)\s*(\d{2}|\d{4})(?:\s*\/\s*(\d{2}|\d{4}))?$/i;

  private readonly value: string;

  constructor(input: string) {
    const canonical = TermName.toCanonical(input);
    IllegalArgumentException.assert(Boolean(canonical), 'Invalid term name');
    this.value = canonical;
  }

  static toCanonical(input: string): string {
    const trimmed = input.trim();
    const match = trimmed.match(TermName.TERM_REGEX);
    if (!match) {
      return '';
    }

    const rawPrefix = match[1].toLowerCase();
    const rawYear1 = match[2];
    const rawYear2 = match[3];

    const prefix = rawPrefix === 'ws' || rawPrefix === 'winter' ? 'WS' : 'SS';

    const year1 = TermName.normalizeYear4(rawYear1);
    if (!year1) {
      return '';
    }

    if (!rawYear2) {
      return `${prefix}${year1}`;
    }

    const year2 = TermName.normalizeYear2(rawYear2);
    if (!year2) {
      return '';
    }

    // Prevent accepting illogical ranges like "WS2025/24".
    // Canonically, the second year must be the year immediately after the first.
    const expectedYear2 = TermName.expectedNextYear2(year1);
    if (!expectedYear2 || year2 !== expectedYear2) {
      return '';
    }

    return `${prefix}${year1}/${year2}`;
  }

  /**
   * For canonical term ranges we expect the second year to be the *next* year.
   * Example: 2024 -> "25"; 2099 -> "00" (rollover to 2100).
   */
  private static expectedNextYear2(year4: string): string {
    if (!/^\d{4}$/.test(year4)) {
      return '';
    }
    const year = Number.parseInt(year4, 10);
    if (!Number.isFinite(year)) {
      return '';
    }
    return String((year + 1) % 100).padStart(2, '0');
  }

  private static normalizeYear4(year: string): string {
    if (/^\d{4}$/.test(year)) {
      return year;
    }
    if (/^\d{2}$/.test(year)) {
      return `20${year}`;
    }
    return '';
  }

  private static normalizeYear2(year: string): string {
    if (/^\d{2}$/.test(year)) {
      return year;
    }
    if (/^\d{4}$/.test(year)) {
      return year.slice(2);
    }
    return '';
  }

  toString(): string {
    return this.value;
  }

  equals(other: TermName): boolean {
    return this.toString() === other.toString();
  }
}
