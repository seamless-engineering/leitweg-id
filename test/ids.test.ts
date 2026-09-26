import { describe, expect, it } from "vitest";
import {
  buildLeitwegId,
  isGlaeubigerId,
  isLeitwegId,
  isUstIdNr,
  isWIdNr,
  messages,
  mod97CheckDigits,
  parseElectronicAddress,
  parseGlaeubigerId,
  parseLeitwegId,
  parseUstIdNr,
  parseWIdNr,
} from "../src/index.js";

/** Published in the Leitweg-ID directory (verzeichnis.leitweg-id.de). */
const DIRECTORY_IDS = [
  "16066069-0001-38",
  "13-L75810002000-60",
  "057660004004-31001-55",
  "991-03730-19",
  "992-90009-96",
  "08315033-ESCHBACH6626-66",
  "09274154-NFH-05",
  "05370032-WDF5271-06",
  "09778137-ETTRINGEN868331262-55",
  "08325024-787394066-26",
  "15088205-LEUNA6877-16",
  "09471131-GDEFD96158-46",
  "09780119-RATHAUSDIETMANNSRIED7247-90",
  "09176111-ADELSCHLAG-11",
  "09274193-WHM-62",
  "09177127-GEMEINDELENGDORF-24",
  "09176122-EGWEIL-38",
  "06533010-L357921748-84",
  "09176149-NASSENFELS-39",
  "09177131-NEUCHING-08",
];

describe("Leitweg-ID", () => {
  it("computes the spec's worked example (section 2.4)", () => {
    expect(mod97CheckDigits("040110001234512345")).toBe("06");
    expect(buildLeitwegId("04011000", "1234512345")).toBe("04011000-1234512345-06");
  });

  it("accepts every ID from the public directory", () => {
    expect(DIRECTORY_IDS.filter((id) => !isLeitwegId(id))).toEqual([]);
  });

  it("splits the Grobadressierung into its parts", () => {
    expect(parseLeitwegId("057660004004-31001-55")).toEqual({
      valid: true,
      value: {
        id: "057660004004-31001-55",
        grob: "057660004004",
        land: "05",
        landName: "Nordrhein-Westfalen",
        regierungsbezirk: "7",
        kreis: "66",
        gemeinde: "0004004",
        fein: "31001",
        checkDigits: "55",
      },
    });
    const bund = parseLeitwegId("991-03730-19");
    expect(bund.valid && [bund.value.landName, bund.value.regierungsbezirk, bund.value.kreis]).toEqual(["Bund", "1", undefined]);
  });

  it("is not case-sensitive and trims, but keeps hyphens", () => {
    const parsed = parseLeitwegId("  09274154-nfh-05 ");
    expect(parsed.valid && parsed.value.id).toBe("09274154-NFH-05");
  });

  it("works without a Feinadressierung", () => {
    const id = buildLeitwegId("09274154");
    expect(id).toMatch(/^09274154-\d{2}$/);
    expect(parseLeitwegId(id)).toMatchObject({ valid: true, value: { fein: undefined } });
  });

  it("names what's wrong", () => {
    const error = (id: string) => {
      const parsed = parseLeitwegId(id);
      return parsed.valid ? "valid" : parsed.error;
    };
    expect(error("")).toBe("empty");
    expect(error("01-2")).toBe("length");
    expect(error(`09-${"A".repeat(41)}-00`)).toBe("length");
    expect(error("09274154--05")).toBe("format");
    expect(error("09274154-NFH_1-05")).toBe("format");
    expect(error("09274154 NFH 05")).toBe("format");
    expect(error("1-03730-19")).toBe("land");
    expect(error("55-55-20")).toBe("land");
    expect(error(`0927-${mod97CheckDigits("0927")}`)).toBe("grob-length");
    expect(error(`09-${"A".repeat(31)}-${mod97CheckDigits(`09${"A".repeat(31)}`)}`)).toBe("fein-length");
    expect(error("09274154-NFH-06")).toBe("check-digits");
    expect(error("09274154-NHF-05")).toBe("check-digits");
  });

  it("refuses to build invalid IDs", () => {
    expect(() => buildLeitwegId("0927")).toThrow(/grob-length/);
    expect(() => buildLeitwegId("09274154", "NFH-1")).toThrow();
  });
});

