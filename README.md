# leitweg-id

[![npm](https://img.shields.io/npm/v/leitweg-id)](https://www.npmjs.com/package/leitweg-id)
[![CI](https://github.com/seamless-engineering/leitweg-id/actions/workflows/ci.yml/badge.svg)](https://github.com/seamless-engineering/leitweg-id/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Validate, parse and build **Leitweg-IDs**, the routing IDs that invoices to German public authorities need in XRechnung. Also checks the other German IDs an e-invoice carries: **USt-IdNr**, **Wirtschafts-Identifikationsnummer (W-IdNr)** and **SEPA Gläubiger-ID**.

*Deutsch:* Prüft, zerlegt und erzeugt Leitweg-IDs für die XRechnung an Bund, Länder und Kommunen, samt Prüfziffer nach ISO/IEC 7064 MOD 97-10. Dazu USt-IdNr., Wirtschafts-Identifikationsnummer und Gläubiger-ID, jeweils mit Fehlermeldungen auf Deutsch und Englisch.

- Zero dependencies, no data tables. Runs in browsers, Node 20+, Deno and Bun.
- Follows the KoSIT [Leitweg-ID Format-Spezifikation v2.0.2](https://leitweg-id.de/) and is tested against the spec's worked example and IDs from the public Leitweg-ID directory.
- Every check returns why an ID is invalid, not just `false`.

## Install

```sh
npm install leitweg-id
```

## Leitweg-ID

```ts
import { buildLeitwegId, isLeitwegId, parseLeitwegId } from "leitweg-id";

isLeitwegId("991-03730-19"); // true

parseLeitwegId("057660004004-31001-55");
// { valid: true, value: {
//     id: "057660004004-31001-55", grob: "057660004004", land: "05", landName: "Nordrhein-Westfalen",
//     regierungsbezirk: "7", kreis: "66", gemeinde: "0004004", fein: "31001", checkDigits: "55" } }

parseLeitwegId("09274154-NFH-06"); // { valid: false, error: "check-digits" }

buildLeitwegId("04011000", "1234512345"); // "04011000-1234512345-06"
```

What gets checked:

| Error | Rule (section of the spec) |
|---|---|
| `length` | 5 to 46 characters (2.1) |
| `format` | Grobadressierung digits, optional `-` Feinadressierung (A-Z, 0-9), `-` two check digits (2.1, 2.5) |
| `land` | Starts with a state code 01-16 or 99 for the federal government (2.2.1) |
| `grob-length` | Grobadressierung has 2, 3, 5, 8, 9 or 12 digits: state, then Regierungsbezirk, Kreis and Gemeinde, each only with the one before it (2.2) |
| `fein-length` | Feinadressierung at most 30 characters (2.3) |
| `check-digits` | ISO/IEC 7064 MOD 97-10 over Grob- and Feinadressierung (2.4) |

Letters are not case-sensitive: IDs come back upper case. Hyphens are part of the format and are never added or removed.

## USt-IdNr and W-IdNr

```ts
import { parseUstIdNr, parseWIdNr } from "leitweg-id";

parseUstIdNr("DE 136 695 976"); // { valid: true, value: { id: "DE136695976" } }
parseUstIdNr("DE136695978"); // { valid: false, error: "check-digit" }

parseWIdNr("DE136695976-00001");
// { valid: true, value: { id: "DE136695976-00001", ustIdNr: "DE136695976", suffix: "00001" } }
```

The USt-IdNr check digit is ISO/IEC 7064 MOD 11,10. The W-IdNr (§ 139c AO) is the USt-IdNr plus a five-digit suffix per economic activity, starting at `00001`. The BZSt rolls it out in stages until Q4 2027.

These checks catch typos. Whether a number was actually issued can only be confirmed online with the BZSt (eVatR).

## Gläubiger-ID

```ts
import { parseGlaeubigerId } from "leitweg-id";

parseGlaeubigerId("DE98 ZZZ0 9999 9999 99");
// { valid: true, value: { id: "DE98ZZZ09999999999", country: "DE", checkDigits: "98", businessCode: "ZZZ", national: "09999999999" } }
```

Check digits follow EPC262-08 (Creditor Identifier Overview): MOD 97-10 over the national identifier and country code, leaving out the business code. German IDs have 18 characters. Other SEPA countries are checked by the same rule, without their national length rules.

## Electronic addresses (XRechnung BT-34, BT-49)

```ts
import { parseElectronicAddress } from "leitweg-id";

parseElectronicAddress("0204", "991-03730-19"); // Leitweg-ID
parseElectronicAddress("9930", "DE136695976"); // German VAT ID
parseElectronicAddress("EM", "invoices@example.com"); // { valid: false, error: "unsupported-scheme" }
```

## Error messages

`messages.de` and `messages.en` hold a sentence per error code, grouped by ID type:

```ts
import { messages, parseLeitwegId } from "leitweg-id";

const result = parseLeitwegId(input);
if (!result.valid) showError(messages.de.leitweg[result.error]);
```

## Maintenance

Maintained by [seamless.engineering](https://seamless.engineering) for our own production use: we run managed integrations between shops, ERPs and accounting for German businesses, fully EU-hosted. Issues and PRs welcome, no SLA.

## Releasing

Bump `version` in `package.json`, commit, then tag and push: `git tag v0.1.1 && git push origin v0.1.1`. The release workflow publishes to npm with provenance via trusted publishing.

MIT licence.
