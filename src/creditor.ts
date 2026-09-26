/**
 * SEPA creditor identifier (Gläubiger-Identifikationsnummer), the ID on
 * SEPA direct debits and in XRechnung BT-90 (Bank assigned creditor
 * identifier).
 *
 * Structure (EPC262-08, "Creditor Identifier Overview"): country code (2),
 * check digits (2), creditor business code (3, "ZZZ" unless the creditor
 * picks one), national identifier (up to 28, 11 in Germany). The check
 * digits are ISO/IEC 7064 MOD 97-10 over the national identifier, the
 * country code and the check digits; the business code is left out, so
 * creditors can change it freely.
 */

import { mod97 } from "./mod97.js";
import type { Result } from "./result.js";

export type GlaeubigerIdError = "empty" | "format" | "length" | "check-digits";

export interface GlaeubigerId {
  /** Canonical form, e.g. "DE98ZZZ09999999999". */
  id: string;
  country: string;
  checkDigits: string;
  /** Creditor business code (Geschäftsbereichskennung), "ZZZ" by default. */
  businessCode: string;
  /** National identifier, 11 characters in Germany. */
  national: string;
}

/** Parse a SEPA creditor identifier, e.g. "DE98 ZZZ0 9999 9999 99". Spaces are ignored. */
export function parseGlaeubigerId(input: string): Result<GlaeubigerId, GlaeubigerIdError> {
  const id = input.toUpperCase().replace(/\s/g, "");
  if (id === "") return { valid: false, error: "empty" };
  const match = id.match(/^([A-Z]{2})(\d{2})([0-9A-Z]{3})([0-9A-Z]{1,28})$/);
  if (!match) return { valid: false, error: "format" };
  const [, country, checkDigits, businessCode, national] = match;
  if (country === "DE" && national.length !== 11) return { valid: false, error: "length" };
  if (mod97(national + country + checkDigits) !== 1) return { valid: false, error: "check-digits" };
  return { valid: true, value: { id, country, checkDigits, businessCode, national } };
}

/** Whether `input` is a SEPA creditor identifier with correct check digits. */
export const isGlaeubigerId = (input: string) => parseGlaeubigerId(input).valid;