describe("USt-IdNr", () => {
  it("checks the MOD 11,10 check digit", () => {
    expect(isUstIdNr("DE136695976")).toBe(true);
    expect(parseUstIdNr("de 136.695.976")).toEqual({ valid: true, value: { id: "DE136695976" } });
    expect(parseUstIdNr("136695976")).toEqual({ valid: true, value: { id: "DE136695976" } });
    expect(parseUstIdNr("DE136695978")).toEqual({ valid: false, error: "check-digit" });
    expect(parseUstIdNr("DE036695976")).toEqual({ valid: false, error: "format" });
    expect(parseUstIdNr("ATU13585627")).toEqual({ valid: false, error: "format" });
  });
});

describe("W-IdNr", () => {
  it("is the USt-IdNr plus a 5-digit suffix", () => {
    expect(parseWIdNr("DE136695976-00001")).toEqual({
      valid: true,
      value: { id: "DE136695976-00001", ustIdNr: "DE136695976", suffix: "00001" },
    });
    expect(parseWIdNr("de 136695976 00002")).toMatchObject({ valid: true, value: { id: "DE136695976-00002" } });
    expect(isWIdNr("DE136695976")).toBe(false);
    expect(parseWIdNr("DE136695978-00001")).toEqual({ valid: false, error: "check-digit" });
    expect(parseWIdNr("DE136695976-00000")).toEqual({ valid: false, error: "suffix" });
    expect(parseWIdNr("DE136695976-0001")).toEqual({ valid: false, error: "format" });
  });
});

describe("Gläubiger-ID", () => {
  it("accepts the Bundesbank's test ID, with or without spaces", () => {
    expect(isGlaeubigerId("DE98ZZZ09999999999")).toBe(true);
    expect(parseGlaeubigerId("de98 zzz0 9999 9999 99")).toEqual({
      valid: true,
      value: { id: "DE98ZZZ09999999999", country: "DE", checkDigits: "98", businessCode: "ZZZ", national: "09999999999" },
    });
  });

  it("leaves the business code out of the check digits", () => {
    expect(isGlaeubigerId("DE98ABC09999999999")).toBe(true);
  });

  it("names what's wrong", () => {
    expect(parseGlaeubigerId("DE97ZZZ09999999999")).toEqual({ valid: false, error: "check-digits" });
    expect(parseGlaeubigerId("DE98ZZZ0999999999")).toEqual({ valid: false, error: "length" });
    expect(parseGlaeubigerId("DE9XZZZ09999999999")).toEqual({ valid: false, error: "format" });
    expect(parseGlaeubigerId("")).toEqual({ valid: false, error: "empty" });
  });

  it("checks other SEPA countries by the same rule", () => {
    const national = "123456780001";
    expect(isGlaeubigerId(`NL${mod97CheckDigits(`${national}NL`)}ZZZ${national}`)).toBe(true);
  });
});

describe("electronic addresses", () => {
  it("checks schemes 0204 and 9930", () => {
    expect(parseElectronicAddress("0204", "09274154-nfh-05")).toEqual({ valid: true, value: { scheme: "0204", id: "09274154-NFH-05" } });
    expect(parseElectronicAddress("9930", "DE136695976")).toEqual({ valid: true, value: { scheme: "9930", id: "DE136695976" } });
    expect(parseElectronicAddress("0204", "DE136695976")).toEqual({ valid: false, error: "invalid-id" });
    expect(parseElectronicAddress("EM", "invoices@example.com")).toEqual({ valid: false, error: "unsupported-scheme" });
  });
});

describe("messages", () => {
  it("say the same things in German and English", () => {
    for (const id of Object.keys(messages.de) as (keyof typeof messages.de)[]) {
      expect(Object.keys(messages.en[id]).sort()).toEqual(Object.keys(messages.de[id]).sort());
    }
  });
});
