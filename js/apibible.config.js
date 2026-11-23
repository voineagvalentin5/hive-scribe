// ===================== API.Bible live translations: the ONE place to configure =====================
// NLT and NKJV are copyrighted. They are never stored in the app: each chapter is loaded live from API.Bible
// (https://api.bible, free Starter plan, non-commercial) through a small proxy, then reported to API.Bible's
// Fair Use Management System (FUMS). See proxy/README.md.
//
// The API key is NOT here and must never be put here. API.Bible's terms (section 12, Security) forbid making
// the key available to anyone, and this file ships to every visitor. The key lives only in the proxy as the
// secret API_BIBLE_KEY. The app only needs the proxy's address.
//
// proxy: '' (empty) = NLT and NKJV are hidden and the app behaves exactly as before.
var APIBIBLE_CONFIG = {
  proxy: 'https://hive-scribe-bible.voineagvalentin5.workers.dev',   // e.g. 'https://hive-scribe-bible.<your-subdomain>.workers.dev' (https only)
  bibles: [
    // bibleId: from api.bible/bibles (public list). Confirm in the API.Bible dashboard after sign-up.
    {id:'nlt',  abbr:'NLT',  bibleId:'d6e14a625393b4da-01', name:'New Living Translation', full:'New Living Translation (Tyndale House Publishers)',
     owner:'Tyndale House Publishers', ownerUrl:'https://tyndale.com',
     // notice: API.Bible terms, Appendix B (verbatim). The copyright line API.Bible returns with each chapter is shown under the text.
     notice:'Holy Bible, New Living Translation, Copyright © 2014, Tyndale House Publishers. All rights reserved.'},
    {id:'nkjv', abbr:'NKJV', bibleId:'63097d2a0a2f7db3-01', name:'New King James Version', full:'New King James Version (Thomas Nelson / HarperCollins)',
     owner:'HarperCollins Christian Publishing (Thomas Nelson)', ownerUrl:'https://harpercollins.com',
     notice:'New King James Version®, Copyright © 1982, Thomas Nelson. All rights reserved.'}
  ],
  fumsScript: 'https://pkg.api.bible/fumsV3.min.js',   // API.Bible FUMS v3 tracker (required for web apps)
  copyMax: 100,          // most verses one "Copy passage" may take from a live version (terms: no printing over 100 verses)
  memVerses: 480,        // in-memory chapter cache, this tab only, kept under API.Bible's 500 consecutive verses; nothing is written to disk
  timeoutMs: 12000
};
