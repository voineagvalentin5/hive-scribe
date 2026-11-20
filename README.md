# Hive Scribe

A free, installable interlinear Bible study app by [Codex Hive Labs](https://codex-hive.com). Compare verses in Hebrew, Greek, Aramaic, and Latin, word by word, with English (King James Version by default, World English Bible as an alternative) for the whole 73-book Catholic canon. A Settings toggle can hide the deuterocanonical books for a 66-book Protestant view.

**Live app:** [https://scribe.codex-hive.com](https://scribe.codex-hive.com)

(GitHub Pages also serves this repository at [https://voineagvalentin5.github.io/hive-scribe/](https://voineagvalentin5.github.io/hive-scribe/), which redirects to the custom domain once DNS is in place.)

## How to use

Open the live app in a browser on your phone or computer. Tap a verse to flip it to the original language with a short English gloss under each word. Press and hold a word for its definition, grammar, Strong’s number, transliteration, and gematria. Cross-references appear as a free-flowing ring (or optional sphere) on the Canonical Chords tab. Guided Studies, including “The Oneness of God,” are in the header and under Lexicon & Notes. Notes and study progress can be exported (Markdown, JSON, or a print-to-PDF page) and imported from JSON on another device.

### Install on your phone

This is a progressive web app (PWA). In Safari or Chrome, use **Add to Home Screen**. Installing and full offline use need HTTPS (the hosted site provides that).

### Offline use

Chapters you open are cached automatically. In **Settings** choose **Download entire canon for offline** to store all data on the device. The button shows the exact size, computed from the file list in `data/index.json` (about 23.6 MB: every chapter, both English versions, lexicons, concordance and word-matching data). It shows a progress bar, can be paused, resumed or cancelled, checks the browser's storage quota first, and stops cleanly if the browser runs out of space.

### Search, links and read-aloud

- **Search (Ctrl+K / ⌘K, or the magnifier in the header):** type a reference (`Gen 1:2`, `jn 3 16`), a Strong's number (`H7363`, `G3056`), a Hebrew or Greek word (`ברא`, `λόγος`), or English words (`hovering`; WEB or KJV). Results jump straight to the verse or the lexicon entry.
- **Shareable links:** the address follows what you are reading, for example `#gen.1.2?wit=tg&word=H7307` (Genesis 1:2 in Targum Onkelos with the word study open on רוּחַ) or `#conn/john.1.1`. Back and Forward work, and **Copy link** in the word study and passage panels copies the current view.
- **Listen:** a speaker button on each opened verse and in the word study reads the original-language text with a voice installed on the device (Web Speech API: Hebrew, Greek, Latin or Italian). If no matching voice is installed the app says so. This is modern machine pronunciation, not cantillation.

### Reading tools

**Passage panel:** press and hold a verse (touch or mouse), right-click it, drag across verses with a mouse, Shift-click a second verse, or press Enter on a verse number to select a passage. The panel (right side on desktop, bottom sheet on phones) offers six labelled highlight colours plus Clear, an autosaving note for the passage (a single verse shares the ✎ verse note), and Copy passage with reference and version. **My highlights & notes** (Library, Notebook, or the panel) lists them all, filterable by colour, tap to jump. Saved on the device and included in Notebook / backup export and import. Every Strong's number (word panel, quick card, lexicon, studies, Logos Bridge) is a link to its Lexicon & Notes entry and concordance.

Text size (S–XL), a dyslexia-friendly reading mode, Hebrew vowel-point and cantillation toggles, a **Books shown** canon filter in the Library (presets All / Protestant / Catholic / Orthodox, plus Old Testament, New Testament, Deuterocanon and Greek-additions checkboxes, remembered on the device) and per-witness visibility (Hebrew WLC, Greek NT, Septuagint, Targum, Latin Vulgate), a Logos Bridge (Genesis 1 with John 1), a lexicon and concordance, guided Studies, and notes you can export and import.

## What’s included

- **English:** the King James Version (1769) with its Apocrypha is the default; the World English Bible (all books) can be chosen in Settings or the reading bar, and the choice is remembered. The KJV is placed on the same verses as the original-language layers; where it numbers a verse differently (e.g. Romans 16:25–27, the Rest of Esther, Daniel 3/13/14) its own reference is shown. 3–4 Maccabees and Psalm 151 are not in the KJV and show the WEB.
- **Hebrew and Greek, word by word:** every Protestant Old and New Testament book, with Strong’s numbers, morphology, glosses, and gematria.
- **Orthodox and appendix books:** Prayer of Manasseh, 1 Esdras, 3 Maccabees, Psalm 151, 4 Maccabees and 2 Esdras, in WEB English with Brenton's Septuagint Greek (2 Esdras is English only). Tagged Orth / App in the Library and shown or hidden with **Books shown**.
- **Byzantine Greek NT:** Robinson-Pierpont Byzantine Textform 2018, word by word with Strong’s numbers and Robinson parsing (public domain). When both Greek NT texts are on, words that differ from the SBLGNT are marked (+ only in this text, ≈ different form, ‸ the other text has extra words).
- **Septuagint:** Brenton’s Greek text for most Old Testament and deuterocanonical verses (no word-level tagging; tapping a word gives an approximate lexicon match, see below).
- **Targum:** Onkelos on the Torah and Jonathan on the Prophets (no word-level tagging; approximate matches).
- **Latin Vulgate:** Clementine Vulgate (public domain; Tweedale / vulsearch transcription), automatically placed next to WEB verses; the Vulgate reference is shown when it differs. Tapping a word suggests dictionary entries and parses from William Whitaker’s WORDS.
- **Textual variants, no empty Greek cards:** where the SBLGNT lacks a verse the Byzantine text has (e.g. John 7:53–8:11), the SBLGNT card shows RP2018 marked **Textual Variant: Byzantine**; Luke 17:36, Acts 8:37, 15:34 and 24:7 (in the KJV but in neither Greek text) show Scrivener’s 1894 Textus Receptus marked **Textual Variant: TR**.
- **Approximate word study:** for the Septuagint, Targum, Vulgate and TR verses the word study shows the best-matching lexicon entry with an “approximate match” label and a confidence level (High: the exact spelling is tagged elsewhere in the app’s data; Medium: a prefix removed or a dictionary-form match; Low: a stem guess). It is never presented as an exact parse. Gematria / isopsephy is shown for Hebrew, Aramaic and Greek words.
- **Studies:** data-driven topical studies (`studies/*.json`). Lesson notes are original to this app and labelled as presenting a named author’s position; they do not reproduce copyrighted book text.

Honest limits, also labelled in the app:

- The Septuagint, Targum and Vulgate have no word-by-word tagging, because no freely licensed tagged edition is used here; their word study is an approximate, spelling-based match.
- There is no Targum yet for the Writings.
- OpenBible.info has no cross-references for the deuterocanonical books.
- A few WEB/KJV verses (for example John 7:53–8:11) have no SBLGNT Greek; they show the Byzantine text or the TR, clearly marked as textual variants.
- Sirach Hebrew (Cairo Geniza / Masada), Tobit Aramaic/Hebrew from Qumran, and 7Q2 (Letter of Jeremiah) are not included; those books use the Septuagint (and Vulgate where aligned).

Chapter and verse numbers follow the WEB (English tradition), so a few differ from other Bibles.

## Data sources and licenses

Full attributions also appear on the app’s Sources page (the **i** button) and in [`NOTICE`](NOTICE).

| Material | Source | License |
| --- | --- | --- |
| English Bible, default | King James Version, 1769 text with the Apocrypha (eBible.org `eng-kjv`) | Public domain (outside the UK; Crown letters patent apply in the UK) |
| English Bible, alternative (all books) | World English Bible, 2020 stable text (eBible.org `eng-web`) | Public domain |
| Hebrew / Aramaic OT (word-level) | STEPBible TAHOT (Tyndale House, Cambridge / STEPBible.org). Hebrew base: Westminster Leningrad Codex (WLC 4.20, public domain) via OpenScriptures | TAHOT: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Greek NT text | [SBL Greek New Testament](https://sblgnt.com/), © 2010 Society of Biblical Literature and Logos Bible Software | [SBLGNT license](https://sblgnt.com/license/) |
| Greek NT morphology | [MorphGNT](https://github.com/morphgnt/sblgnt) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Greek NT glosses, transliteration, Strong’s | STEPBible TAGNT (Tyndale House / STEPBible.org) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Byzantine Greek NT (RP2018), Strong’s and Robinson parsing | Maurice A. Robinson and William G. Pierpont, via [byztxt/byzantine-majority-text](https://github.com/byztxt/byzantine-majority-text) (commit 788ffe7) | Public domain ([CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)) |
| Orthodox / appendix books | English: World English Bible (eBible.org `eng-web`); Greek: Brenton (eBible.org `grcbrent`), except 2 Esdras (English only) | Public domain |
| Septuagint Greek | Brenton’s Septuagint with Apocrypha (eBible.org `grcbrent`) | Public domain |
| Targum Onkelos and Targum Jonathan | [Sefaria](https://www.sefaria.org) public-domain editions | Public domain |
| Latin Vulgate (Clementine) | Michael Tweedale (vulsearch) via [Open Bibles](https://github.com/seven1m/open-bibles) (`lat-clementine.usfx.xml`); aligned with the public-domain Douay-Rheims | Public domain |
| Greek NT, Textus Receptus (Luke 17:36; Acts 8:37, 15:34, 24:7 only) | Scrivener 1894, Maurice A. Robinson transcription, via [byztxt/greektext-scrivener](https://github.com/byztxt/greektext-scrivener) (commit 6049a43) | Public domain (“Copy freely”) |
| Latin stems, endings and meanings (Vulgate word study) | William Whitaker’s WORDS, via [mk270/whitakers-words](https://github.com/mk270/whitakers-words) (commit fb7fb6f) | “Permission is hereby freely given for any and all use of program and data” (see NOTICE) |
| Approximate word-matching tables | Derived in this app from the tagged SBLGNT/TAGNT, RP2018 and TAHOT layers | Same terms as those sources (CC BY 4.0 / public domain) |
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
