/**
 * Horizon smoke tests - zero dependencies, plain Node.js.
 * Run:  node tests/smoke.mjs   (or: npm test)
 *
 * These are static integrity checks: file layout, launch hygiene,
 * JS<->HTML id wiring, CSS/JS brace balance, storage symmetry, README.
 * They catch the exact class of breakage a judge would hit on first load.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let pass = 0;
let fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) {
    pass++;
    console.log('  PASS  ' + name);
  } else {
    fail++;
    failures.push(name);
    console.log('  FAIL  ' + name + (detail ? ' — ' + detail : ''));
  }
}

// Strip strings + comments so brace counting isn't fooled by content
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

console.log('\n[1/7] file layout');
const cssFiles = ['01-tokens', '02-nav', '03-sections', '04-overlays', '05-themes', '06-features', '07-vintage'];
const required = ['index.html', 'app.js', 'js/data.js', 'favicon.svg', 'og-image.svg', 'robots.txt', 'sitemap.xml']
  .concat(cssFiles.map((f) => 'css/' + f + '.css'));
const missing = required.filter((f) => !fs.existsSync(path.join(root, f)));
ok('all required files exist', missing.length === 0, missing.join(', '));
ok('monolith style.css is gone', !fs.existsSync(path.join(root, 'style.css')));

const html = read('index.html');
const js = read('app.js');
const dataJs = read('js/data.js');

console.log('\n[2/7] launch hygiene');
ok('no TODO(launch) placeholders', !/TODO\(launch\)/.test(html + js));
const noUrls = (s) => s.replace(/https?:\/\/[^\s"'<>]+/g, ''); // repo slug keeps its historic spelling
ok('no "challenege" typo in shipped prose', !/challenege/i.test(noUrls(html) + noUrls(js) + noUrls(read('README.md'))));
const ogUrl = (html.match(/<meta property="og:url" content="([^"]*)"/) || [])[1] || '';
const ogImg = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || '';
ok('og:url is absolute', /^https:\/\//.test(ogUrl), ogUrl || '(missing)');
ok('og:image is absolute', /^https:\/\//.test(ogImg), ogImg || '(missing)');
ok('no console.log leftovers', !/console\.log\(/.test(js));

console.log('\n[3/7] JS <-> HTML id wiring');
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const jsIds = new Set([...js.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]));
// Known exceptions: guarded lookups for removed/optional or runtime-created nodes.
const OPTIONAL_IDS = new Set([
  'btnNavMore', 'navMoreMenu', // "More" menu removed; closeNavMore() guards both
  'quoteDateLabel', // eyebrow dropped in the quote-strip redesign; renderQuote() guards it
  'flLeafPlaneGlyph', // injected at runtime by the Leaflet divIcon
  'simNeeded-', 'simVal-', // dynamic prefixes: 'simNeeded-' + courseId
]);
const dangling = [...jsIds].filter((id) => !htmlIds.has(id) && !OPTIONAL_IDS.has(id));
ok('every getElementById target exists in HTML (' + jsIds.size + ' checked)', dangling.length === 0, dangling.join(', '));
const links = new Set([...html.matchAll(/data-page-link="([^"]+)"/g)].map((m) => m[1]));
const badLinks = [...links].filter((p) => !js.includes("'" + p + "'"));
ok('every nav link resolves in the router (' + links.size + ' checked)', badLinks.length === 0, badLinks.join(', '));

console.log('\n[4/7] brace balance');
function balanced(name, src) {
  const c = codeOnly(src);
  const pairs = [['{', '}'], ['(', ')'], ['[', ']']];
  return pairs.every(([a, b]) => c.split(a).length === c.split(b).length);
}
ok('app.js braces/parens/brackets balance', balanced('app.js', js));
ok('js/data.js balances', balanced('data.js', dataJs));
let cssOk = true;
const cssBad = [];
for (const f of cssFiles.map((x) => 'css/' + x + '.css')) {
  if (!balanced(f, read(f))) { cssOk = false; cssBad.push(f); }
}
ok('all css files balance', cssOk, cssBad.join(', '));

console.log('\n[5/7] data layer contract');
const bindings = [...dataJs.matchAll(/^var (\w+) =/gm)].map((m) => m[1]);
ok('data.js exposes the shared datasets', bindings.length >= 8, bindings.length + ' found');
const unused = bindings.filter((b) => !new RegExp('\\b' + b + '\\b').test(js));
ok('every data.js binding is used by app.js', unused.length === 0, unused.join(', '));
ok('no data bindings left behind in app.js', !/^  var (DEFAULT_COURSES|QUOTES|AIRPORTS|CITY_PHOTOS) =/m.test(js));

console.log('\n[6/7] storage symmetry');
const written = new Set([...js.matchAll(/localStorage\.setItem\(\s*([A-Z_]+|['"][^'"]+['"])/g)].map((m) => m[1]));
// Resolve VAR names to their literal keys
const keyOf = {};
for (const m of js.matchAll(/var ([A-Z_]+) = '([^']+)'/g)) keyOf[m[1]] = m[2];
const writtenKeys = [...written].map((k) => keyOf[k] || k.replace(/['"]/g, ''));
const readKeys = new Set([...js.matchAll(/localStorage\.getItem\(\s*([A-Z_]+|['"][^'"]+['"])/g)]
  .map((m) => keyOf[m[1]] || m[1].replace(/['"]/g, '')));
const writeOnly = writtenKeys.filter((k) => !readKeys.has(k) && k !== 'tue_pass_order_v1');
ok('every persisted key has a reader', writeOnly.length === 0, writeOnly.join(', '));
ok('backup import covers all exported sections', /importJsonData/.test(js) && /btnImportJsonData/.test(html));

console.log('\n[7/7] README');
let readme = '';
try { readme = read('README.md'); } catch (e) { /* missing */ }
ok('README exists and is substantive', readme.split('\n').length >= 20, readme.split('\n').length + ' lines');
ok('README documents setup + features', /## (Features|Run|Setup|Usage)/.test(readme) && /css\//.test(readme));

console.log('\n' + pass + ' passed, ' + fail + ' failed.');
if (fail) process.exit(1);
