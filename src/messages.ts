/** Error codes as sentences for a form or a log, in German and English. */

import type { GlaeubigerIdError } from "./creditor.js";
import type { LeitwegIdError } from "./leitweg.js";
import type { ElectronicAddressError } from "./peppol.js";
import type { WIdNrError } from "./vat.js";

export type Lang = "de" | "en";

export type ErrorCode = LeitwegIdError | WIdNrError | GlaeubigerIdError | ElectronicAddressError;

type Id = "leitweg" | "ustIdNr" | "wIdNr" | "glaeubigerId" | "electronicAddress";

export const messages: Record<Lang, Record<Id, Partial<Record<ErrorCode, string>>>> = {
  de: {
    leitweg: {
      empty: "Bitte eine Leitweg-ID angeben.",
      length: "Eine Leitweg-ID hat 5 bis 46 Zeichen.",
      format: "Aufbau: Grobadressierung (Ziffern), optional Bindestrich und Feinadressierung (A-Z, 0-9), dann Bindestrich und zwei Prüfziffern, z. B. 991-03730-19.",
      land: "Die ersten zwei Ziffern müssen ein Bundesland (01-16) oder der Bund (99) sein.",
      "grob-length": "Die Grobadressierung hat 2, 3, 5, 8, 9 oder 12 Ziffern.",
      "fein-length": "Die Feinadressierung hat höchstens 30 Zeichen.",
      "check-digits": "Die Prüfziffern stimmen nicht. Meist ist das ein Tippfehler.",
    },
    ustIdNr: {
      empty: "Bitte eine USt-IdNr. angeben.",
      format: "Eine deutsche USt-IdNr. besteht aus DE und neun Ziffern, z. B. DE136695976.",
      "check-digit": "Die Prüfziffer der USt-IdNr. stimmt nicht. Meist ist das ein Tippfehler.",
    },
    wIdNr: {
      empty: "Bitte eine Wirtschafts-Identifikationsnummer angeben.",
      format: "Eine W-IdNr. besteht aus DE, neun Ziffern, Bindestrich und fünf Ziffern, z. B. DE136695976-00001.",
      "check-digit": "Die Prüfziffer im USt-IdNr.-Teil stimmt nicht. Meist ist das ein Tippfehler.",
      suffix: "Das Unterscheidungsmerkmal beginnt bei 00001.",
    },
    glaeubigerId: {
      empty: "Bitte eine Gläubiger-ID angeben.",
      format: "Aufbau: Ländercode, zwei Prüfziffern, drei Zeichen Geschäftsbereich (meist ZZZ), nationale Kennung, z. B. DE98ZZZ09999999999.",
      length: "Eine deutsche Gläubiger-ID hat 18 Zeichen.",
      "check-digits": "Die Prüfziffern der Gläubiger-ID stimmen nicht. Meist ist das ein Tippfehler.",
    },
    electronicAddress: {
      "unsupported-scheme": "Dieses Schema wird nicht geprüft. Geprüft werden 0204 (Leitweg-ID) und 9930 (USt-IdNr.).",
      "invalid-id": "Die Kennung passt nicht zum angegebenen Schema.",
    },
  },
  en: {
    leitweg: {
      empty: "Enter a Leitweg-ID.",
      length: "A Leitweg-ID has 5 to 46 characters.",
      format: "Format: Grobadressierung (digits), optionally a hyphen and a Feinadressierung (A-Z, 0-9), then a hyphen and two check digits, e.g. 991-03730-19.",
      land: "The first two digits must be a German state (01-16) or the federal government (99).",
      "grob-length": "The Grobadressierung has 2, 3, 5, 8, 9 or 12 digits.",
      "fein-length": "The Feinadressierung has at most 30 characters.",
      "check-digits": "The check digits don't match. Usually a typo.",
    },
    ustIdNr: {
      empty: "Enter a VAT ID.",
      format: "A German VAT ID is DE followed by nine digits, e.g. DE136695976.",
      "check-digit": "The VAT ID's check digit doesn't match. Usually a typo.",
    },
    wIdNr: {
      empty: "Enter a Wirtschafts-Identifikationsnummer.",
      format: "A W-IdNr is DE, nine digits, a hyphen and five digits, e.g. DE136695976-00001.",
      "check-digit": "The check digit of the VAT ID part doesn't match. Usually a typo.",
      suffix: "The suffix starts at 00001.",
    },
    glaeubigerId: {
      empty: "Enter a creditor identifier.",
      format: "Format: country code, two check digits, a three-character business code (usually ZZZ), the national ID, e.g. DE98ZZZ09999999999.",
      length: "A German creditor identifier has 18 characters.",
      "check-digits": "The creditor identifier's check digits don't match. Usually a typo.",
    },
    electronicAddress: {
      "unsupported-scheme": "This scheme isn't checked. Supported: 0204 (Leitweg-ID) and 9930 (German VAT ID).",
      "invalid-id": "The identifier doesn't match the given scheme.",
    },
  },
};
