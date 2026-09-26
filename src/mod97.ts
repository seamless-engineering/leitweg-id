/**
 * ISO/IEC 7064 MOD 97-10, the check digit scheme of IBAN, the Leitweg-ID and
 * the SEPA Gläubiger-ID. Letters count as two digits, A = 10 to Z = 35.
 */

/** Remainder of the number the text stands for, divided by 97. `text` holds only 0-9 and A-Z. */
export function mod97(text: string): number {
  let rest = 0;
  for (const char of text) {
    const value = Number.parseInt(char, 36);
    rest = (value < 10 ? rest * 10 + value : rest * 100 + value) % 97;
  }
  return rest;
}

/** The two check digits that make `text` followed by them leave a remainder of 1. */
export const mod97CheckDigits = (text: string) => String(98 - mod97(`${text}00`)).padStart(2, "0");
