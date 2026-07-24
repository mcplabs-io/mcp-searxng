import { spawn } from "node:child_process";

const URLS = [
  "https://searx.namejeff.xyz",
  "https://search.ctq.ro",
  "https://searxng.shreven.org",
  "https://searxng.gdebest.net",
  "https://sear.lurx.net",
  "https://search.lumy.live",
  "https://search.hbubli.cc",
  "https://www.gruble.de",
  "https://searx.ro",
  "https://searxng.cups.moe",
  "https://search.einfachzocken.eu",
  "https://searxng.gr",
  "https://search.jns.net.ar",
  "https://searxng.paralaxitaentomology.org",
  "https://searx.dresden.network",
  "https://searxng.fishfvch.com",
  "https://etsi.me",
  "https://ooglester.com",
  "https://search.undertale.uk",
  "https://opnxng.com",
  "https://search.liuzj.net",
  "https://search.2b9t.xyz",
  "https://searx.mbuf.net",
  "https://searxng.moonshadow.dev",
  "https://searxng.site",
  "https://searxng.website",
  "https://failsearx.culturanerd.it",
  "https://find.xenorio.xyz",
  "https://search.anoni.net",
  "https://search.drayko.xyz",
  "https://search.im-in.space",
  "https://search.indst.eu",
  "https://search.inetol.net",
  "https://search.pereira.is",
  "https://search.rowie.at",
  "https://search.serpensin.com",
  "https://search.zina.dev",
  "https://searx.ankha.ac",
  "https://searx.party",
  "https://searx.perennialte.ch",
  "https://searx.tsmdt.de",
  "https://searx.sev.monster",
  "https://search.unredacted.org",
  "https://search.pi.vps.pw",
  "https://searxng.tr",
  "https://searx.mxchange.org",
];

async function testInstance(url) {
  const base = url.endsWith("/") ? url : `${url}/`;
  const searchUrl = `${base}search?q=test&format=json&language=en-US`;
  try {
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { url, status: res.status, ok: false, reason: `HTTP ${res.status}` };
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      const results = data.results || [];
      const englishResults = results.filter(r => {
        const lang = (r.language || "").toLowerCase();
        return !lang || lang.startsWith("en") || lang === "all";
      });
      return {
        url,
        status: res.status,
        ok: true,
        totalResults: results.length,
        englishResults: englishResults.length,
        sampleTitle: results[0]?.title?.slice(0, 80),
      };
    } catch {
      return { url, status: res.status, ok: false, reason: "Not JSON (HTML)" };
    }
  } catch (e) {
    return { url, status: 0, ok: false, reason: e?.cause?.code || e.message };
  }
}

const results = [];
for (const url of URLS) {
  process.stdout.write(`Testing ${url}... `);
  const r = await testInstance(url);
  results.push(r);
  console.log(r.ok ? `✅ ${r.totalResults} results (${r.englishResults} en)` : `❌ ${r.reason}`);
}

console.log("\n--- WORKING (English results) ---");
const working = results.filter(r => r.ok && r.englishResults > 0);
working.forEach(r => console.log(r.url));
console.log(`\n${working.length}/${URLS.length} working`);
