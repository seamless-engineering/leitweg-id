/**
 * Leitweg-ID: the routing ID of a German public-sector invoice recipient,
 * sent in XRechnung BT-10 (Buyer reference) and as Peppol participant ID
 * under scheme 0204.
 *
 * Rules from KoSIT, "Leitweg-ID Format-Spezifikation", version 2.0.2 of
 * 28.07.2021 (https://leitweg-id.de/), still current as of 2026-09-26:
 *
 *   Grobadressierung - [Feinadressierung -] Prüfziffer
 *
 * - Grobadressierung, 2-12 digits: Bundesland or Bund (2), then optionally
 *   Regierungsbezirk (1), Landkreis (2) and Gemeindeverband/Gemeinde (3, 4
 *   or 7). Each part needs the one before it, so only 2, 3, 5, 8, 9 or 12
 *   digits are possible.
 * - Feinadressierung, optional: up to 30 letters A-Z and digits, not
 *   case-sensitive.
 * - Prüfziffer: 2 digits, ISO/IEC 7064 MOD 97-10 over Grob- and
 *   Feinadressierung without hyphens.
 */

import { mod97, mod97CheckDigits } from "./mod97.js";
import type { Result } from "./result.js";

/** Kennzahl des Bundeslandes / des Bundes (section 2.2.1 of the spec). */
export const LEITWEG_LAND: Readonly<Record<string, string>> = {
  "01": "Schleswig-Holstein",
  "02": "Hamburg",
  "03": "Niedersachsen",
  "04": "Bremen",
  "05": "Nordrhein-Westfalen",
  "06": "Hessen",
  "07": "Rheinland-Pfalz",
  "08": "Baden-Württemberg",
  "09": "Bayern",
  "10": "Saarland",
  "11": "Berlin",
  "12": "Brandenburg",
  "13": "Mecklenburg-Vorpommern",
  "14": "Sachsen",
  "15": "Sachsen-Anhalt",
  "16": "Thüringen",
  "99": "Bund",
};

const GROB_LENGTHS = new Set([2, 3, 5, 8, 9, 12]);

export type LeitwegIdError =
  | "empty"
  | "length"
  | "format"
  | "land"
  | "grob-length"
  | "fein-length"
  | "check-digits";

export interface LeitwegId {
  /** The ID in canonical form: trimmed, letters upper case. */
  id: string;
  /** Grobadressierung, 2-12 digits. */
  grob: string;
  /** Kennzahl des Bundeslandes, or 99 for the Bund. */
  land: string;
  /** Name of the Bundesland, or "Bund". */
  landName: string;
  /** Kennzahl des Regierungsbezirks, or the Bund's Ordnungskennzahl, if given. */
  regierungsbezirk?: string;
  /** Kennzahl des Landkreises, if given. */
  kreis?: string;
  /** Gemeindeverband and/or Gemeindekennzahl (3, 4 or 7 digits), if given. */
  gemeinde?: string;
  /** Feinadressierung, if given. */
  fein?: string;
  /** The two check digits. */
  checkDigits: string;
}

/** Trimmed and upper case; hyphens are part of the format, so nothing else is removed. */
const compact = (input: string) => input.trim().toUpperCase();

/** Parse and check a Leitweg-ID, e.g. "04011000-1234512345-06". */
export function parseLeitwegId(input: string): Result<LeitwegId, LeitwegIdError> {
  const id = compact(input);
  if (id === "") return { valid: false, error: "empty" };
  if (id.length < 5 || id.length > 46) return { valid: false, error: "length" };
  const match = id.match(/^(\d+)(?:-([0-9A-Z]+))?-(\d{2})$/);
  if (!match) return { valid: false, error: "format" };
  const [, grob, fein, checkDigits] = match;
  if (!(grob.slice(0, 2) in LEITWEG_LAND)) return { valid: false, error: "land" };
  if (!GROB_LENGTHS.has(grob.length)) return { valid: false, error: "grob-length" };
  if (fein !== undefined && fein.length > 30) return { valid: false, error: "fein-length" };
  if (mod97(grob + (fein ?? "") + checkDigits) !== 1) return { valid: false, error: "check-digits" };
  return {
    valid: true,
    value: {
      id,
      grob,
      land: grob.slice(0, 2),
      landName: LEITWEG_LAND[grob.slice(0, 2)],
      regierungsbezirk: grob[2],
      kreis: grob.length >= 5 ? grob.slice(3, 5) : undefined,
      gemeinde: grob.length >= 8 ? grob.slice(5) : undefined,
      fein,
      checkDigits,
    },
  };
}

/** Whether `input` is a valid Leitweg-ID. */
export const isLeitwegId = (input: string) => parseLeitwegId(input).valid;

/**
 * Build a Leitweg-ID with its check digits from Grob- and Feinadressierung,
 * e.g. ("04011000", "1234512345") -> "04011000-1234512345-06". Throws if the
 * parts don't form a valid ID.
 */
export function buildLeitwegId(grob: string, fein?: string): string {
  const g = compact(grob);
  const f = fein === undefined || fein.trim() === "" ? undefined : compact(fein);
  if (!/^\d+$/.test(g) || (f !== undefined && !/^[0-9A-Z]+$/.test(f))) throw new Error(`Not a Leitweg-ID: ${grob}, ${fein}`);
  const id = `${g}${f ? `-${f}` : ""}-${mod97CheckDigits(g + (f ?? ""))}`;
  const parsed = parseLeitwegId(id);
  if (!parsed.valid) throw new Error(`Not a Leitweg-ID (${parsed.error}): ${id}`);
  return id;
}
