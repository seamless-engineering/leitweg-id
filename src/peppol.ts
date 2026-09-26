/**
 * Electronic addresses as XRechnung carries them (BT-34 seller, BT-49
 * buyer): an identifier plus an EAS scheme code. Only the German schemes
 * this library can check are covered:
 *
 * - 0204: Leitweg-ID
 * - 9930: German VAT ID (USt-IdNr)
 */

import { parseLeitwegId } from "./leitweg.js";
import type { Result } from "./result.js";
import { parseUstIdNr } from "./vat.js";

export type ElectronicAddressError = "unsupported-scheme" | "invalid-id";

export interface ElectronicAddress {
  scheme: "0204" | "9930";
  /** The identifier in canonical form. */
  id: string;
}

/** Check an electronic address, e.g. ("0204", "991-03730-19"). Other schemes return "unsupported-scheme". */
export function parseElectronicAddress(scheme: string, id: string): Result<ElectronicAddress, ElectronicAddressError> {
  const parsed = scheme === "0204" ? parseLeitwegId(id) : scheme === "9930" ? parseUstIdNr(id) : undefined;
  if (!parsed) return { valid: false, error: "unsupported-scheme" };
  if (!parsed.valid) return { valid: false, error: "invalid-id" };
  return { valid: true, value: { scheme: scheme as ElectronicAddress["scheme"], id: parsed.value.id } };
}
