/**
 * German VAT ID (USt-IdNr) and Wirtschafts-Identifikationsnummer (W-IdNr).
 *
 * - USt-IdNr: "DE" and 9 digits, the first not 0. The last digit is an
 *   ISO/IEC 7064 MOD 11,10 check digit over the first eight.
 * - W-IdNr (§ 139c AO): the USt-IdNr, a hyphen and a 5-digit
 *   Unterscheidungsmerkmal per economic activity, starting at 00001
 *   (BZSt). Businesses that had a USt-IdNr by 30.11.2024 keep it as the
 *   W-IdNr. Rollout: stage 1 from Nov 2024, stage 2 from Q4 2026, stage 3
 *   from Q4 2027.
 *
 * These checks catch typos. Whether a number is actually issued can only be
 * confirmed online with the BZSt (eVatR).
 */

import type { Result } from "./result.js";

export type UstIdNrError = "empty" | "format" | "check-digit";
export type WIdNrError = UstIdNrError | "suffix";

export interface UstIdNr {
  /** Canonical form, e.g. "DE136695976". */
  id: string;
}

export interface WIdNr {
  /** Canonical form, e.g. "DE136695976-00001". */
  id: string;
  /** The USt-IdNr part. */
  ustIdNr: string;
  /** Unterscheidungsmerkmal, 5 digits. */
  suffix: string;
}

/** ISO/IEC 7064 MOD 11,10: a number with its check digit leaves 1. */
function mod1110(digits: string): number {
  let check = 5;
  for (const digit of digits) check = ((((check || 10) * 2) % 11) + Number(digit)) % 10;
  return check;
}

/** Parse a German USt-IdNr, e.g. "DE 136 695 976". Spaces, dots and slashes are ignored; the "DE" prefix is optional. */
export function parseUstIdNr(input: string): Result<UstIdNr, UstIdNrError> {
  const compact = input.toUpperCase().replace(/[\s./]/g, "");
  if (compact === "") return { valid: false, error: "empty" };
  const digits = compact.startsWith("DE") ? compact.slice(2) : compact;
  if (!/^[1-9]\d{8}$/.test(digits)) return { valid: false, error: "format" };
  if (mod1110(digits) !== 1) return { valid: false, error: "check-digit" };
  return { valid: true, value: { id: `DE${digits}` } };
}

/** Whether `input` is a German USt-IdNr with a correct check digit. */
export const isUstIdNr = (input: string) => parseUstIdNr(input).valid;

/** Parse a W-IdNr, e.g. "DE136695976-00001". Spaces are ignored; the hyphen is optional. */
export function parseWIdNr(input: string): Result<WIdNr, WIdNrError> {
  const compact = input.toUpperCase().replace(/\s/g, "");
  if (compact === "") return { valid: false, error: "empty" };
  const match = compact.match(/^(DE\d{9})-?(\d{5})$/);
  if (!match) return { valid: false, error: "format" };
  const ust = parseUstIdNr(match[1]);
  if (!ust.valid) return ust;
  if (match[2] === "00000") return { valid: false, error: "suffix" };
  return { valid: true, value: { id: `${ust.value.id}-${match[2]}`, ustIdNr: ust.value.id, suffix: match[2] } };
}

/** Whether `input` is a well-formed W-IdNr with a correct check digit. */
export const isWIdNr = (input: string) => parseWIdNr(input).valid;
