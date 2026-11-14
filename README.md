# Hive Scribe

A free, installable interlinear Bible study app by [Codex Hive Labs](https://codex-hive.com). Compare verses in Hebrew, Greek, Aramaic, and Latin, word by word, with English (World English Bible) for the whole 73-book Catholic canon. A Settings toggle can hide the deuterocanonical books for a 66-book Protestant view.

**Live app:** [https://scribe.codex-hive.com](https://scribe.codex-hive.com)

(GitHub Pages also serves this repository at [https://voineagvalentin5.github.io/hive-scribe/](https://voineagvalentin5.github.io/hive-scribe/), which redirects to the custom domain once DNS is in place.)

## How to use

Open the live app in a browser on your phone or computer. Tap a verse to flip it to the original language with a short English gloss under each word. Press and hold a word for its definition, grammar, Strong’s number, transliteration, and gematria. Cross-references appear as a free-flowing ring (or optional sphere) on the Canonical Chords tab. Guided Studies, including “The Oneness of God,” are in the header and under Lexicon & Notes. Notes and study progress can be exported (Markdown, JSON, or a print-to-PDF page) and imported from JSON on another device.

### Install on your phone

This is a progressive web app (PWA). In Safari or Chrome, use **Add to Home Screen**. Installing and full offline use need HTTPS (the hosted site provides that).

### Offline use

Chapters you open are cached automatically. In **Settings (Aa)** choose **Download whole Bible for offline** to store all data on the device (about 17–18 MB of Bible data, plus the app shell).

### Reading tools

Text size (S–XL), a dyslexia-friendly reading mode, Hebrew vowel-point and cantillation toggles, a canon toggle and per-witness visibility (Hebrew WLC, Greek NT, Septuagint, Targum, Latin Vulgate), a Logos Bridge (Genesis 1 with John 1), a lexicon and concordance, guided Studies, and notes you can export and import.

## What’s included

- **English:** World English Bible for all 73 books, including the deuterocanonical books.
- **Hebrew and Greek, word by word:** every Protestant Old and New Testament book, with Strong’s numbers, morphology, glosses, and gematria.
- **Septuagint:** Brenton’s Greek text for most Old Testament and deuterocanonical verses (plain text; no word-level tagging).
- **Targum:** Onkelos on the Torah and Jonathan on the Prophets (plain text).
- **Latin Vulgate:** Clementine Vulgate (public domain; Tweedale / vulsearch transcription), automatically placed next to WEB verses; the Vulgate reference is shown when it differs.
- **Studies:** data-driven topical studies (`studies/*.json`). Lesson notes are original to this app and labelled as presenting a named author’s position; they do not reproduce copyrighted book text.

Honest limits, also labelled in the app:

- The Septuagint has no word-by-word data, because no freely licensed tagged edition is used here.
- There is no Targum yet for the Writings.
- OpenBible.info has no cross-references for the deuterocanonical books.
- A few WEB verses that follow the Majority Text (for example John 7:53–8:11) have no SBLGNT Greek.
- Sirach Hebrew (Cairo Geniza / Masada), Tobit Aramaic/Hebrew from Qumran, and 7Q2 (Letter of Jeremiah) are not included; those books use the Septuagint (and Vulgate where aligned).

Chapter and verse numbers follow the WEB (English tradition), so a few differ from other Bibles.

## Data sources and licenses

Full attributions also appear on the app’s Sources page (the **i** button) and in [`NOTICE`](NOTICE).

| Material | Source | License |
| --- | --- | --- |
| English Bible (73 books) | World English Bible, 2020 stable text (eBible.org `eng-web`) | Public domain |
| Hebrew / Aramaic OT (word-level) | STEPBible TAHOT (Tyndale House, Cambridge / STEPBible.org). Hebrew base: Westminster Leningrad Codex (WLC 4.20, public domain) via OpenScriptures | TAHOT: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Greek NT text | [SBL Greek New Testament](https://sblgnt.com/), © 2010 Society of Biblical Literature and Logos Bible Software | [SBLGNT license](https://sblgnt.com/license/) |
| Greek NT morphology | [MorphGNT](https://github.com/morphgnt/sblgnt) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Greek NT glosses, transliteration, Strong’s | STEPBible TAGNT (Tyndale House / STEPBible.org) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Septuagint Greek | Brenton’s Septuagint with Apocrypha (eBible.org `grcbrent`) | Public domain |
| Targum Onkelos and Targum Jonathan | [Sefaria](https://www.sefaria.org) public-domain editions | Public domain |
| Latin Vulgate (Clementine) | Michael Tweedale (vulsearch) via [Open Bibles](https://github.com/seven1m/open-bibles) (`lat-clementine.usfx.xml`); aligned with the public-domain Douay-Rheims | Public domain |
| Canonical Chords renderer | [three.js](https://github.com/mrdoob/three.js) r170.0 (vendored) | [MIT](vendor/LICENSE) |
| Lexicons | STEPBible TBESH (Hebrew/Aramaic) and TBESG (Greek) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Cross-references | [OpenBible.info](https://www.openbible.info/labs/cross-references/) (data dated 2026-11-09) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Fonts | Noto Serif and Noto Serif Hebrew (The Noto Project Authors) | [SIL Open Font License 1.1](fonts/OFL.txt) |

STEPBible data is © Tyndale House, Cambridge / STEPBible.org, used under CC BY 4.0, from [STEPBible-Data](https://github.com/STEPBible/STEPBible-Data).

## Running a local copy

This site must be served over HTTP(S). Opening `index.html` as a file will not load the chapter data.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## License

See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE). The repository contains original Hive Scribe app code and branding by Codex Hive Labs, together with third-party Bible texts, linguistic data, and fonts under the licenses listed above. Those third-party terms govern the corresponding materials and must be followed.
