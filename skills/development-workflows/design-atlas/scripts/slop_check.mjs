#!/usr/bin/env node
/*
 * slop_check: static anti-AI-slop gate checker for design-atlas. Node >= 20, zero dependencies.
 *
 * Ported from hallmark `skills/hallmark/scripts/sloplint.mjs`
 *   https://github.com/nutlope/hallmark  commit 8f6969f8922caabde9de1784959eae11ddf68073
 *   MIT License, Copyright (c) Nutlope. License text: assets/catalog/LICENSES/ (hallmark).
 * Parsers, colour utilities and gate detectors keep their upstream logic; each ported block names
 * the upstream line range. Changes from upstream: no Hallmark CSS stamp (gate 20 dropped), token
 * layer found by selector instead of fixed token names, waivers and declared material read from
 * the project DESIGN.md, only the gates in references/anti-slop.md with class M are checked.
 *
 * usage: node slop_check.mjs <file-or-dir ...> [--design DESIGN.md] [--scope page|component|app] [--json]
 * exit:  0 no open FAIL/REFLEX · 1 open FAIL or REFLEX · 2 bad arguments
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, dirname, basename, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------------------------
// Tier and class table. Must match the gate table in references/anti-slop.md section 3
// (tests/slop_check.test.mjs parses the table and compares).
// ---------------------------------------------------------------------------------------------
export const TIERS = Object.freeze({
  '1': 'reflex', '2a': 'house', '2b': 'reflex', '3': 'reflex', '4': 'house', '6b': 'reflex',
  '7a': 'floor', '8': 'reflex', '9': 'reflex', '10a': 'floor', '10b': 'reflex', '11': 'reflex',
  '12': 'reflex', '15': 'floor', '19': 'house', '26a': 'floor', '26b': 'reflex', '27': 'floor',
  '28a': 'floor', '29': 'reflex', '30a': 'house', '30b': 'reflex', '33': 'floor', '34': 'floor',
  '37': 'reflex', '38i': 'floor', '38iii': 'reflex', '39a': 'floor', '40': 'floor', '41': 'floor',
  '44b': 'floor', '46a': 'floor', '47a': 'house', '47b': 'reflex', '47c': 'reflex', '48': 'floor',
  '49a': 'floor', '50': 'floor', '53': 'floor', '54': 'house', '55a': 'floor', '58': 'house',
  '62': 'floor', '63': 'house', '64': 'reflex', '65': 'reflex', '66': 'reflex', '67': 'house',
  '68': 'reflex', '69': 'reflex', '70': 'floor', '73': 'floor', '74': 'reflex', '76': 'floor',
  '80': 'reflex', '83': 'reflex', '84': 'reflex', '85': 'reflex',
  'F4': 'finish', 'F21': 'finish', 'F23': 'finish', 'F26': 'finish',
});
export const CLASSES = Object.freeze({
  '1': 'M', '2a': 'M', '2b': 'M', '3': 'J', '4': 'M', '6b': 'J', '7a': 'M', '8': 'J', '9': 'J',
  '10a': 'M', '10b': 'M', '11': 'J', '12': 'M', '15': 'M', '19': 'M', '26a': 'M', '26b': 'M',
  '27': 'M', '28a': 'M', '29': 'J', '30a': 'M', '30b': 'M', '33': 'M', '34': 'M', '37': 'M',
  '38i': 'M', '38iii': 'J', '39a': 'M', '40': 'J', '41': 'J', '44b': 'J', '46a': 'J', '47a': 'M',
  '47b': 'M', '47c': 'J', '48': 'M', '49a': 'J', '50': 'M', '53': 'M', '54': 'M+J', '55a': 'M',
  '58': 'J', '62': 'M', '63': 'M+J', '64': 'M', '65': 'J', '66': 'J', '67': 'M', '68': 'J',
  '69': 'J', '70': 'J', '73': 'J', '74': 'M', '76': 'J', '80': 'J', '83': 'J', '84': 'J', '85': 'J',
  'F4': 'J', 'F21': 'J', 'F23': 'J', 'F26': 'J',
});
/** Gates this script implements (class M or M+J). */
export const IMPLEMENTED = Object.freeze(Object.keys(CLASSES).filter((g) => CLASSES[g].startsWith('M')));

const TIER_LABEL = { floor: 'Floor', house: 'House', reflex: 'Reflex', finish: 'Finish' };
// Upstream PAGE_ONLY / APP_SKIP (L791-L795), cut to the gates this script runs.
const PAGE_ONLY = new Set(['34', '47b', '50', '54', '55a']);
const APP_SKIP = new Set(['1']);
const FOLD_AFTER = 8;

// ---------------------------------------------------------------------------------------------
// Files. Upstream collectFiles L42-L63.
// ---------------------------------------------------------------------------------------------
const DOC_EXT = new Set(['.html', '.jsx', '.tsx', '.vue', '.svelte', '.astro']);
const BUILD_DIRS = new Set(['dist', 'build', 'coverage']);
const TW_CONFIG = /^tailwind\.config\.(?:js|cjs|mjs|ts|cts|mts)$/i;
function collectFiles(paths, errors) {
  const files = [];
  const seen = new Set();
  const visit = (p, top) => {
    const abs = resolve(p);
    if (seen.has(abs)) return;
    let st;
    try { st = statSync(abs); } catch { if (top) errors.push(`cannot read ${p}`); return; }
    if (st.isDirectory()) {
      const base = basename(abs);
      if (!top && (base === 'node_modules' || base.startsWith('.') || BUILD_DIRS.has(base))) return;
      let entries = [];
      try { entries = readdirSync(abs).sort(); } catch { return; }
      for (const e of entries) visit(join(abs, e), false);
    } else {
      const ext = extname(abs).toLowerCase();
      if (ext === '.css' || DOC_EXT.has(ext) || TW_CONFIG.test(basename(abs))) { seen.add(abs); files.push(abs); }
    }
  };
  for (const p of paths) visit(p, true);
  return files;
}

// ---------------------------------------------------------------------------------------------
// CSS parser. Upstream stripComments + parseCss L65-L172.
// ---------------------------------------------------------------------------------------------
function stripComments(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src[i] === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else if (src[i] === '"' || src[i] === "'") {
      const q = src[i]; let j = i + 1;
      while (j < src.length && src[j] !== q) { if (src[j] === '\\') j++; j++; }
      out += src.slice(i, Math.min(j + 1, src.length)); i = j + 1;
    } else { out += src[i]; i++; }
  }
  return out;
}

function parseCss(source, file, lineOffset = 0) {
  const src = stripComments(source);
  const nl = [];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') nl.push(i);
  const lineOf = (pos) => {
    let lo = 0, hi = nl.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < pos) lo = mid + 1; else hi = mid; }
    return lo + 1 + lineOffset;
  };
  const rules = [];
  const flatBody = (s, e) => {
    const out = src.slice(s, e).split('');
    let depth = 0, edge = -1;
    for (let i = 0; i < out.length; i++) {
      const c = out[i];
      if (c === '{') {
        if (depth === 0) for (let k = edge + 1; k < i; k++) if (out[k] !== '\n') out[k] = ' ';
        depth++; out[i] = ' ';
      } else if (c === '}') {
        depth = Math.max(0, depth - 1); out[i] = ' ';
        if (depth === 0) edge = i;
      } else if (depth > 0) { if (c !== '\n') out[i] = ' '; }
      else if (c === ';') edge = i;
    }
    return out.join('');
  };
  const nestSel = (sel, parent) => {
    const p = parent.includes(',') ? `:is(${parent})` : parent;
    return sel.split(/,(?![^(]*\))/).map((part) => part.includes('&') ? part.trim().replace(/&/g, p) : `${p} ${part.trim()}`).join(', ');
  };
  const makeRule = (selector, s, e, media, keyframes) => {
    const body = flatBody(s, e);
    const decls = [];
    let off = 0;
    for (const part of body.split(';')) {
      const idx = part.indexOf(':');
      if (idx > 0) {
        const prop = part.slice(0, idx).trim().toLowerCase();
        const value = part.slice(idx + 1).trim().replace(/!important\s*$/i, '').trim();
        if (prop && value && /^-{0,2}[a-z]/.test(prop) && !/[{}]/.test(prop)) {
          decls.push({ prop, value, line: lineOf(s + off + idx) });
        }
      }
      off += part.length + 1;
    }
    return { selector, decls, media: media || null, keyframes: keyframes || null, file, line: lineOf(s) };
  };
  const walk = (start, end, media, keyframes, parent = null) => {
    let i = start;
    while (i < end) {
      while (i < end && /[\s;]/.test(src[i])) i++;
      if (i >= end) break;
      let j = i;
      while (j < end && src[j] !== '{' && src[j] !== '}' && src[j] !== ';') j++;
      if (j >= end) break;
      if (src[j] === '}' || src[j] === ';') { i = j + 1; continue; }
      const selector = src.slice(i, j).trim().replace(/\s+/g, ' ');
      const blockStart = j + 1;
      let depth = 1, k = blockStart;
      while (k < end && depth > 0) {
        if (src[k] === '{') depth++;
        else if (src[k] === '}') depth--;
        k++;
      }
      const blockEnd = Math.max(blockStart, k - 1);
      if (selector.startsWith('@')) {
        if (/^@(media|supports|layer|container|scope)/i.test(selector)) {
          const q = /^@media/i.test(selector) ? selector.replace(/^@media/i, '').trim() : media;
          if (parent) rules.push(makeRule(parent, blockStart, blockEnd, q, keyframes));
          walk(blockStart, blockEnd, q, keyframes, parent);
        } else if (/^@(-webkit-)?keyframes/i.test(selector)) {
          const name = selector.replace(/^@(-webkit-)?keyframes/i, '').trim();
          walk(blockStart, blockEnd, media, name || 'anon');
        } else if (/^@font-face/i.test(selector)) {
          rules.push(makeRule('@font-face', blockStart, blockEnd, media, null));
        } else if (/^@theme\b/i.test(selector)) {
          rules.push(makeRule('@theme', blockStart, blockEnd, media, null));
          walk(blockStart, blockEnd, media, keyframes);
        } else if (/^@starting-style/i.test(selector)) {
          walk(blockStart, blockEnd, media, keyframes, parent);
        }
      } else {
        const sel = parent && !keyframes ? nestSel(selector, parent) : selector;
        rules.push(makeRule(sel, blockStart, blockEnd, media, keyframes));
        if (!keyframes && src.slice(blockStart, blockEnd).includes('{')) walk(blockStart, blockEnd, media, keyframes, sel);
      }
      i = k;
    }
  };
  walk(0, src.length, null, null);
  return rules;
}

// ---------------------------------------------------------------------------------------------
// Markup parsers. Upstream parseHtml L174-L223, braceEnd + templateMask L225-L280,
// clsLits L282-L323, jsxPseudo L325-L502, classCalls + scriptSites + parseDoc L504-L556.
// ---------------------------------------------------------------------------------------------
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const HTML_NAMES = new Set(('a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr track u ul var video wbr').split(' '));

function parseHtml(file, src, kind = 'html') {
  const nl = [];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') nl.push(i);
  const lineOf = (pos) => {
    let lo = 0, hi = nl.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < pos) lo = mid + 1; else hi = mid; }
    return lo + 1;
  };
  const styles = [];
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = styleRe.exec(src))) {
    styles.push({ css: m[1], lineOffset: lineOf(m.index) - 1 });
  }
  let scripts = '';
  const scriptRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = scriptRe.exec(src))) scripts += m[1] + '\n';

  const pad = (t) => t.replace(/[^\n]/g, ' ');
  const masked = src
    .replace(/<!--[\s\S]*?-->/g, pad)
    .replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2\s*>)/gi, (m0, open, tag, body, close) => open + pad(body) + close);
  const tags = [];
  const comps = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  while ((m = tagRe.exec(masked))) {
    if (kind !== 'html' && !HTML_NAMES.has(m[2])) {
      comps.push({ close: m[1] === '/', name: m[2], attrs: m[3] || '', pos: m.index, end: m.index + m[0].length, selfClosing: /\/\s*$/.test(m[3] || ''), line: lineOf(m.index) });
      continue;
    }
    tags.push({
      close: m[1] === '/', name: m[2].toLowerCase(), attrs: m[3] || '',
      pos: m.index, end: m.index + m[0].length,
      selfClosing: /\/\s*$/.test(m[3] || '') || VOID_TAGS.has(m[2].toLowerCase()),
      line: lineOf(m.index),
    });
  }
  const noScript = src.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const text = noScript.replace(/<[^>]*>/g, ' ')
    .replace(/&quot;|&#0?34;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&hellip;|&#8230;/g, '\u2026').replace(/&mdash;|&#8212;|&#x2014;/gi, '\u2014').replace(/&ndash;|&#8211;|&#x2013;/gi, '\u2013')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ');
  return { file, src, masked, styles, scripts, tags, text, lineOf, kind, comps };
}

function braceEnd(s, j) {
  let depth = 0;
  for (let i = j; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'" || c === '`') {
      i++;
      while (i < s.length && s[i] !== c) { if (s[i] === '\\') i++; i++; }
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return s.length;
}

const FRONTMATTER = /^\s*---[^\n]*\n[\s\S]*?\n---/;
function templateMask(src, kind) {
  const n = src.length;
  let out = null;
  const put = (k, ch) => { if (!out) out = src.split(''); out[k] = ch; };
  const blank = (a, b) => { for (let k = a; k < b; k++) if (src[k] !== '\n' && src[k] !== ' ') put(k, ' '); };
  const lower = src.toLowerCase();
  const braces = kind === 'svelte' || kind === 'astro';
  let i = 0;
  if (kind === 'astro') {
    const fm = FRONTMATTER.exec(src);
    if (fm) { blank(0, fm[0].length); i = fm[0].length; }
  }
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) break;
    if (src.startsWith('<!--', lt)) { const e = src.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (!/[A-Za-z]/.test(src[lt + 1] || '')) { i = lt + 1; continue; }
    let j = lt + 1;
    while (j < n && /[\w:.-]/.test(src[j])) j++;
    const name = lower.slice(lt + 1, j);
    while (j < n && src[j] !== '>') {
      const c = src[j];
      if (c === '"' || c === "'") {
        let e = src.indexOf(c, j + 1);
        if (e < 0) e = n;
        for (let k = j + 1; k < e; k++) if (src[k] === '<' || src[k] === '>') put(k, ' ');
        j = e + 1;
        continue;
      }
      if (c === '{' && braces) { const e = braceEnd(src, j); blank(j + 1, e); j = e + 1; continue; }
      j++;
    }
    i = j + 1;
    if (name === 'script' || name === 'style' || name === 'textarea') {
      const e = lower.indexOf('</' + name, i);
      i = e < 0 ? n : e;
    }
  }
  return out ? out.join('') : src;
}

const cutGlued = (seg, after, before) => {
  let s = seg;
  if (after) s = s.replace(/^\S+/, '');
  if (before) s = s.replace(/\S+$/, '');
  return s;
};
function clsLits(s, level = 0) {
  if (level > 20) return [];
  const parts = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '/' && s[i + 1] === '/') { const e = s.indexOf('\n', i); i = e < 0 ? s.length : e; continue; }
    if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); i = e < 0 ? s.length : e + 2; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < s.length && s[j] !== c && s[j] !== '\n') { if (s[j] === '\\') j++; j++; }
      parts.push(s.slice(i + 1, j));
      i = j + 1;
      continue;
    }
    if (c === '`') {
      let j = i + 1, seg = '', after = false;
      while (j < s.length && s[j] !== '`') {
        if (s[j] === '\\') { seg += s[j + 1] || ''; j += 2; continue; }
        if (s[j] === '$' && s[j + 1] === '{') {
          parts.push(cutGlued(seg, after, true));
          const e = braceEnd(s, j + 1);
          parts.push(clsLits(s.slice(j + 2, e), level + 1).join(' '));
          j = e + 1; seg = ''; after = true;
          continue;
        }
        seg += s[j]; j++;
      }
      parts.push(cutGlued(seg, after, false));
      i = j + 1;
      continue;
    }
    i++;
  }
  return parts.join(' ').split(/\s+/).filter(Boolean);
}

const JS_EXPR_KW = new Set(['return', 'yield', 'await', 'case', 'default', 'else', 'do', 'throw', 'typeof', 'void', 'delete', 'in', 'of', 'new', 'instanceof']);
const CLASS_FNS = new Set(['cn', 'clsx', 'classNames', 'classnames', 'twMerge', 'twJoin', 'cva', 'cx', 'tv']);
function jsxPseudo(src) {
  const n = src.length;
  const out = new Array(n);
  for (let k = 0; k < n; k++) out[k] = src[k] === '\n' ? '\n' : ' ';
  const classes = [];
  const calls = [];
  let hi = 0, fails = 0, inClass = 0, depth = 0;
  const blank = (a, b) => { for (let k = a; k < b && k < n; k++) out[k] = src[k] === '\n' ? '\n' : ' '; };
  const paint = (a, b) => { for (let k = a; k < b && k < n; k++) out[k] = src[k]; if (b > hi) hi = b; };
  const write = (a, b, text) => {
    blank(a, b);
    let k = a;
    for (const ch of text) { while (k < b && src[k] === '\n') k++; if (k >= b) break; out[k++] = ch; }
    if (b > hi) hi = b;
  };
  const ws = (i) => { while (i < n && /\s/.test(src[i])) i++; return i; };
  const gap = (i) => {
    for (;;) {
      i = ws(i);
      if (src[i] === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); if (e < 0) return n; i = e + 2; continue; }
      if (src[i] === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); if (e < 0) return n; i = e; continue; }
      return i;
    }
  };
  const strEnd = (i) => {
    const q = src[i];
    let j = i + 1;
    while (j < n && src[j] !== q && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
    return Math.min(j + 1, n);
  };
  const tplEnd = (i) => {
    let j = i + 1;
    while (j < n && src[j] !== '`') {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === '$' && src[j + 1] === '{') { j = js(j + 2, true) + 1; continue; }
      j++;
    }
    return Math.min(j + 1, n);
  };
  const reEnd = (i) => {
    let j = i + 1, set = false;
    while (j < n && src[j] !== '\n') {
      const c = src[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '[') set = true;
      else if (c === ']') set = false;
      else if (c === '/' && !set) { j++; while (j < n && /[a-z]/i.test(src[j])) j++; return j; }
      j++;
    }
    return -1;
  };
  function js(i, stop) {
    if (depth > 200) return stop ? Math.min(braceEnd(src, i - 1), n) : n;
    depth++;
    const r = jsScan(i, stop);
    depth--;
    return r;
  }
  function jsScan(i, stop) {
    let level = 0, val = false;
    while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\n' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = e < 0 ? n : e; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === '"' || c === "'") { i = strEnd(i); val = true; continue; }
      if (c === '`') { i = tplEnd(i); val = true; continue; }
      if (c === '{') { level++; i++; val = false; continue; }
      if (c === '}') { if (stop && level === 0) return i; level--; i++; val = true; continue; }
      if (c === ')' || c === ']') { i++; val = true; continue; }
      if (c === '<' && !val && fails < 500 && /[A-Za-z_$>]/.test(src[i + 1] || '')) {
        const e = el(i);
        if (e > 0) { i = e; val = true; continue; }
        fails++;
      }
      if (c === '/' && !val) { const e = reEnd(i); if (e > 0) { i = e; val = true; continue; } }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i + 1;
        while (j < n && /[\w$]/.test(src[j])) j++;
        const w = src.slice(i, j);
        val = !JS_EXPR_KW.has(w);
        if (!inClass && CLASS_FNS.has(w) && src[i - 1] !== '.' && src[ws(j)] === '(') calls.push(i);
        i = j;
        continue;
      }
      if (c >= '0' && c <= '9') { let j = i + 1; while (j < n && /[\w.]/.test(src[j])) j++; i = j; val = true; continue; }
      i++;
      val = false;
    }
    return n;
  }
  function el(start) {
    if (depth > 200) return -1;
    const mc = classes.length, mk = calls.length;
    depth++;
    const e = tag(start);
    depth--;
    if (e < 0) { blank(start, Math.max(hi, start + 1)); hi = start; classes.length = mc; calls.length = mk; }
    return e;
  }
  function tag(start) {
    let i = start + 1;
    if (src[i] === '>') return kids(i + 1, '');
    let j = i;
    while (j < n && /[\w$.:-]/.test(src[j])) j++;
    const name = src.slice(i, j);
    paint(start, j);
    i = j;
    let cls = null;
    for (;;) {
      i = gap(i);
      if (i >= n) return -1;
      const c = src[i];
      if (c === '/' && src[i + 1] === '>') { paint(i, i + 2); if (cls) classes.push([start, cls]); return i + 2; }
      if (c === '>') { paint(i, i + 1); i++; break; }
      if (c === '{') { const e = js(i + 1, true); if (e >= n) return -1; blank(i, e + 1); i = e + 1; continue; }
      if (!/[A-Za-z_$]/.test(c)) return -1;
      let k = i + 1;
      while (k < n && /[\w$:.-]/.test(src[k])) k++;
      const attr = src.slice(i, k);
      let v = ws(k);
      if (src[v] !== '=') { paint(i, k); i = k; continue; }
      v = ws(v + 1);
      const q = src[v];
      const isCls = attr === 'className' || attr === 'class';
      let e;
      if (q === '"' || q === "'") {
        e = src.indexOf(q, v + 1);
        if (e < 0) return -1;
        if (isCls) cls = (cls || []).concat(src.slice(v + 1, e).split(/\s+/).filter(Boolean));
        else paint(i, e + 1);
      } else if (q === '{') {
        if (isCls) inClass++;
        e = js(v + 1, true);
        if (isCls) inClass--;
        if (e >= n) return -1;
        if (isCls) cls = (cls || []).concat(clsLits(src.slice(v + 1, e)));
        else { paint(i, v); write(v, e + 1, '"' + src.slice(v + 1, e).replace(/[^\w$.\-/:#@]+/g, ' ') + '"'); }
      } else if (q === '<') {
        e = el(v) - 1;
        if (e < 0) return -1;
        blank(i, e + 1);
      } else return -1;
      if (isCls && cls) write(i, e + 1, 'class="' + cls.join(' ').replace(/"/g, "'").replace(/[<>]/g, ' ') + '"');
      i = e + 1;
    }
    if (cls) classes.push([start, cls]);
    return kids(i, name);
  }
  function kids(i, name) {
    while (i < n) {
      const c = src[i];
      if (c === '{') { const e = js(i + 1, true); if (e >= n) return -1; i = e + 1; continue; }
      if (c === '<') {
        if (src[i + 1] === '/') {
          const k = ws(i + 2);
          let j = k;
          while (j < n && /[\w$.:-]/.test(src[j])) j++;
          const e = ws(j);
          if (src[e] !== '>' || src.slice(k, j) !== name) return -1;
          if (name) paint(i, e + 1);
          return e + 1;
        }
        if (/[A-Za-z_$>]/.test(src[i + 1] || '')) { const e = el(i); if (e > 0) { i = e; continue; } }
        i++;
        continue;
      }
      out[i] = c;
      if (i >= hi) hi = i + 1;
      i++;
    }
    return -1;
  }
  js(0, false);
  return { pseudo: out.join(''), classAt: new Map(classes), calls };
}

function classCalls(src, sites) {
  const out = [];
  let last = -1;
  for (const pos of [...sites].sort((a, b) => a - b)) {
    if (pos < last) continue;
    const open = src.indexOf('(', pos);
    if (open < 0) continue;
    let depth = 0, i = open;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = e < 0 ? src.length : e; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 1; continue; }
      if (c === '"' || c === "'" || c === '`') { i++; while (i < src.length && src[i] !== c) { if (src[i] === '\\') i++; i++; } continue; }
      if (c === '(') depth++;
      else if (c === ')' && --depth === 0) break;
    }
    last = i;
    const toks = clsLits(src.slice(open + 1, i));
    if (toks.length) out.push({ pos, name: /^[\w$]+/.exec(src.slice(pos))[0], toks });
  }
  return out;
}

function scriptSites(src, kind) {
  const ranges = [];
  for (const m of src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) ranges.push([m.index + m[0].length - m[1].length - 9, m.index + m[0].length - 9]);
  const fm = kind === 'astro' ? FRONTMATTER.exec(src) : null;
  if (fm) ranges.push([0, fm[0].length]);
  const sites = [];
  for (const [a, b] of ranges) {
    for (const m of src.slice(a, b).matchAll(/(?<![\w$.])(?:cn|clsx|classNames|classnames|twMerge|twJoin|cva|cx|tv)\s*\(/g)) sites.push(a + m.index);
  }
  return sites;
}

function parseDoc(file, raw) {
  const ext = extname(file).toLowerCase();
  if (ext === '.jsx' || ext === '.tsx') {
    const j = jsxPseudo(raw);
    const doc = parseHtml(file, j.pseudo, 'jsx');
    doc.styles = [];
    doc.scripts = raw;
    doc.classAt = j.classAt;
    doc.virtuals = classCalls(raw, j.calls);
    doc.raw = raw;
    return doc;
  }
  const kind = ext === '.html' ? 'html' : ext.slice(1);
  const doc = parseHtml(file, templateMask(raw, kind), kind);
  doc.raw = raw;
  doc.virtuals = kind === 'html' ? [] : classCalls(raw, scriptSites(raw, kind));
  return doc;
}

// Upstream getAttr .. innerOf L558-L632.
function getAttr(attrStr, name) {
  const re = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>/]+))`, 'i');
  const m = re.exec(attrStr);
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? '';
}
function hasAttr(attrStr, name) {
  return new RegExp(`(?:^|\\s)${name}(?=[\\s=/]|$)`, 'i').test(attrStr);
}
function directChildren(doc, idx) {
  const open = doc.tags[idx];
  if (open.close || open.selfClosing) return [];
  const children = [];
  let depth = 1;
  let childStart = -1, childOpen = null, childIdx = -1;
  for (let i = idx + 1; i < doc.tags.length; i++) {
    const t = doc.tags[i];
    if (t.close) {
      depth--;
      if (depth === 0) break;
      if (depth === 1 && childOpen) {
        children.push({ name: childOpen.name, open: doc.src.slice(childOpen.pos, childOpen.end), html: doc.src.slice(childStart, t.end), idx: childIdx });
        childOpen = null;
      }
      continue;
    }
    if (depth === 1) {
      if (t.selfClosing) {
        children.push({ name: t.name, open: doc.src.slice(t.pos, t.end), html: doc.src.slice(t.pos, t.end), idx: i });
      } else {
        childStart = t.pos; childOpen = t; childIdx = i;
      }
    }
    if (!t.selfClosing) depth++;
  }
  return children;
}
function ancestorMap(doc) {
  if (doc._anc) return doc._anc;
  const map = new Map();
  const stack = [];
  for (let i = 0; i < doc.tags.length; i++) {
    const t = doc.tags[i];
    if (t.close) { stack.pop(); continue; }
    map.set(i, stack.slice());
    if (!t.selfClosing) stack.push(t.name);
  }
  doc._anc = map;
  return map;
}
function plainText(html) {
  return html.replace(/<[^>]*>/g, ' ')
    .replace(/&middot;|&#0?183;|&#x0?b7;/gi, '·').replace(/&bull;|&#8226;|&#x2022;/gi, '•').replace(/&mdash;|&#8212;|&#x2014;/gi, '\u2014').replace(/&ndash;|&#8211;|&#x2013;/gi, '\u2013')
    .replace(/&rarr;|&#8594;|&#x2192;|&xrarr;|&#10230;/gi, '\u2192').replace(/&raquo;|&#187;|&#xbb;/gi, '\u00bb').replace(/&rsaquo;|&#8250;|&#x203a;/gi, '\u203a')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&rsquo;|&lsquo;|&#8217;|&#8216;|&#x2019;|&#x2018;/gi, '\u2019').replace(/&rdquo;|&ldquo;|&#8220;|&#8221;/gi, '"')
    .replace(/&#\d+;|&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}
function innerOf(doc, idx) {
  const open = doc.tags[idx];
  if (open.close || open.selfClosing) return null;
  let depth = 1;
  for (let i = idx + 1; i < doc.tags.length; i++) {
    const t = doc.tags[i];
    if (t.selfClosing) continue;
    if (t.close) { depth--; if (depth === 0) return { inner: doc.src.slice(open.end, t.pos), endPos: t.pos }; }
    else depth++;
  }
  return { inner: doc.src.slice(open.end), endPos: doc.src.length };
}
// Upstream closeIndex L3669-L3679.
function closeIndex(doc, idx) {
  if (doc.tags[idx].selfClosing) return idx;
  let depth = 1;
  for (let i = idx + 1; i < doc.tags.length; i++) {
    const t = doc.tags[i];
    if (t.selfClosing) continue;
    if (!t.close) depth++;
    else if (--depth === 0) return i;
  }
  return doc.tags.length - 1;
}
// Upstream proseRun + maskedProse L2550-L2565.
const proseRun = (run, pad) => {
  let r = run;
  for (let k = 0; k < 3 && /\{[^{}]*\}/.test(r); k++) r = r.replace(/\{[^{}]*\}/g, pad);
  return /[;=(){}]|\breturn\b/.test(r) ? pad(r) : r;
};
function maskedProse(doc) {
  if (doc._prose == null) {
    const pad = (m) => m.replace(/[^\n]/g, ' ');
    const src = doc.kind && doc.kind !== 'html' ? doc.src.replace(/(^|>)([^<>]*)(?=<|$)/g, (m0, a, run) => a + proseRun(run, pad)) : doc.src;
    doc._prose = src
      .replace(/<(script|style|pre|code|kbd|samp|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi, pad)
      .replace(/<!--[\s\S]*?-->/g, pad)
      .replace(/<[^>]*>/g, pad);
  }
  return doc._prose;
}

// ---------------------------------------------------------------------------------------------
// Colour utilities. Upstream parseNum .. contrastRatio L634-L745.
// ---------------------------------------------------------------------------------------------
function parseNum(s) { const v = parseFloat(s); return Number.isNaN(v) ? null : v; }
export function parseColor(raw) {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (v === 'white') return { r: 1, g: 1, b: 1, alpha: 1 };
  if (v === 'black') return { r: 0, g: 0, b: 0, alpha: 1 };
  if (v === 'transparent') return { r: 0, g: 0, b: 0, alpha: 0 };
  let m;
  if ((m = /^#([0-9a-f]{3,8})$/.exec(v))) {
    const h = m[1];
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h[0] + h[0], 16) / 255, g = parseInt(h[1] + h[1], 16) / 255, b = parseInt(h[2] + h[2], 16) / 255;
      const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1;
      return { r, g, b, alpha: a };
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, alpha: a };
    }
    return null;
  }
  if ((m = /^rgba?\(([^)]+)\)$/.exec(v))) {
    const parts = m[1].split('/');
    const nums = parts[0].split(/[\s,]+/).filter(Boolean);
    if (nums.length < 3) return null;
    const chan = (s) => s.endsWith('%') ? parseNum(s) / 100 : parseNum(s) / 255;
    let alpha = 1;
    if (parts[1] != null) alpha = parts[1].trim().endsWith('%') ? parseNum(parts[1]) / 100 : parseNum(parts[1]);
    else if (nums.length === 4) alpha = nums[3].endsWith('%') ? parseNum(nums[3]) / 100 : parseNum(nums[3]);
    const [r, g, b] = nums.slice(0, 3).map(chan);
    if ([r, g, b].some((x) => x == null || Number.isNaN(x))) return null;
    return { r, g, b, alpha: alpha ?? 1 };
  }
  if ((m = /^hsla?\(([^)]+)\)$/.exec(v))) {
    const parts = m[1].split('/');
    const nums = parts[0].split(/[\s,]+/).filter(Boolean);
    if (nums.length < 3) return null;
    const h = parseNum(nums[0]);
    const s = parseNum(nums[1]) / 100, l = parseNum(nums[2]) / 100;
    let alpha = 1;
    if (parts[1] != null) alpha = parts[1].trim().endsWith('%') ? parseNum(parts[1]) / 100 : parseNum(parts[1]);
    else if (nums.length === 4) alpha = nums[3].endsWith('%') ? parseNum(nums[3]) / 100 : parseNum(nums[3]);
    if ([h, s, l].some((x) => x == null || Number.isNaN(x))) return null;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = ((h % 360) + 360) % 360 / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb = [0, 0, 0];
    if (hp < 1) rgb = [c, x, 0]; else if (hp < 2) rgb = [x, c, 0];
    else if (hp < 3) rgb = [0, c, x]; else if (hp < 4) rgb = [0, x, c];
    else if (hp < 5) rgb = [x, 0, c]; else rgb = [c, 0, x];
    const mAdd = l - c / 2;
    return { r: rgb[0] + mAdd, g: rgb[1] + mAdd, b: rgb[2] + mAdd, alpha: alpha ?? 1 };
  }
  if ((m = /^oklch\(([^)]+)\)$/.exec(v))) {
    const parts = m[1].split('/');
    const nums = parts[0].split(/\s+/).filter(Boolean);
    if (nums.length < 3) return null;
    let L = parseNum(nums[0]);
    if (nums[0].endsWith('%')) L = L / 100;
    const C = parseNum(nums[1]);
    const H = nums[2] === 'none' ? 0 : parseNum(nums[2]);
    let alpha = 1;
    if (parts[1] != null) alpha = parts[1].trim().endsWith('%') ? parseNum(parts[1]) / 100 : parseNum(parts[1]);
    if (L == null || C == null || H == null) return null;
    const rgb = oklchToSrgb(L, C, H);
    return { ...rgb, alpha: alpha ?? 1, okl: { L, C, H } };
  }
  return null;
}
function oklchToSrgb(L, C, H) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, mm = m_ ** 3, s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s,
  ].map((c) => Math.min(1, Math.max(0, c)));
  const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  return { r: enc(lin[0]), g: enc(lin[1]), b: enc(lin[2]) };
}
function srgbToOklch(col) {
  const dec = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const r = dec(col.r), g = dec(col.g), b = dec(col.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}
const okOf = (c) => c.okl || srgbToOklch(c);
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

// ---------------------------------------------------------------------------------------------
// Token layer, found by selector and never by token name (new; replaces upstream TOKEN_SEL L747).
// A rule is token layer when every selector part is :root / :host / html or body qualified by a
// theme attribute or class, a [data-*theme|mode|scheme|color*] attribute, .dark / .light /
// .theme-*, or the rule is @theme / @font-face.
// ---------------------------------------------------------------------------------------------
const THEME_QUAL = String.raw`(?:\[data-[\w-]*(?:theme|mode|scheme|color)[\w-]*[^\]]*\]|\.(?:dark|light|theme-[\w-]+)|:root|:host(?:\([^)]*\))?|:not\([^)]*\)|:where\([^)]*\)|:is\([^)]*\))`;
const TOKEN_PART = new RegExp(`^(?:(?:html|body)${THEME_QUAL}+|${THEME_QUAL}+)$`, 'i');
function isTokenRule(rule) {
  if (rule.selector === '@font-face' || rule.selector === '@theme' || rule.tailwindConfig) return true;
  return rule.selector.split(',').every((p) => { const t = p.trim(); return t && TOKEN_PART.test(t); });
}
function buildTokens(rules) {
  const tokens = {};
  for (const r of rules) {
    if (!isTokenRule(r)) continue;
    for (const d of r.decls) if (d.prop.startsWith('--')) tokens[d.prop] = d.value;
  }
  return tokens;
}
function resolveVars(value, tokens, local = null, depth = 0) {
  if (!value || depth > 5 || !value.includes('var(')) return value;
  const out = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g, (m0, name, fb) => {
    const v = (local && local[name] != null) ? local[name] : tokens[name];
    if (v != null) return v;
    if (fb != null) return fb.trim();
    return m0;
  });
  if (out === value) return out;
  return resolveVars(out, tokens, local, depth + 1);
}
const famKey = (f) => String(f || '').replace(/[\s_-]+/g, '').toLowerCase();
function firstFamily(value) {
  return String(value || '').split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
}
function pxOf(value) {
  const m = /^(-?\d+(?:\.\d+)?)(px|rem|em)$/.exec(String(value).trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === 'px' ? n : n * 16;
}
const trunc = (s, n = 72) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// Tailwind config theme blocks count as token layer (new). A rough literal scan: colour values
// and fontFamily arrays become tokens named --tw-<key> / --font-<key>.
function parseTailwindConfig(raw, file) {
  const decls = [];
  const lines = raw.split('\n');
  let inFont = false, depth = 0;
  lines.forEach((ln, i) => {
    if (/fontFamily\s*:/.test(ln)) { inFont = true; depth = 0; }
    if (inFont) {
      const fm = /['"]?([\w-]+)['"]?\s*:\s*\[\s*(['"])([^'"]+)\2/.exec(ln);
      if (fm) decls.push({ prop: `--font-${fm[1]}`, value: `"${fm[3]}"`, line: i + 1 });
      depth += (ln.match(/\{/g) || []).length - (ln.match(/\}/g) || []).length;
      if (depth <= 0 && /\}/.test(ln)) inFont = false;
    }
    for (const m of ln.matchAll(/['"]?([\w-]+)['"]?\s*:\s*(['"])(#[0-9a-fA-F]{3,8}|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\))\2/g)) {
      decls.push({ prop: `--tw-${m[1]}`, value: m[3], line: i + 1 });
    }
  });
  return { selector: '@tailwind-config', decls, media: null, keyframes: null, file, line: 1, tailwindConfig: true };
}

// ---------------------------------------------------------------------------------------------
// DESIGN.md reader (new): frontmatter tokens, x-theme, body sections, ## Anti-slop Waivers.
// ---------------------------------------------------------------------------------------------
function unquote(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}
function yamlScalar(raw) {
  let s = raw.trim();
  if (s.startsWith('{') || s.startsWith('[')) return yamlFlow(s);
  if (s.startsWith('"') || s.startsWith("'")) {
    const q = s[0];
    const e = s.indexOf(q, 1);
    return e > 0 ? s.slice(1, e) : s.slice(1);
  }
  s = s.replace(/\s+#.*$/, '').trim();
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
  if (/^(true|false)$/i.test(s)) return s.toLowerCase() === 'true';
  if (/^(null|~)$/i.test(s)) return null;
  return s;
}
function yamlFlow(s) {
  let p = 0;
  const ws = () => { while (p < s.length && /\s/.test(s[p])) p++; };
  const quoted = () => { const q = s[p]; const e = s.indexOf(q, p + 1); const out = s.slice(p + 1, e < 0 ? s.length : e); p = e < 0 ? s.length : e + 1; return out; };
  const atom = (stops) => {
    ws();
    if (s[p] === '"' || s[p] === "'") return quoted();
    let depth = 0, start = p;
    while (p < s.length) {
      const c = s[p];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (depth <= 0 && stops.includes(c)) break;
      p++;
    }
    return yamlScalar(s.slice(start, p));
  };
  const val = () => {
    ws();
    if (s[p] === '{') {
      p++; const o = {};
      for (;;) {
        ws();
        if (s[p] === '}') { p++; break; }
        if (p >= s.length) break;
        const k = s[p] === '"' || s[p] === "'" ? quoted() : (() => { const st = p; while (p < s.length && s[p] !== ':' && s[p] !== '}') p++; return s.slice(st, p).trim(); })();
        ws();
        if (s[p] === ':') p++;
        o[k] = val();
        ws();
        if (s[p] === ',') { p++; continue; }
        if (s[p] === '}') { p++; break; }
        break;
      }
      return o;
    }
    if (s[p] === '[') {
      p++; const a = [];
      for (;;) {
        ws();
        if (s[p] === ']') { p++; break; }
        if (p >= s.length) break;
        a.push(val());
        ws();
        if (s[p] === ',') { p++; continue; }
        if (s[p] === ']') { p++; break; }
        break;
      }
      return a;
    }
    return atom(',}]');
  };
  return val();
}
export function parseYaml(text) {
  const items = [];
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const indent = /^ */.exec(line)[0].length;
    items.push({ indent, text: line.slice(indent) });
  }
  let i = 0;
  const isItem = (t) => t === '-' || t.startsWith('- ');
  const block = (indent) => (i < items.length && isItem(items[i].text) ? list(indent) : map(indent));
  const map = (indent) => {
    const obj = {};
    while (i < items.length && items[i].indent === indent && !isItem(items[i].text)) {
      const m = /^("[^"]*"|'[^']*'|[^:]+?)\s*:(?:\s+(.*)|\s*)$/.exec(items[i].text);
      i++;
      if (!m) continue;
      const key = unquote(m[1]);
      const rest = (m[2] ?? '').trim();
      if (rest === '|' || rest === '>' || rest === '|-' || rest === '>-') {
        const parts = [];
        while (i < items.length && items[i].indent > indent) { parts.push(items[i].text); i++; }
        obj[key] = parts.join(rest.startsWith('|') ? '\n' : ' ');
      } else if (rest === '') {
        if (i < items.length && items[i].indent > indent) obj[key] = block(items[i].indent);
        else if (i < items.length && items[i].indent === indent && isItem(items[i].text)) obj[key] = list(indent);
        else obj[key] = null;
      } else obj[key] = yamlScalar(rest);
    }
    return obj;
  };
  const list = (indent) => {
    const arr = [];
    while (i < items.length && items[i].indent === indent && isItem(items[i].text)) {
      const rest = items[i].text.slice(1).trim();
      i++;
      if (!rest) { arr.push(i < items.length && items[i].indent > indent ? block(items[i].indent) : null); continue; }
      if (/^[^"'{[][^:]*:(\s|$)/.test(rest)) {
        items.splice(i, 0, { indent: indent + 2, text: rest });
        arr.push(map(indent + 2));
      } else arr.push(yamlScalar(rest));
    }
    return arr;
  };
  return items.length ? block(items[0].indent) : {};
}

export function readDesign(file) {
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  let fm = {}, bodyStart = 0;
  if (lines[0] && lines[0].trim() === '---') {
    const end = lines.findIndex((l, k) => k > 0 && l.trim() === '---');
    if (end > 0) {
      try { fm = parseYaml(lines.slice(1, end).join('\n')) || {}; } catch { fm = {}; }
      if (typeof fm !== 'object' || Array.isArray(fm)) fm = {};
      bodyStart = end + 1;
    }
  }
  const sections = new Map();
  let cur = { title: '', start: bodyStart + 1, lines: [] };
  const push = () => { const k = cur.title.toLowerCase(); if (!sections.has(k)) sections.set(k, cur); };
  for (let k = bodyStart; k < lines.length; k++) {
    const h = /^##\s+(.+?)\s*#*\s*$/.exec(lines[k]);
    if (h && !lines[k].startsWith('###')) { push(); cur = { title: h[1], start: k + 1, lines: [] }; continue; }
    cur.lines.push({ text: lines[k], line: k + 1 });
  }
  push();
  const sectionText = (title) => (sections.get(title.toLowerCase())?.lines || []).map((l) => l.text).join('\n');
  const waiverSec = [...sections.values()].find((s) => /^anti-slop waivers$/i.test(s.title));
  const bodyText = [...sections.values()].filter((s) => s !== waiverSec).map((s) => `${s.title}\n${s.lines.map((l) => l.text).join('\n')}`).join('\n');
  return { file, fm, sections, sectionText, waiverSec, bodyText, xTheme: fm['x-theme'] || null };
}

function findDesign(start) {
  let dir = start;
  try { if (statSync(dir).isFile()) dir = dirname(dir); } catch { return null; }
  for (;;) {
    let entries = [];
    try { entries = readdirSync(dir); } catch { entries = []; }
    const hit = entries.find((e) => e.toLowerCase() === 'design.md');
    if (hit) {
      const p = join(dir, hit);
      try { if (statSync(p).isFile()) return p; } catch { /* keep walking */ }
    }
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// Design helpers for declared-material predicates.
const MONO_FAMILY = /mono|courier|jetbrains|geist mono|commit|fira code|space mono|dm mono|roboto mono|source code|silkscreen|consolas|menlo|vt323|press start|share tech|monospace/i;
function designTypography(design) {
  const t = design?.fm?.typography;
  return t && typeof t === 'object' && !Array.isArray(t) ? t : {};
}
function familyOfToken(v) {
  if (v == null) return null;
  if (typeof v === 'string') return firstFamily(v);
  if (Array.isArray(v)) return firstFamily(String(v[0] ?? ''));
  if (typeof v === 'object') return familyOfToken(v.fontFamily ?? v['font-family'] ?? v.family);
  return null;
}
function designFamilies(design, keyRe) {
  const out = [];
  for (const [k, v] of Object.entries(designTypography(design))) {
    if (!keyRe.test(k)) continue;
    const f = familyOfToken(v);
    if (f) out.push(f);
  }
  return out;
}
function designColors(design) {
  const out = [];
  const visit = (k, v) => {
    if (typeof v === 'string') { for (const m of v.matchAll(COLOR_RE)) { const c = parseColor(m[0]); if (c) out.push({ key: k, raw: m[0].toLowerCase(), c }); } }
    else if (v && typeof v === 'object') for (const [kk, vv] of Object.entries(v)) visit(kk, vv);
  };
  const fm = design?.fm || {};
  visit('colors', fm.colors);
  if (design?.xTheme && typeof design.xTheme === 'object') visit('x-theme', design.xTheme.tokens);
  return out;
}
const hex6 = (h) => { const x = h.toLowerCase().replace('#', ''); return x.length === 3 ? x.split('').map((c) => c + c).join('') : x.slice(0, 6); };
const sameColor = (a, b) => Math.abs(a.r - b.r) < 0.03 && Math.abs(a.g - b.g) < 0.03 && Math.abs(a.b - b.b) < 0.03;

/** Declared-material predicates (anti-slop.md section 4). Return a reason string or null. Never Floor. */
export const DECLARED = {
  '1': (design, f) => {
    const fam = f.data?.family;
    if (!fam) return null;
    const fams = designFamilies(design, /^(display|headline|heading|h1|h2|hero|title)/i);
    const face = design?.xTheme?.display?.face;
    if (face) fams.push(firstFamily(face));
    return fams.some((x) => famKey(x) === famKey(fam)) ? `DESIGN.md sets ${fam} as the display face` : null;
  },
  '2a': (design, f) => {
    const fm = design?.fm || {};
    const words = [fm.name, fm.description, design?.sectionText('Overview')].filter(Boolean).join(' ');
    const keyHit = Object.keys(fm.colors || {}).some((k) => /gradient/i.test(k));
    if (!/gradient|渐变/i.test(words) && !keyHit) return null;
    const stops = f.data?.stops || [];
    if (!stops.length) return null;
    const cols = designColors(design);
    return stops.every((s) => cols.some((c) => sameColor(c.c, s))) ? 'DESIGN.md declares a gradient material built from its own colours' : null;
  },
  '54': (design) => {
    const comp = design?.sectionText('Components') || '';
    const keys = Object.keys(design?.fm?.components || {});
    return /\b(eyebrow|kicker)\b/i.test(comp) || keys.some((k) => /eyebrow|kicker/i.test(k)) ? 'DESIGN.md lists an eyebrow component' : null;
  },
  '64': (design) => {
    if (String(design?.xTheme?.display?.class || '').toLowerCase() === 'mono') return 'x-theme.display.class is mono';
    const fams = designFamilies(design, /^(display|headline|heading|h[1-6]|hero|title|body|label|caption|text)/i);
    const mono = fams.find((x) => MONO_FAMILY.test(x));
    return mono ? `DESIGN.md typography uses ${mono} as a material face` : null;
  },
  '67': (design) => {
    for (const [k, v] of Object.entries(designTypography(design))) {
      if (!v || typeof v !== 'object') continue;
      const tt = String(v.textTransform ?? v['text-transform'] ?? '');
      const ls = String(v.letterSpacing ?? v['letter-spacing'] ?? '');
      if (/uppercase/i.test(tt) && parseFloat(ls) > 0) return `typography.${k} is uppercase and tracked`;
    }
    const typo = design?.sectionText('Typography') || '';
    return /uppercase|all caps|small caps/i.test(typo) && /label|caption|tag|nav|button|meta/i.test(typo) ? 'the Typography section states an uppercase label rule' : null;
  },
  '74': (design, f) => {
    const hex = f.data?.hex;
    if (!hex) return null;
    return designColors(design).some((c) => c.raw.startsWith('#') && hex6(c.raw) === hex6(hex)) ? `${hex} is a DESIGN.md colour` : null;
  },
};

// ---------------------------------------------------------------------------------------------
// Style lookup helpers. Upstream L1026-L1099, baseSelector L2576, fontSizePxOf L2762.
// ---------------------------------------------------------------------------------------------
function selectorIsInteractive(sel) {
  return /(^|[\s,>+~(])(a|button|input|select|textarea|summary)\b|\.(btn|button|cta|link|tab|chip|control)/i.test(sel);
}
const HEADING_SEL = /(^|[\s,>+~(])h[1-6]\b|__title|__display|__headline|hero__(title|display|headline|h\d)|wordmark|masthead|display/i;
const GENERIC_FAMILIES = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-monospace', 'ui-serif', 'ui-sans-serif', 'ui-rounded', 'math', 'emoji', 'fangsong', 'inherit', 'initial', 'unset']);
function mergedDeclsBySelector(ctx) {
  if (ctx._merged) return ctx._merged;
  const map = new Map();
  for (const r of ctx.rules) {
    if (r.keyframes || r.selector === '@font-face' || r.tailwindConfig) continue;
    const key = r.selector + '@@' + (r.media || '');
    if (!map.has(key)) map.set(key, { selector: r.selector, media: r.media, decls: [], file: r.file, line: r.line });
    map.get(key).decls.push(...r.decls);
  }
  ctx._merged = [...map.values()];
  return ctx._merged;
}
function styleIndex(ctx) {
  if (ctx._styleIdx) return ctx._styleIdx;
  const entries = [];
  for (const r of ctx.rules) {
    if (r.keyframes || r.selector === '@font-face' || r.tailwindConfig) continue;
    if (r.media && /max-width/i.test(r.media)) continue;
    for (const part of r.selector.split(',')) {
      const compound = part.trim().split(/[\s>+~]+/).filter(Boolean).pop();
      if (!compound) continue;
      const cleaned = compound.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').replace(/\[[^\]]*\]/g, '');
      const classes = (cleaned.match(/\.[a-zA-Z_][\w-]*/g) || []).map((c) => c.slice(1));
      const tagM = /^([a-zA-Z][\w-]*)/.exec(cleaned);
      const tag = tagM ? tagM[1].toLowerCase() : null;
      if (!classes.length && !tag) continue;
      entries.push({ classes, tag, decls: r.decls, state: /:(hover|active|focus|focus-visible|focus-within|disabled|checked|visited|target)\b|::?(before|after|marker|placeholder|selection|backdrop)\b/i.test(compound) });
    }
  }
  ctx._styleIdx = entries;
  return entries;
}
function styleFor(ctx, classAttr, tagName, restingOnly = false) {
  const have = new Set(String(classAttr || '').split(/\s+/).filter(Boolean));
  const decls = [];
  for (const e of styleIndex(ctx)) {
    if (restingOnly && e.state) continue;
    if (e.tag && e.tag !== tagName) continue;
    if (!e.classes.every((c) => have.has(c))) continue;
    decls.push(...e.decls);
  }
  return decls;
}
function declValue(ctx, decls, prop) {
  let v = null;
  for (const d of decls) if (d.prop === prop) v = d.value;
  return v == null ? null : resolveVars(v, ctx.tokens);
}
function fontPxOf(ctx, decls) {
  const v = declValue(ctx, decls, 'font-size');
  if (!v) return null;
  const clamped = /clamp\(\s*([^,]+),/.exec(v);
  return pxOf(clamped ? clamped[1].trim() : v);
}
function trackingEmOf(ctx, decls, fontPx) {
  const v = declValue(ctx, decls, 'letter-spacing');
  if (!v) return null;
  const m = /^(-?\d*\.?\d+)em$/.exec(v.trim());
  if (m) return parseFloat(m[1]);
  const px = pxOf(v);
  if (px == null || !fontPx) return null;
  return px / fontPx;
}
function baseSelector(sel) {
  return sel.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').replace(/\s+/g, ' ').trim();
}
function fontSizePxOf(r, ctx) {
  const fs = r.decls.find((d) => d.prop === 'font-size');
  if (fs) return pxOf(resolveVars(fs.value, ctx.tokens));
  const f = r.decls.find((d) => d.prop === 'font');
  if (!f) return null;
  const m = /(?:^|\s)(\d+(?:\.\d+)?(?:px|rem|em))(?:\/[\d.]+(?:px|rem|em)?)?\s/.exec(resolveVars(f.value, ctx.tokens) + ' ');
  return m ? pxOf(m[1]) : null;
}
const firstFile = (ctx) => ctx.cssFiles[0]?.file || ctx.docs[0]?.file || ctx.root;

// Page canvas colour by selector, then DESIGN.md (new; replaces upstream --color-paper reads).
function canvasColor(ctx) {
  if (ctx._canvas !== undefined) return ctx._canvas;
  let c = null;
  for (const r of ctx.rules) {
    if (!/^(html|body|:root)$/i.test(r.selector.trim())) continue;
    const d = r.decls.filter((x) => /^background(-color)?$/.test(x.prop)).pop();
    const p = d && parseColor(resolveVars(d.value, ctx.tokens).trim());
    if (p && p.alpha > 0.5) c = p;
  }
  if (!c && ctx.design) {
    const cols = designColors(ctx.design);
    const pick = cols.find((x) => /^(canvas|background|bg|paper|surface|neutral)$/i.test(x.key));
    c = pick ? pick.c : null;
  }
  ctx._canvas = c;
  return c;
}
const pageIsDark = (ctx) => { const c = canvasColor(ctx); return !!c && okOf(c).L < 0.4; };

// ---------------------------------------------------------------------------------------------
// Tailwind utility reading. Upstream TW_* constants + twParse .. tw54 L3310-L3765, cut to the
// fields these gates read.
// ---------------------------------------------------------------------------------------------
const TW_SIZE = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72, '8xl': 96, '9xl': 128 };
const TW_TRACK = { tighter: -0.05, tight: -0.025, normal: 0, wide: 0.025, wider: 0.05, widest: 0.1 };
const TW_HUE = { red: 25, orange: 47, amber: 70, yellow: 86, lime: 131, green: 150, emerald: 163, teal: 183, cyan: 215, sky: 237, blue: 260, indigo: 277, violet: 293, purple: 304, fuchsia: 322, pink: 354, rose: 16 };
const TW_COLOURS = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const TW_PAL = new RegExp(`^(?:bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|decoration|divide|from|via|to|fill|stroke|shadow|accent|caret|placeholder)-(?:${TW_COLOURS})-(?:50|[1-9]00|950)(?:\\/(?:\\d{1,3}|\\[[^\\]]*\\]))?$`);
const TW_SHADE = new RegExp(`^(${TW_COLOURS})-(?:50|[1-9]00|950)(?:\\/\\S*)?$`);
const TW_ACCENT = /^text-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:500|600|700)(?:\/\S*)?$/;
const TW_PURPLE = /^(?:purple|violet|fuchsia|indigo)$/;
const TW_BLUE = /^(?:blue|sky|cyan|indigo)$/;
const TW_PINK = /^(?:pink|rose)$/;
const TW_GREY = /^(?:slate|gray|zinc|neutral|stone)$/;
const TW_LOGO = /logo|brand|wordmark/i;
const TW_ROOT = { size: null, em: null, upper: false, caps: false, noLabel: false, code: false, eyeSkip: false, inOl: false, logo: false, logoSelf: false };
const TW_COLOR_LIT = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
const TW_PARSED = new Map();
function twParse(tok) {
  let p = TW_PARSED.get(tok);
  if (p) return p;
  const variants = [];
  let depth = 0, cur = '';
  for (const ch of tok) {
    if (ch === '[' || ch === '(') depth++;
    else if ((ch === ']' || ch === ')') && depth > 0) depth--;
    if (ch === ':' && depth === 0) { variants.push(cur); cur = ''; } else cur += ch;
  }
  let base = cur;
  if (base.startsWith('!')) base = base.slice(1);
  if (base.endsWith('!')) base = base.slice(0, -1);
  const neg = base.length > 1 && base.startsWith('-');
  if (neg) base = base.slice(1);
  p = { variants: variants.map((v) => v.replace(/^(?:group|peer)-/, '').replace(/\/[\w-]+$/, '')), base, neg };
  TW_PARSED.set(tok, p);
  return p;
}
const twValue = (tok, v) => resolveVars(v, tok).trim().replace(/^(-?)\./, '$10.');
function twSize(ctx, b) {
  const tok = ctx.tokens;
  let m = /^text-(xs|sm|base|lg|[2-9]?xl)(?:\/\S+)?$/.exec(b);
  if (m) return TW_SIZE[m[1]];
  m = /^text-(?:\[(?:length:)?([^\]]+)\]|\((?:length:)?(--[\w-]+)\))(?:\/\S+)?$/.exec(b);
  let v = m ? (m[1] ? m[1].replace(/_/g, ' ') : `var(${m[2]})`) : null;
  if (!m) {
    m = /^text-([a-z][\w-]*?)(?:\/\S+)?$/.exec(b);
    v = m && tok[`--text-${m[1]}`];
  }
  if (!v) return null;
  const r = twValue(tok, v);
  const cl = /^clamp\(\s*([^,]+),/.exec(r);
  return pxOf(cl ? twValue(tok, cl[1]) : r);
}
function twTrack(ctx, b, neg) {
  const tok = ctx.tokens;
  let m = /^tracking-(tighter|tight|normal|wide|wider|widest)$/.exec(b);
  let v = null;
  if (m) v = `${TW_TRACK[m[1]]}em`;
  else if ((m = /^tracking-(?:\[([^\]]+)\]|\((--[\w-]+)\))$/.exec(b))) v = m[1] ? m[1].replace(/_/g, ' ') : `var(${m[2]})`;
  else if ((m = /^tracking-([a-z][\w-]*)$/.exec(b)) && tok[`--tracking-${m[1]}`]) v = tok[`--tracking-${m[1]}`];
  if (v == null) return null;
  const r = twValue(tok, v);
  const e = /^(-?\d*\.?\d+)em$/.exec(r);
  const px = e ? null : pxOf(r);
  if (!e && px == null) return null;
  const out = e ? parseFloat(e[1]) : px;
  return e ? { em: neg ? -out : out } : { px: neg ? -out : out };
}
const twHue = (c) => {
  if (!c || c.alpha <= 0.05) return null;
  const ok = okOf(c);
  return ok.C > 0.04 ? ok.H : null;
};
function twStop(ctx, v, tok) {
  if (/^\[?-?\d*\.?\d+%\]?$/.test(v)) return null;
  const tokens = ctx.tokens;
  const pm = TW_SHADE.exec(v);
  if (pm) return { tok, kind: 'palette', pal: pm[1], hue: TW_GREY.test(pm[1]) ? null : TW_HUE[pm[1]] };
  if (/^(?:white|black|transparent|current|inherit)(?:\/\S*)?$/.test(v)) return { tok, kind: 'plain', hue: null };
  if (v.startsWith('(')) { const c = parseColor(twValue(tokens, `var${v.replace(/\/\S*$/, '').replace(/^\((?:color:)?/, '(')}`)); return { tok, kind: 'token', hue: twHue(c), color: c }; }
  if (v.startsWith('[')) {
    const inner = v.slice(1, v.lastIndexOf(']')).replace(/_/g, ' ');
    const c = parseColor(twValue(tokens, inner));
    return { tok, kind: /var\(/.test(inner) ? 'token' : 'literal', hue: twHue(c), color: c };
  }
  const tv = tokens[`--color-${v.replace(/\/\S*$/, '')}`];
  const c = tv ? parseColor(twValue(tokens, tv)) : null;
  return { tok, kind: 'token', hue: c ? twHue(c) : null, color: c };
}
function twFamily(v) {
  if (/var\(/.test(v)) return null;
  const named = v.replace(/^family-name:/, '');
  if (named === v && !/^['"]/.test(v) && /^(?:\d|weight:|number:)/.test(v)) return null;
  const fam = firstFamily(named.replace(/_/g, ' '));
  return !fam || GENERIC_FAMILIES.has(fam) ? null : fam;
}
function twLiterals(b, tok, f) {
  for (const m of b.matchAll(/\[([^\]]+)\]/g)) {
    const v = m[1].replace(/url\([^)]*\)/gi, ' ').replace(/_/g, ' ');
    const fam = /^font-family:(.+)$/.exec(v);
    if (fam && !/var\(/.test(fam[1]) && !GENERIC_FAMILIES.has(firstFamily(fam[1]))) f.font = f.font || tok;
    for (const c of v.matchAll(TW_COLOR_LIT)) {
      const col = parseColor(c[0]);
      if (col && col.alpha > 0) f.colours.push({ tok, lit: c[0], col });
    }
  }
}
function twInfo(ctx, toks, tw) {
  const f = {
    upper: false, normalCase: false, caps: false, size: null, em: null, mono: false, accent: null,
    tAll: null, bounce: null, overshoot: null, grad: false, stops: [], clip: false, clear: false,
    oxHidden: null, oxClip: false, colours: [], font: null, pal: [], animate: null, transform: false,
    transition: false, softT: null, outlineNone: false,
  };
  let sizeV = null;
  const tracks = [];
  for (const tok of toks) {
    if (tok.includes('__')) continue;
    const p = twParse(tok);
    const b = p.base;
    if (!b) continue;
    const plain = !p.variants.length;
    for (const v of p.variants) tw.variants.add(v);
    if (TW_PAL.test(b)) f.pal.push(b.replace(/\/.*$/, ''));
    if (b.includes('[')) twLiterals(b, tok, f);
    if (b === 'uppercase') { f.upper = true; continue; }
    if (b === 'normal-case') { if (plain) f.normalCase = true; continue; }
    if (b === 'small-caps' || /^\[font-variant(?:-caps)?:[^\]]*(?:small|petite)-caps/.test(b)) { f.caps = true; continue; }
    if (b.startsWith('text-')) {
      const px = twSize(ctx, b);
      if (px != null) {
        if (plain) f.size = px; else sizeV = sizeV == null ? px : Math.min(sizeV, px);
        continue;
      }
      if (b === 'text-transparent') { f.clear = true; continue; }
      if (TW_ACCENT.test(b)) f.accent = f.accent || tok;
      continue;
    }
    if (b.startsWith('tracking-')) {
      const r = twTrack(ctx, b, p.neg);
      if (r) tracks.push({ r, plain });
      continue;
    }
    if (b === 'font-mono') { f.mono = true; continue; }
    if (b.startsWith('font-')) {
      const arb = /^font-\[(.+)\]$/.exec(b);
      const fam = arb ? twFamily(arb[1]) : null;
      if (fam) { f.font = f.font || tok; if (MONO_FAMILY.test(fam)) f.mono = true; }
      const named = !arb && /^font-([a-z][\w-]*)$/.exec(b);
      const tv = named && ctx.tokens[`--font-${named[1]}`];
      if (tv && MONO_FAMILY.test(firstFamily(resolveVars(tv, ctx.tokens)))) f.mono = true;
      continue;
    }
    if (b === 'transition-all' || /^transition-\[[^\]]*\b(?:all|width|height|top|left|right|bottom|inset)\b/.test(b) || /^\[transition(?:-property)?:[^\]]*\b(?:all|width|height|top|left)\b/.test(b)) {
      f.tAll = f.tAll || tok; f.transition = true;
      continue;
    }
    if (/^transition-\[[^\]]*\b(?:margin|padding)/.test(b)) { f.softT = f.softT || tok; f.transition = true; continue; }
    if (/^transition(?:-transform)?$/.test(b)) { f.transition = true; if (b !== 'transition') f.transform = true; continue; }
    if (b.startsWith('animate-')) {
      if (b !== 'animate-none') f.animate = f.animate || tok;
      if (b === 'animate-bounce') f.bounce = f.bounce || tok;
      continue;
    }
    const ez = /^ease-\[cubic-bezier\(([^)]*)\)\]$/.exec(b);
    if (ez) {
      const n = ez[1].split(/[,_\s]+/).filter(Boolean).map(Number);
      if (n.length === 4 && [n[1], n[3]].some((y) => y > 1.05 || y < -0.05)) f.overshoot = f.overshoot || tok;
      continue;
    }
    if (/^(?:scale|translate|rotate|skew)-/.test(b)) { f.transform = true; continue; }
    if (/^bg-(?:gradient-to-|linear-|radial|conic)|^bg-\[(?:repeating-)?(?:linear|radial|conic)-gradient/.test(b) || /^\[background(?:-image)?:[^\]]*gradient\(/.test(b)) f.grad = true;
    const st = /^(?:from|via|to)-(.+)$/.exec(b);
    if (st) { const s = twStop(ctx, st[1], tok); if (s) f.stops.push(s); continue; }
    if (b === 'bg-clip-text' || /^\[(?:-webkit-)?background-clip:text\]$/.test(b)) { f.clip = true; continue; }
    if (b === '[-webkit-text-fill-color:transparent]') { f.clear = true; continue; }
    if (b === 'overflow-x-hidden') { f.oxHidden = f.oxHidden || tok; continue; }
    if (b === 'overflow-x-clip' || b === 'overflow-clip') { f.oxClip = true; continue; }
    if (/^(?:outline-none|outline-hidden)$/.test(b) && p.variants.some((v) => /^focus/.test(v))) f.outlineNone = true;
  }
  if (f.size == null) f.size = sizeV;
  let emV = null;
  for (const { r, plain } of tracks) {
    const em = r.em != null ? r.em : r.px / (f.size || 16);
    if (plain) f.em = em; else emV = emV == null ? em : Math.max(emV, em);
  }
  if (f.em == null) f.em = emV;
  return f;
}
const TW_CLASS_ATTR = /(?:^|\s)(class|className|:class|v-bind:class|x-bind:class|class:list)\s*=\s*/g;
function twInterp(val) {
  const parts = [];
  let i = 0, seg = '', after = false;
  while (i < val.length) {
    if (val[i] === '{') {
      parts.push(cutGlued(seg, after, true));
      const e = braceEnd(val, i);
      parts.push(clsLits(val.slice(i + 1, e)).join(' '));
      i = e + 1; seg = ''; after = true;
      continue;
    }
    seg += val[i++];
  }
  parts.push(cutGlued(seg, after, false));
  return parts.join(' ').split(/\s+/).filter(Boolean);
}
function twTokensOf(doc, t) {
  if (doc.classAt) return doc.classAt.get(t.pos) || [];
  const tag = (doc.raw || doc.src).slice(t.pos, t.end);
  if (!tag.includes('class')) return [];
  const out = [];
  for (const m of tag.matchAll(TW_CLASS_ATTR)) {
    const i = m.index + m[0].length;
    const q = tag[i];
    let val, dyn = m[1] !== 'class' && m[1] !== 'className';
    if (q === '"' || q === "'") { const e = tag.indexOf(q, i + 1); val = tag.slice(i + 1, e < 0 ? tag.length : e); }
    else if (q === '{') { val = tag.slice(i + 1, braceEnd(tag, i)); dyn = true; }
    else val = (/^[^\s>]*/.exec(tag.slice(i)) || [''])[0];
    if (dyn) out.push(...clsLits(val));
    else if (val.includes('{')) out.push(...twInterp(val));
    else out.push(...val.split(/\s+/));
  }
  for (const d of tag.matchAll(/(?:^|\s)class:(?!list\b)([\w-]+)/g)) out.push(d[1]);
  return out.filter(Boolean);
}
const EYEBROW_ANCESTOR_SKIP = /^(form|fieldset|table|thead|tbody|nav|menu|dl|select|figcaption|label|button)$/;
function twFrame(parent, t, f, toks) {
  const logo = toks.some((x) => TW_LOGO.test(x)) || TW_LOGO.test(getAttr(t.attrs, 'aria-label') || '');
  return {
    size: f && f.size != null ? f.size : parent.size,
    em: f && f.em != null ? f.em : parent.em,
    upper: f ? f.upper || (!f.normalCase && parent.upper) : parent.upper,
    caps: (f && f.caps) || parent.caps,
    noLabel: parent.noLabel || /^(?:svg|pre|code|abbr|kbd|samp)$/.test(t.name),
    code: parent.code || /^(?:pre|code|kbd|samp)$/.test(t.name),
    eyeSkip: parent.eyeSkip || EYEBROW_ANCESTOR_SKIP.test(t.name),
    inOl: parent.inOl || t.name === 'ol',
    logo: parent.logo || (t.name === 'a' && logo),
    logoSelf: logo,
  };
}
function twGroup(ctx) {
  if (ctx._tw) return ctx._tw;
  const tw = { items: [], variants: new Set(), motion: null, upperDisplay: false };
  ctx._tw = tw;
  const add = (it) => {
    const f = it.info;
    tw.items.push(it);
    if (!tw.motion && (f.animate || (f.transition && f.transform))) tw.motion = it;
    if (/^h[12]$/.test(it.name) && f.upper) tw.upperDisplay = true;
  };
  for (const doc of ctx.docs) {
    const stack = [];
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close) { stack.pop(); continue; }
      const parent = stack.length ? stack[stack.length - 1] : TW_ROOT;
      const toks = twTokensOf(doc, t);
      const info = toks.length ? twInfo(ctx, toks, tw) : null;
      const frame = twFrame(parent, t, info, toks);
      if (info) add({ doc, idx: i, name: t.name, attrs: t.attrs, line: t.line, toks, info, frame });
      if (!t.selfClosing) stack.push(frame);
    }
    for (let c = 0; c < doc.comps.length; c++) {
      const t = doc.comps[c];
      if (t.close) continue;
      const toks = twTokensOf(doc, t);
      if (!toks.length) continue;
      const info = twInfo(ctx, toks, tw);
      add({ doc, idx: -1, comp: c, name: t.name, attrs: t.attrs, line: t.line, toks, info, frame: twFrame(TW_ROOT, t, info, toks) });
    }
    for (const v of doc.virtuals || []) {
      const info = twInfo(ctx, v.toks, tw);
      add({ doc, idx: -1, virtual: true, name: v.name, attrs: '', line: doc.lineOf(v.pos), toks: v.toks, info, frame: twFrame(TW_ROOT, { name: v.name, attrs: '' }, info, v.toks) });
    }
  }
  return tw;
}
function twWhere(it) {
  return it.virtual ? `${it.name}() class string` : `<${it.name} class="${trunc(it.toks.join(' '), 32)}">`;
}
function compInner(doc, c) {
  const open = doc.comps[c];
  if (open.selfClosing) return '';
  let depth = 1;
  for (let i = c + 1; i < doc.comps.length; i++) {
    const t = doc.comps[i];
    if (t.name !== open.name || t.selfClosing) continue;
    if (!t.close) depth++;
    else if (--depth === 0) return doc.src.slice(open.end, t.pos);
  }
  return '';
}
function twPlain(doc, html) {
  let s = html;
  if (doc.kind !== 'html' && doc.kind !== 'jsx') for (let k = 0; k < 3 && /\{[^{}]*\}/.test(s); k++) s = s.replace(/\{[^{}]*\}/g, ' ');
  return plainText(s);
}
function twText(it) {
  if (it.text == null) {
    let inner = '';
    if (it.idx >= 0) inner = innerOf(it.doc, it.idx)?.inner || '';
    else if (it.comp != null) inner = compInner(it.doc, it.comp);
    it.text = twPlain(it.doc, inner);
  }
  return it.text;
}
function twGradient(ctx, f) {
  if (!f.stops.length || (!f.grad && f.stops.length < 2)) return null;
  const names = f.stops.filter((s) => s.pal).map((s) => s.pal);
  let banned = null;
  for (const a of names) {
    if (!TW_PURPLE.test(a)) continue;
    if (names.some((x) => x !== a && TW_BLUE.test(x))) { banned = 'purple-to-blue'; break; }
    if (names.some((x) => x !== a && TW_PINK.test(x))) { banned = 'purple-to-pink'; break; }
  }
  if (!banned) banned = bannedGradient(f.stops.map((s) => s.hue).filter((h) => h != null), ctx);
  const colors = f.stops.every((s) => s.color) ? f.stops.map((s) => s.color) : [];
  return { banned, text: f.clip && f.clear, list: f.stops.map((s) => s.tok).join(' '), colors };
}
function twDataText(s) {
  const t = s.trim();
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  const digits = (t.match(/\d/g) || []).length;
  if (digits >= letters) return true;
  if (/^v?\d+(?:\.\d+)+/.test(t) || /[⌘⌥⇧⌃⎋↵]|^(?:ctrl|cmd|alt|shift|option)\s*[+-]/i.test(t)) return true;
  if (/[{}();=<>]|^\$\s|^(?:npm|npx|pnpm|yarn|bun|git|curl|cd|ls|brew|pip|docker|node) |^--?[a-z]|[\w-]+\.[a-z][a-z0-9]{0,3}$|^[#.]?[a-z]+(?:[-_][a-z0-9]+)+$|^[a-z]+[A-Z]\w*$|^\/[\w/.-]*$|^https?:/.test(t)) return true;
  return digits > 0 && /^(?:\d{1,2}:\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d)/i.test(t);
}

// ---------------------------------------------------------------------------------------------
// Gates. Each function reads ctx and calls ctx.report(gate, grade, file, line, message, fix, data).
// ---------------------------------------------------------------------------------------------

// Gate 1. Upstream check1 L1101-L1122; display tokens found by role words, not fixed names.
const DEFAULT_FACES = ['inter', 'roboto', 'open sans', 'poppins', 'lato', 'system-ui', '-apple-system', 'blinkmacsystemfont', 'arial', 'helvetica', 'helvetica neue', 'segoe ui'];
const DISPLAY_TOKEN = /^--(?:[\w-]*-)?(?:font|family|ff|typeface)[\w-]*-(?:display|heading|headline|title|hero)\b|^--(?:display|heading|headline|title|hero)[\w-]*-(?:font|family|face)\b/i;
function gate1(ctx) {
  const seen = new Set();
  const flag = (fam, file, line, where) => {
    if (DEFAULT_FACES.some((b) => famKey(b) === famKey(fam)) && !seen.has(fam + where)) {
      seen.add(fam + where);
      ctx.report('1', 'FAIL', file, line, `display font "${fam}" (${where})`, 'Use the display face DESIGN.md names', { family: fam });
    }
  };
  for (const r of ctx.rules) {
    if (!isTokenRule(r)) continue;
    for (const d of r.decls) if (DISPLAY_TOKEN.test(d.prop)) flag(firstFamily(resolveVars(d.value, ctx.tokens)), r.file, d.line, d.prop);
  }
  for (const r of ctx.rules) {
    if (isTokenRule(r) || r.keyframes || !HEADING_SEL.test(r.selector)) continue;
    for (const d of r.decls) if (d.prop === 'font-family') flag(firstFamily(resolveVars(d.value, ctx.tokens)), r.file, d.line, r.selector);
  }
}

// Gates 2a / 2b. Upstream gradientHues .. check2 L1124-L1195 and twGradient.
const hueIn = (h, lo, hi) => (lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi);
function gradientStops(value, ctx) {
  const resolved = resolveVars(value, ctx.tokens);
  const out = [];
  for (const cm of resolved.matchAll(COLOR_RE)) {
    const c = parseColor(cm[0]);
    if (c && c.alpha > 0.05) out.push(c);
  }
  return out;
}
function bannedGradient(hues, ctx) {
  const purple = hues.some((h) => hueIn(h, 265, 330));
  const blue = hues.some((h) => hueIn(h, 200, 264));
  const pink = hues.some((h) => hueIn(h, 331, 25));
  const cyan = hues.some((h) => hueIn(h, 170, 230));
  if (purple && blue) return 'purple-to-blue';
  if (purple && pink) return 'purple-to-pink';
  if (cyan && pageIsDark(ctx)) return 'cyan-on-dark';
  return null;
}
const chromaticHues = (stops) => stops.map(okOf).filter((o) => o.C > 0.04).map((o) => o.H);
function withoutPatterns(value) {
  let out = '', i = 0;
  const re = /repeating-(?:linear|radial|conic)-gradient\(/gi;
  let m;
  while ((m = re.exec(value))) {
    out += value.slice(i, m.index);
    let depth = 1, k = m.index + m[0].length;
    while (k < value.length && depth > 0) { if (value[k] === '(') depth++; else if (value[k] === ')') depth--; k++; }
    i = k; re.lastIndex = k;
  }
  return out + value.slice(i);
}
function gate2(ctx) {
  const textSel = new Set();
  for (const r of mergedDeclsBySelector(ctx)) {
    const clip = r.decls.find((d) => /background-clip/.test(d.prop) && /\btext\b/i.test(d.value));
    if (!clip) continue;
    const grad = r.decls.find((d) => /^background(-image)?$/.test(d.prop) && /gradient\(/i.test(d.value));
    const transparent = r.decls.find((d) => (d.prop === 'color' || d.prop === '-webkit-text-fill-color') && /transparent/i.test(d.value));
    if (!grad && !transparent) continue;
    textSel.add(r.selector);
    const stops = grad ? gradientStops(grad.value, ctx) : [];
    const banned = grad ? bannedGradient(chromaticHues(stops), ctx) : null;
    if (banned) ctx.report('2a', 'FAIL', r.file, clip.line, `${banned} gradient text on ${r.selector}`, 'One anchor hue, solid ink', { stops });
    else ctx.report('2b', 'FAIL', r.file, clip.line, `gradient text on ${r.selector}`, 'Solid ink; emphasis from weight, size or the display face');
  }
  for (const r of ctx.rules) {
    if (textSel.has(r.selector) || r.tailwindConfig) continue;
    for (const d of r.decls) {
      if (!/gradient\(/i.test(d.value)) continue;
      const washes = withoutPatterns(d.value);
      if (!/gradient\(/i.test(washes)) continue;
      const stops = gradientStops(washes, ctx);
      const banned = bannedGradient(chromaticHues(stops), ctx);
      if (banned) ctx.report('2a', 'FAIL', r.file, d.line, `${banned} gradient on ${r.selector}`, 'One anchor hue; drop the gradient', { stops });
    }
  }
  for (const it of twGroup(ctx).items) {
    const g = twGradient(ctx, it.info);
    if (!g) continue;
    if (g.banned) ctx.report('2a', 'FAIL', it.doc.file, it.line, `${g.banned} gradient${g.text ? ' text' : ''} (${g.list}) on ${twWhere(it)}`, 'One anchor hue, solid ink', { stops: g.colors });
    else if (g.text) ctx.report('2b', 'FAIL', it.doc.file, it.line, `gradient text (${g.list}) on ${twWhere(it)}`, 'Solid ink; emphasis from weight, size or the display face');
  }
}

// Gate 4. Upstream check4 L1227-L1249.
function gate4(ctx) {
  const cardWord = /(^|-)card(--[\w-]+)?$/i;
  const containerish = /(grid|list|rail|row|wrap|deck|group|stack|container|section|scroller|track)/i;
  for (const doc of ctx.docs) {
    const stack = [];
    for (const t of doc.tags) {
      if (t.close) {
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === t.name) { stack.splice(i); break; }
        continue;
      }
      if (t.selfClosing) continue;
      const cls = getAttr(t.attrs, 'class') || '';
      const isCard = cls.split(/\s+/).some((c) => { const base = c.split('--')[0]; return base && cardWord.test(base) && !containerish.test(base); });
      if (isCard && stack.some((s) => s.isCard)) ctx.report('4', 'FAIL', doc.file, t.line, `card nested in card: class="${trunc(cls, 40)}"`, 'Keep one containment layer');
      stack.push({ name: t.name, isCard });
    }
  }
}

// Gate 7a. Upstream check7 L1293-L1312 (7a half); token layer by selector; inline style added.
const PURE_PROPS = /^(color|background|background-color|border|border-[a-z-]*color|outline|outline-color|fill|stroke|box-shadow|text-decoration-color|caret-color|--[\w-]+)$/;
function pureOf(lit) {
  const c = parseColor(lit);
  if (!c || c.alpha < 1) return null;
  if (c.r > 0.999 && c.g > 0.999 && c.b > 0.999) return '#fff';
  if (c.r < 0.001 && c.g < 0.001 && c.b < 0.001) return '#000';
  return null;
}
const PURE_LIT = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)|(?<![\w-])(?:white|black)(?![\w-])/gi;
function gate7a(ctx) {
  for (const r of ctx.rules) {
    if (r.selector === '@font-face' || r.keyframes || isTokenRule(r)) continue;
    for (const d of r.decls) {
      if (!PURE_PROPS.test(d.prop)) continue;
      for (const m of d.value.matchAll(PURE_LIT)) {
        const pure = pureOf(m[0]);
        if (pure) { ctx.report('7a', 'FAIL', r.file, d.line, `pure ${pure} literal: ${d.prop}: ${trunc(d.value, 28)} (${r.selector})`, 'Reference a token; tint toward the anchor hue unless DESIGN.md declares pure white or black'); break; }
      }
    }
  }
  for (const doc of ctx.docs) {
    for (const m of doc.src.matchAll(/style\s*=\s*"([^"]*)"/gi)) {
      for (const decl of m[1].split(';')) {
        const [prop, ...rest] = decl.split(':');
        if (!prop || !PURE_PROPS.test(prop.trim().toLowerCase())) continue;
        const v = rest.join(':');
        const lit = [...v.matchAll(PURE_LIT)].map((x) => x[0]).find(pureOf);
        if (lit) { ctx.report('7a', 'FAIL', doc.file, doc.lineOf(m.index), `pure ${pureOf(lit)} in an inline style`, 'Reference a token'); break; }
      }
    }
  }
}

// Gates 10a / 10b. Upstream check10 L1314-L1325 and check10Motion L1377-L1406.
function gate10(ctx) {
  const hardRe = /(?<![\w-])(width|height|top|left|right|bottom|inset(?:-[a-z-]+)?|flex-basis|grid-template-columns)(?![\w-])/;
  const softRe = /(?<![\w-])(margin(?:-[a-z]+)?|padding(?:-[a-z]+)?)(?![\w-])/;
  const a11ySel = /skip|sr-only|visually-hidden/i;
  for (const r of ctx.rules) {
    if (r.tailwindConfig) continue;
    for (const d of r.decls) {
      if (d.prop === 'transition' && /(^|,)\s*all[\s,]|^all$|^all\s/.test(d.value.trim())) ctx.report('10a', 'FAIL', r.file, d.line, `transition: all on ${r.selector}`, 'Name the transitioned properties');
      else if (d.prop === 'transition-property' && /\ball\b/.test(d.value)) ctx.report('10a', 'FAIL', r.file, d.line, `transition-property: all on ${r.selector}`, 'Name the transitioned properties');
    }
    if (a11ySel.test(r.selector)) continue;
    if (r.keyframes) {
      for (const d of r.decls) {
        if (/^(min|max)-/.test(d.prop)) continue;
        if (hardRe.test(d.prop)) ctx.report('10a', 'FAIL', r.file, d.line, `@keyframes ${r.keyframes} animates ${d.prop}`, 'Animate transform or opacity');
        else if (softRe.test(d.prop)) ctx.report('10b', 'FAIL', r.file, d.line, `@keyframes ${r.keyframes} animates ${d.prop}`, 'Animate transform');
      }
      continue;
    }
    for (const d of r.decls) {
      if (d.prop !== 'transition' && d.prop !== 'transition-property') continue;
      const hard = hardRe.exec(d.value);
      const soft = softRe.exec(d.value);
      if (hard) ctx.report('10a', 'FAIL', r.file, d.line, `transitioning ${hard[1]} on ${r.selector}`, 'Animate transform or opacity');
      else if (soft) ctx.report('10b', 'FAIL', r.file, d.line, `transitioning ${soft[1]} on ${r.selector}`, 'Animate transform');
    }
  }
  for (const it of twGroup(ctx).items) {
    if (it.info.tAll) ctx.report('10a', 'FAIL', it.doc.file, it.line, `${it.info.tAll} on ${twWhere(it)}`, 'transition-colors, transition-opacity or transition-transform');
    if (it.info.softT) ctx.report('10b', 'FAIL', it.doc.file, it.line, `${it.info.softT} on ${twWhere(it)}`, 'Animate transform');
  }
}

// Gate 12. Upstream check12 L1354-L1375 (spring-posture carve-out dropped) and Tailwind bounce.
function gate12(ctx) {
  const uiSel = /:hover|:active|:focus|\b(btn|button|modal|dialog|tooltip|dropdown|menu|popover|toast|tab|input|select|switch|toggle|accordion)\b/i;
  for (const r of ctx.rules) {
    if (!uiSel.test(r.selector)) continue;
    for (const d of r.decls) {
      if (!/transition|animation/.test(d.prop)) continue;
      for (const m of resolveVars(d.value, ctx.tokens).matchAll(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/g)) {
        const y1 = parseFloat(m[2]), y2 = parseFloat(m[4]);
        if (y1 > 1.05 || y2 > 1.05 || y1 < -0.05 || y2 < -0.05) ctx.report('12', 'FAIL', r.file, d.line, `overshoot easing ${m[0]} on ${r.selector}`, 'Exponential ease-out on UI state');
      }
    }
  }
  for (const it of twGroup(ctx).items) {
    const f = it.info;
    if (f.bounce || f.overshoot) ctx.report('12', 'FAIL', it.doc.file, it.line, `${f.bounce ? 'bounce' : 'overshoot easing'} ${f.bounce || f.overshoot} on ${twWhere(it)}`, 'Exponential ease-out; no bounce or overshoot');
  }
}

// Gate 15. Upstream check15 L1408-L1418.
function gate15(ctx) {
  for (const r of ctx.rules) {
    if (!/:focus(-visible|-within)?\b/.test(r.selector)) continue;
    const withinOnly = !/:focus(-visible)?(?![\w-])/.test(r.selector);
    for (const d of r.decls) {
      if (/^transition(-property)?$/.test(d.prop) && (withinOnly ? /outline|box-shadow|\ball\b/ : /outline|box-shadow|opacity|\ball\b/).test(d.value)) {
        ctx.report('15', 'FAIL', r.file, d.line, `focus ring transition on ${r.selector}`, 'Remove the transition; the ring appears at once');
      }
    }
  }
}

// Gate 19. Upstream check19 L1443-L1458 and checkCopyTell L2375-L2390. Dashes count only
// between Latin words, so CJK copy with 破折号 passes. Stock second actions added (upstream 42).
const BUZZ19 = /\b(seamless(ly)?|robust|empower(s|ing)?|supercharge[sd]?|best[- ]in[- ]class|industry[- ]leading|mission[- ]critical|future[- ]proof(ed)?|unleash(es|ed|ing)?|elevate[sd]?|effortless(ly)?|unlock(s|ing)?|next[- ]generation|world[- ]class|cutting[- ]edge|streamline[sd]?|revolutioni[sz]e[sd]?|game[- ]chang(er|ing)|enterprise[- ]grade|quietly (trusted|in use)|built for the modern|in today's)\b/gi;
const STOCK_ACTION = /^(learn more|get started|book a demo|see how it works|watch (the )?demo|request a demo)$/i;
function gate19(ctx) {
  for (const doc of ctx.docs) {
    const prose = maskedProse(doc);
    const title = (/<title\b[^>]*>([^<]*)<\/title>/i.exec(doc.src) || [])[1] || '';
    const patterns = [[/\b(jane doe|john smith|john doe|example user)\b/i, 'placeholder name'], [/\bAcme\b/, 'stock company name'], [/\bNexus\b/, 'stock company name']];
    for (const [re, label] of patterns) {
      const m = re.exec(prose);
      if (!m) continue;
      if (label === 'stock company name' && (re.test(title) && (prose.match(new RegExp(re.source, 'g')) || []).length >= 3)) continue;
      ctx.report('19', 'FAIL', doc.file, doc.lineOf(m.index), `${label}: "${m[0]}"`, 'Use the real names, or a marked slot');
    }
    const dash = /[A-Za-z]\s?[\u2014\u2013]\s?[A-Za-z]|[A-Za-z]\s--\s[A-Za-z]/.exec(prose);
    if (dash) ctx.report('19', 'FAIL', doc.file, doc.lineOf(dash.index), `dash "${dash[0].trim()}" in copy`, 'A comma, a colon, a full stop or parentheses');
    const seen = new Set();
    for (const buzz of prose.matchAll(BUZZ19)) {
      const word = buzz[0].toLowerCase();
      if (seen.has(word)) continue;
      seen.add(word);
      ctx.report('19', 'FAIL', doc.file, doc.lineOf(buzz.index), `buzzword "${buzz[0]}"`, 'Say what the product does, in its own nouns');
    }
    const cadence = prose.match(/(^|[.!?]\s+)(not|no)\s+[a-z][^.!?\n]{0,40}[.]\s+(just|only|a|an)?\s*[a-z][^.!?\n]{0,40}[.]/gi) || [];
    if (cadence.length >= 3) ctx.report('19', 'FAIL', doc.file, doc.lineOf(Math.max(0, prose.indexOf(cadence[0].trim()))), `rebuttal cadence repeated ${cadence.length} times`, 'Once is voice; three times is a tic');
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing || !/^(a|button)$/.test(t.name)) continue;
      const inner = innerOf(doc, i);
      const label = inner ? plainText(inner.inner).replace(/[\u2192\u203a\u00bb>-]+$/, '').trim() : '';
      if (STOCK_ACTION.test(label)) ctx.report('19', 'FAIL', doc.file, t.line, `stock action label "${label}"`, 'Name the real next step with a verb from the product');
    }
  }
}

// Gates 26a / 26b. Upstream check26 L1607-L1626, plus outline removal without replacement.
function gate26(ctx) {
  const tw = twGroup(ctx);
  for (const r of ctx.rules) {
    if (!/:focus(-visible)?\b/.test(r.selector)) continue;
    const none = r.decls.find((d) => /^outline(-style)?$/.test(d.prop) && /^(none|0|0px)$/i.test(d.value.trim()));
    if (!none) continue;
    const replaced = r.decls.some((d) => /^(box-shadow|border(-[a-z-]+)?|outline-offset|background(-color)?|text-decoration)$/.test(d.prop) && !/^none$/i.test(d.value.trim()));
    const ringElsewhere = ctx.rules.some((o) => o !== r && /:focus-visible/.test(o.selector) && o.decls.some((d) => /^(outline|box-shadow)$/.test(d.prop) && !/^(none|0)$/i.test(d.value.trim())));
    if (!replaced && !ringElsewhere) ctx.report('26a', 'FAIL', r.file, none.line, `outline removed on ${r.selector} with nothing in its place`, 'Draw a ring at 3:1 or better');
  }
  for (const it of tw.items) {
    if (it.info.outlineNone && !it.toks.some((t) => /^focus(-visible)?:(ring|outline|shadow|border)/.test(t) && !/outline-(none|hidden)$/.test(t))) {
      ctx.report('26a', 'FAIL', it.doc.file, it.line, `focus outline removed on ${twWhere(it)} with nothing in its place`, 'focus-visible:outline-2 or a ring utility');
    }
  }
  if (ctx.scope === 'component') return;
  const hasInteractive = ctx.docs.some((doc) => /<(a|button|input|select|textarea)\b|role\s*=\s*["']button/i.test(doc.src)) || ctx.rules.some((r) => selectorIsInteractive(r.selector));
  if (!hasInteractive) return;
  const has = (pseudo) => ctx.rules.some((r) => r.selector.includes(pseudo));
  const file = firstFile(ctx);
  if (!has(':focus-visible') && !has(':focus') && ![...tw.variants].some((v) => /^focus(?:-visible|-within)?$/.test(v))) {
    ctx.report('26a', 'FAIL', file, 1, 'no :focus-visible styling anywhere', 'A focus ring at 3:1 or better, shown at once');
  }
  if (!has(':active') && !tw.variants.has('active')) ctx.report('26b', 'FAIL', file, 1, 'no :active styling anywhere', 'Style every state in design-system-core.md section 4');
  const formish = ctx.docs.some((doc) => /<(button|input|select|textarea)\b/i.test(doc.src));
  if (formish && !has(':disabled') && !tw.variants.has('disabled') && !tw.variants.has('aria-disabled') && !ctx.rules.some((r) => /\[disabled\]|aria-disabled/.test(r.selector))) {
    ctx.report('26b', 'FAIL', file, 1, 'form controls and no :disabled styling anywhere', 'Style the disabled state');
  }
}

// Gate 27. Upstream check27 L1628-L1651.
function gate27(ctx) {
  if (ctx.scope === 'component') return;
  const tw = twGroup(ctx);
  const moves = (r) => r.decls.some((d) => /^(transform|translate|scale|rotate)$/.test(d.prop) && !/^none\b/.test(d.value.trim()));
  const hasMotion = ctx.rules.some((r) => r.keyframes)
    || ctx.rules.some((r) => r.decls.some((d) => /^transition/.test(d.prop) && /transform/.test(d.value)))
    || (ctx.rules.some((r) => r.decls.some((d) => /^transition/.test(d.prop) && /(^|[\s,])all\b/.test(d.value))) && ctx.rules.some((r) => /:(hover|active|focus)/.test(r.selector) && moves(r)));
  if (!hasMotion && !tw.motion) return;
  const hasPRM = ctx.rules.some((r) => r.media && /prefers-reduced-motion/i.test(r.media))
    || /prefers-reduced-motion/i.test(ctx.allCss)
    || tw.variants.has('motion-reduce') || tw.variants.has('motion-safe');
  if (hasPRM) return;
  if (hasMotion) {
    const kf = ctx.rules.find((r) => r.keyframes);
    ctx.report('27', 'FAIL', kf ? kf.file : firstFile(ctx), kf ? kf.line : 1, 'motion present, no prefers-reduced-motion fallback', 'Add a prefers-reduced-motion: reduce block');
  } else {
    const m = tw.motion;
    ctx.report('27', 'FAIL', m.doc.file, m.line, `motion utilities (${m.info.animate || 'a transform transition'}) with no motion-reduce: or motion-safe: variant`, 'Add motion-reduce: fallbacks or gate the motion behind motion-safe:');
  }
}

// Gate 28a. Upstream check28 L1653-L1679 (28b dropped).
function gate28(ctx) {
  for (const doc of ctx.docs) {
    let firstMedia = true, seenH1 = false, heroPassed = false;
    for (const t of doc.tags) {
      if (t.close) { if (seenH1 && (t.name === 'section' || t.name === 'header')) heroPassed = true; continue; }
      if (t.name === 'h1') seenH1 = true;
      if (t.name === 'video') {
        if (hasAttr(t.attrs, 'autoplay') && !hasAttr(t.attrs, 'muted')) ctx.report('28a', 'FAIL', doc.file, t.line, 'autoplay video without muted', 'autoplay muted loop playsinline, with a poster');
        if ((getAttr(t.attrs, 'loading') || '').toLowerCase() === 'lazy' && firstMedia) ctx.report('28a', 'WARN', doc.file, t.line, 'lazy-loaded first video', 'Never lazy on the largest first-screen media');
        firstMedia = false;
      }
      if (t.name === 'img') {
        if (firstMedia && !heroPassed && (getAttr(t.attrs, 'loading') || '').toLowerCase() === 'lazy') ctx.report('28a', 'WARN', doc.file, t.line, 'lazy-loaded first image (likely the largest paint)', 'fetchpriority="high" and no lazy loading');
        firstMedia = false;
      }
    }
  }
}

// Gates 30a / 30b. Upstream check30 L1681-L1731 and checkComponentText L3846-L3861.
const EMOJI = /(?![©®™‼⁉←-⇿])\p{Extended_Pictographic}/u;
const GLYPH = /(?![©®™‼⁉←-⇿✓-✖])(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F)/u;
function gate30(ctx) {
  for (const doc of ctx.docs) {
    const lines = new Set();
    const flag = (line, what) => { if (lines.has(line)) return; lines.add(line); ctx.report('30a', 'FAIL', doc.file, line, what, 'One icon set, a custom SVG, or the word alone'); };
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing) continue;
      const cls = getAttr(t.attrs, 'class') || '';
      const iconish = /icon|card|step|tier|feature|value|prop|badge/i.test(cls);
      const inner = innerOf(doc, i);
      if (!inner) continue;
      const content = inner.inner.replace(/<[^>]*>/g, '').trim();
      if (content && content.length <= 4 && EMOJI.test(content) && (iconish || !/<[a-z]/.test(inner.inner))) {
        flag(t.line, `emoji icon "${content}" in <${t.name}${cls ? ` class="${trunc(cls, 28)}"` : ''}>`);
        continue;
      }
      if (!/^(h[1-6]|button|a|label|th|summary|option|legend|dt)$/.test(t.name) || /<(p|div|ul|ol|table|section)\b/i.test(inner.inner)) continue;
      const text = plainText(inner.inner);
      const at = inner.inner.search(GLYPH);
      if (!text || at < 0) continue;
      flag(doc.lineOf(t.end + at), `emoji in <${t.name}> "${trunc(text, 32)}"`);
    }
    for (let c = 0; c < doc.comps.length; c++) {
      const t = doc.comps[c];
      if (t.close || t.selfClosing) continue;
      const text = twPlain(doc, compInner(doc, c));
      if (text && text.length <= 4 && EMOJI.test(text)) flag(t.line, `emoji icon "${text}" in <${t.name}>`);
    }
  }
  const libs = new Map([
    ['material', /material-icons|material-symbols/i], ['heroicons', /heroicon/i], ['lucide', /lucide/i],
    ['phosphor', /phosphor-icons|@phosphor|\bph-(?:bold|fill|light|duotone)\b/i], ['font-awesome', /font-?awesome|\bfa-(solid|regular|brands|light)\b/i],
    ['feather', /feather-icons|react-feather/i], ['tabler', /tabler-icons|@tabler\/icons/i], ['bootstrap-icons', /bootstrap-icons|\bbi-[a-z]/i],
  ]);
  const hay = ctx.docs.map((d) => d.raw || d.src).join('\n') + ctx.cssFiles.map((f) => f.raw).join('\n');
  const found = [...libs].filter(([, re]) => re.test(hay)).map(([name]) => name);
  if (found.length >= 2) ctx.report('30b', 'FAIL', ctx.docs[0]?.file || firstFile(ctx), 1, `icon libraries mixed: ${found.join(' + ')}`, 'One icon library per page');
}

// Gate 33. Upstream check33 L1733-L1756.
function gate33(ctx) {
  const labeled = (a) => hasAttr(a, 'aria-hidden') || getAttr(a, 'aria-label') != null || getAttr(a, 'aria-labelledby') != null
    || ['img', 'presentation', 'none'].includes((getAttr(a, 'role') || '').toLowerCase());
  for (const doc of ctx.docs) {
    const stack = [];
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close) {
        for (let k = stack.length - 1; k >= 0; k--) if (stack[k].name === t.name) { stack.splice(k); break; }
        continue;
      }
      if (t.name === 'svg' || t.name === 'canvas') {
        const titled = t.name === 'svg' && !t.selfClosing && /<title\b[^>]*>\s*\S/i.test(innerOf(doc, i)?.inner || '');
        if (!labeled(t.attrs) && !stack.some((s) => s.labeled) && !titled) ctx.report('33', 'FAIL', doc.file, t.line, `<${t.name}> without aria-hidden or a label`, 'aria-hidden="true", or aria-label / <title>');
      }
      if (!t.selfClosing) stack.push({ name: t.name, labeled: labeled(t.attrs) });
    }
  }
}

// Gate 34. Upstream check34 L1758-L1795.
function gate34(ctx) {
  const clipped = new Set();
  let hidden = null;
  for (const r of ctx.rules) {
    if (!/(^|[\s,])(html|body)\b/.test(r.selector)) continue;
    const targets = r.selector.split(',').map((p) => (/^\s*(html|body)\s*$/.exec(p) || [])[1]).filter(Boolean);
    for (const d of r.decls) {
      if (d.prop !== 'overflow-x' && d.prop !== 'overflow') continue;
      if (/\bclip\b/.test(d.value)) for (const t of targets) clipped.add(t);
      else if (/\bhidden\b/.test(d.value) && targets.length) hidden = { file: r.file, line: d.line, sel: r.selector };
    }
  }
  const hiddenUtil = [];
  for (const it of twGroup(ctx).items) {
    if (it.idx < 0 || !/^(html|body)$/.test(it.name)) continue;
    if (it.info.oxClip) clipped.add(it.name);
    if (it.info.oxHidden) hiddenUtil.push(it);
  }
  for (const it of hiddenUtil) ctx.report('34', 'FAIL', it.doc.file, it.line, `${it.info.oxHidden} on <${it.name}> (breaks sticky)`, 'overflow-x-clip on html and body');
  const both = clipped.has('html') && clipped.has('body');
  const pageish = ctx.docs.some((d) => d.tags.some((t) => !t.close && (t.name === 'html' || t.name === 'body')));
  if (!both && hidden) ctx.report('34', 'FAIL', hidden.file, hidden.line, `overflow-x: hidden on ${hidden.sel} (breaks sticky)`, 'overflow-x: clip on html and body');
  else if (!both && pageish && !hiddenUtil.length) ctx.report('34', 'FAIL', firstFile(ctx), 1, clipped.size ? `overflow-x: clip on ${[...clipped][0]} only` : 'no overflow-x: clip on html and body', 'overflow-x: clip on html and body');
  for (const r of ctx.rules) {
    for (const d of r.decls) {
      if (/^(width|min-width)$/.test(d.prop) && /(^|[^\w.-])100vw\b/.test(d.value)) ctx.report('34', 'FAIL', r.file, d.line, `${d.prop}: ${trunc(d.value, 28)} on ${r.selector}`, 'width: 100%');
    }
  }
}

// Gate 37. Upstream check37 L1797-L1815.
function gate37(ctx) {
  const families = new Map();
  for (const r of ctx.rules) {
    if (r.selector === '@font-face') continue;
    for (const d of r.decls) {
      const tokenFont = d.prop.startsWith('--') && /font|family|typeface/i.test(d.prop);
      if (d.prop !== 'font-family' && !tokenFont) continue;
      if (tokenFont && !isTokenRule(r)) continue;
      const fam = firstFamily(resolveVars(d.value, ctx.tokens));
      if (!fam || GENERIC_FAMILIES.has(fam) || fam.startsWith('var(') || /^\d/.test(fam)) continue;
      if (![...families.keys()].some((k) => famKey(k) === famKey(fam))) families.set(fam, { file: r.file, line: d.line });
    }
  }
  if (families.size > 3) {
    const at = [...families.values()][3];
    ctx.report('37', 'FAIL', at.file, at.line, `${families.size} font families: ${trunc([...families.keys()].join(', '), 56)}`, 'Display, body and at most one outlier');
  }
}

// Gate 38i. Upstream check38a L1817-L1840 (38i half).
function gate38i(ctx) {
  const normSel = ctx.rules.filter((r) => /(^|[\s,>+~])(em|i)\b/.test(r.selector) && r.decls.some((d) => d.prop === 'font-style' && /normal/.test(d.value)))
    .flatMap((r) => r.selector.split(',').map((x) => x.trim()));
  const normalised = (level, classes) => normSel.some((sel) => /^(em|i)$/.test(sel) || new RegExp(`(^|[\\s,>+~])h${level}\\b`).test(sel) || classes.some((c) => sel.includes('.' + c)));
  for (const doc of ctx.docs) {
    for (const m of doc.src.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)) {
      const classes = ((/class\s*=\s*["']([^"']*)["']/i.exec(m[2]) || [])[1] || '').split(/\s+/).filter(Boolean);
      if (/<(em|i)\b/i.test(m[3]) && !normalised(m[1], classes)) ctx.report('38i', 'FAIL', doc.file, doc.lineOf(m.index), `<em>/<i> inside <h${m[1]}>`, 'Set the whole head one way, or break the line');
    }
  }
}

// Gate 39a. Upstream check39 L1842-L1888 (39b dropped).
function gate39(ctx) {
  const inputSel = /(^|[\s,>+~])(input|textarea|select)\b|__input|__field|\.(input|field)\b/;
  const hasInputs = ctx.docs.some((doc) => /<(input|textarea|select)\b/i.test(doc.src)) || ctx.rules.some((r) => inputSel.test(r.selector));
  if (!hasInputs) return;
  const widthOf = (v) => { const m = /(\d+(?:\.\d+)?)px/.exec(v); return m ? parseFloat(m[1]) : null; };
  let baseW = null;
  for (const r of ctx.rules) {
    if (!inputSel.test(r.selector) || /:hover|:focus|:active|:disabled|\[|:checked/.test(r.selector)) continue;
    for (const d of r.decls) if ((d.prop === 'border' || d.prop === 'border-width') && baseW == null) baseW = widthOf(d.value);
  }
  for (const r of ctx.rules) {
    if (!inputSel.test(r.selector) || !/:hover|:focus|\.is-error|\[aria-invalid/.test(r.selector)) continue;
    for (const d of r.decls) {
      if (d.prop !== 'border' && d.prop !== 'border-width') continue;
      const w = widthOf(d.value);
      if (w != null && baseW != null && w !== baseW) ctx.report('39a', 'FAIL', r.file, d.line, `border-width ${baseW}px -> ${w}px on ${r.selector} (layout shift)`, 'Keep the border constant; show state with outline');
    }
    if (/:focus/.test(r.selector) && r.decls.some((d) => /^border(-color)?$/.test(d.prop)) && !r.decls.some((d) => /^outline/.test(d.prop))) {
      ctx.report('39a', 'FAIL', r.file, r.line, `focus state drawn with border on ${r.selector}`, 'Focus ring via outline');
    }
  }
  for (const r of ctx.rules) {
    if (!/:disabled|\[disabled\]/.test(r.selector)) continue;
    if (r.decls.some((d) => d.prop === 'opacity') && !r.decls.some((d) => d.prop === 'cursor' && /not-allowed/.test(d.value))) {
      ctx.report('39a', 'FAIL', r.file, r.line, `disabled shown by opacity alone on ${r.selector}`, 'Opacity, cursor: not-allowed and the disabled attribute');
    }
  }
}

// Gates 47a / 47b. Upstream CHROME_47 + check47 L2041-L2063.
const CHROME_47 = [
  ['47a', /(browser|window|mac|osx)[-_]?(bar|chrome|dots|controls)|traffic[-_]?light|title[-_]?bar|window[-_]?(dots|buttons)|url[-_]?(bar|pill)/i],
  ['47b', /phone[-_]?(frame|mock(up)?)|device[-_]?frame|\bnotch\b|terminal[-_]?(chrome|frame|bar|dots|header)|(ide|editor)[-_]?(chrome|frame)|(browser|window)[-_]?frame|laptop[-_]?(frame|mock(up)?)/i],
];
function gate47(ctx) {
  for (const [gate, re] of CHROME_47) {
    for (const doc of ctx.docs) {
      for (const t of doc.tags) {
        if (t.close) continue;
        const cls = getAttr(t.attrs, 'class');
        const m = cls ? re.exec(cls) : null;
        if (m) { ctx.report(gate, 'FAIL', doc.file, t.line, `drawn chrome class "${m[0]}"`, gate === '47a' ? 'A real screenshot in a <figure>, or no chrome' : 'One frame at most, holding real content'); break; }
      }
    }
    for (const r of ctx.rules) {
      const m = re.exec(r.selector);
      if (m) { ctx.report(gate, 'FAIL', r.file, r.line, `drawn chrome selector ${trunc(r.selector, 40)}`, gate === '47a' ? 'A real screenshot in a <figure>, or no chrome' : 'One frame at most, holding real content'); break; }
    }
  }
}

// Gate 48. Upstream check48 L2065-L2115 plus Tailwind literals from checkTailwind.
function gate48(ctx) {
  const colorLit = /#[0-9a-fA-F]{3,8}\b|(?<![\w-])rgba?\(|(?<![\w-])hsla?\(|(?<![\w-])oklch\(/;
  for (const r of ctx.rules) {
    if (isTokenRule(r) || r.keyframes) continue;
    for (const d of r.decls) {
      if (d.prop === 'font-family') {
        if (!d.value.includes('var(') && !GENERIC_FAMILIES.has(firstFamily(d.value))) ctx.report('48', 'FAIL', r.file, d.line, `font-family literal "${trunc(d.value, 36)}" on ${r.selector}`, 'Move the family into the token layer');
        continue;
      }
      if (!colorLit.test(d.value)) continue;
      for (const m of d.value.matchAll(COLOR_RE)) {
        const c = parseColor(m[0]);
        if (!c || c.alpha === 0) continue;
        ctx.report('48', 'FAIL', r.file, d.line, `colour literal ${trunc(m[0], 30)} outside the token layer (${d.prop} on ${trunc(r.selector, 30)})`, 'Move the value into the token layer');
      }
    }
  }
  for (const doc of ctx.docs) {
    for (const m of doc.src.matchAll(/style\s*=\s*"([^"]*)"/gi)) {
      const lit = /#[0-9a-fA-F]{3,8}\b|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)/.exec(m[1]);
      if (lit && parseColor(lit[0])) ctx.report('48', 'FAIL', doc.file, doc.lineOf(m.index), `inline-style colour literal ${trunc(lit[0], 30)}`, 'Move the value into the token layer');
      const ff = /font-family\s*:\s*([^;]+)/i.exec(m[1]);
      if (ff && !ff[1].includes('var(') && !GENERIC_FAMILIES.has(firstFamily(ff[1]))) ctx.report('48', 'FAIL', doc.file, doc.lineOf(m.index), `inline-style font-family "${trunc(ff[1], 30)}"`, 'Move the family into the token layer');
    }
  }
  for (const it of twGroup(ctx).items) {
    const f = it.info;
    if (!f.colours.length && !f.font) continue;
    const what = [f.colours.length ? `colour literal ${f.colours[0].tok}` : null, f.font ? `font-family literal ${f.font}` : null].filter(Boolean).join(' and ');
    ctx.report('48', 'FAIL', it.doc.file, it.line, `${what} in a class on ${twWhere(it)}`, 'Add the value to the token layer (@theme or :root) and use its utility name');
  }
}

// Gate 50. Upstream check50 L2139-L2166 and check50Wrap L2168-L2201.
function gate50(ctx) {
  for (const r of ctx.rules) {
    for (const d of r.decls) {
      if (d.prop !== 'grid-template-columns') continue;
      let flat = resolveVars(d.value, ctx.tokens);
      for (let k = 0; k < 4 && /\((?:[^()]*)\)/.test(flat); k++) flat = flat.replace(/(calc|min|max|clamp|var|fit-content)\(([^()]*)\)/g, 'X');
      flat = flat.replace(/minmax\([^()]*\)/g, 'MM');
      const bare = /(?<![\w.-])\d*\.?\d+fr\b/.exec(flat);
      if (!bare) continue;
      const classes = (r.selector.match(/\.[a-zA-Z][\w-]*/g) || []).map((c) => c.slice(1));
      let hit = false;
      for (const doc of ctx.docs) {
        for (let i = 0; i < doc.tags.length && !hit; i++) {
          const t = doc.tags[i];
          if (t.close || t.selfClosing) continue;
          const cls = getAttr(t.attrs, 'class') || '';
          if (!classes.some((c) => cls.split(/\s+/).includes(c))) continue;
          const inner = innerOf(doc, i);
          if (inner && /<(img|picture|video)\b/i.test(inner.inner)) hit = true;
        }
        if (hit) break;
      }
      if (hit) ctx.report('50', 'FAIL', r.file, d.line, `bare ${bare[0]} track holds images (${r.selector})`, 'minmax(0, 1fr) for image tracks');
    }
  }
  const wrapCovered = (cls, tag) => ctx.rules.some((r) => {
    const has = r.decls.some((d) => (d.prop === 'overflow-wrap' && /anywhere|break-word/.test(d.value)) || (d.prop === 'word-break' && /break-word|break-all/.test(d.value)) || (d.prop === 'hyphens' && /auto/.test(d.value)));
    if (!has) return false;
    if (/^\*|:where\(|html|body/.test(r.selector)) return true;
    return (cls && cls.split(/\s+/).some((c) => c && r.selector.includes('.' + c))) || new RegExp(`(^|[\\s,>+~])${tag}\\b`).test(r.selector);
  });
  for (const doc of ctx.docs) {
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing) continue;
      const cls = getAttr(t.attrs, 'class') || '';
      if (!/^h[12]$/.test(t.name) && !/hero__(title|display)|section__title|__display/.test(cls)) continue;
      const inner = innerOf(doc, i);
      if (!inner) continue;
      const words = plainText(inner.inner).split(' ');
      const risky = words.find((w) => w.split('-').some((seg) => seg.replace(/[^\w]/g, '').length >= 16));
      if (risky && !wrapCovered(cls, t.name) && !getAttr(t.attrs, 'class')?.split(/\s+/).some((c) => /^(break-words|wrap-break-word|hyphens-auto)$/.test(c))) {
        ctx.report('50', 'FAIL', doc.file, t.line, `display heading word "${trunc(risky, 30)}" with no overflow-wrap`, 'overflow-wrap: break-word and min-width: 0');
      }
    }
  }
}

// Gate 53. Upstream check53 L2203-L2215.
function gate53(ctx) {
  for (const r of ctx.rules) {
    if (!/input\[type=["']?radio["']?\]|\.(radio|tab-input|tab-radio)\b/i.test(r.selector)) continue;
    const abs = r.decls.some((d) => d.prop === 'position' && /absolute|fixed/.test(d.value));
    const topZero = r.decls.some((d) => d.prop === 'top' && /^0(px|rem)?$/.test(d.value.trim()));
    if (abs && topZero && !ctx.docs.some((doc) => /preventScroll/.test(doc.scripts))) {
      ctx.report('53', 'FAIL', r.file, r.line, `radio tabs at position: absolute; top: 0 (${r.selector}) with no script guard`, 'Radios in flow at zero size, or a handler with preventScroll');
    }
  }
}

// Gate 54. Upstream EYEBROW_* + eyebrowHit + check54 + check54Unheaded L2217-L2341, tw54 L3742.
const EYEBROW_CONTAINER = /^(div|header|footer|section|article|aside|hgroup|li|main|figure|a|body|blockquote)$/;
const EYEBROW_SKIP_TAGS = /^(figcaption|label|legend|caption|th|dt|summary|option|code|kbd|button|select|nav|time)$/;
const EYEBROW_BLOCKY = /<(p|ul|ol|hr|h[1-6]|img|table|figure|section|article|blockquote|form|dl)\b/i;
const EYEBROW_CLASS = /\b(eyebrow|kicker|overline|superhead|suphead|rubric|strap(line)?|pre-?(title|head(ing)?)|section-?label|num-?label|chapter|ordinal|topic|category|dept)\b|__(num|label|tag|kicker|chip|badge|meta|index|caps|micro)\b|\b(tag|chip|badge|meta|caps|micro|label|index)\b/i;
const EYEBROW_ANNOUNCE = /^(features?|benefits?|introducing|new|how it works?|the (process|tour)|our (process|story|work|team|approach|values?)|why (us|choose|we)|pricing|plans?|faq|questions?|testimonials?|reviews?|trusted by|as seen in|what we do|about( us)?|services?|solutions?|use cases?|get started|contact|team|work|projects?|gallery|blog|news|resources?|examples?|overview)$/i;
function capsRatio(s) {
  const letters = s.replace(/[^A-Za-z]/g, '');
  if (!letters) return 0;
  return (letters.match(/[A-Z]/g) || []).length / letters.length;
}
function eyebrowHeadingBearing(ctx, B, aPx) {
  if (/^h[1-6]$/.test(B.name)) return true;
  if (/<h[1-6][\s>]/i.test(B.html)) return true;
  const cls = getAttr(B.open, 'class') || '';
  if (!/__(title|display|head(line)?|h\d)\b|hero__/i.test(cls)) return false;
  const bPx = fontPxOf(ctx, styleFor(ctx, cls, B.name));
  return bPx != null && aPx != null && bPx >= 1.5 * aPx;
}
function eyebrowHit(ctx, A, B, inOrderedList) {
  if (EYEBROW_SKIP_TAGS.test(A.name)) return null;
  if (/(^|\s)for\s*=/i.test(A.open)) return null;
  if (/role\s*=\s*["']status|aria-live|aria-current|aria-hidden\s*=\s*["']true/i.test(A.open)) return null;
  const inner = A.html.slice(A.open.length);
  if (EYEBROW_BLOCKY.test(inner) || /<br\b/i.test(inner)) return null;
  if (/<time\b[^>]*\sdatetime\s*=/i.test(A.html)) return null;
  if (/<img\b[^>]*\salt\s*=\s*["'][^"']+/i.test(A.html)) return null;
  const ownHref = A.name === 'a' ? getAttr(A.open, 'href') : null;
  if (ownHref && !/^#?$/.test(ownHref.trim())) return null;
  const innerHref = /<a\b[^>]*\shref\s*=\s*["']([^"']*)["']/i.exec(inner);
  if (innerHref && !/^#?$/.test(innerHref[1].trim())) return null;
  const text = plainText(A.html);
  if (!text) return null;
  const words = text.split(/[\s·/|\u2014\u2013]+/).filter(Boolean);
  if (words.length > 7 || text.length > 56) return null;
  if (/[\w/-]+\.[a-z]{1,4}$/i.test(text)) return null;
  if (/^[\d.,]+\s*(?:[%°+]|[a-z]{1,3})$/i.test(text)) return null;
  const stripped = text.replace(/^\s*(?:no\.?\s*)?\d{1,3}(?:\s*[·./\u2014\u2013-]\s*|\s+|$)/i, '').trim();
  if ((stripped.match(/\d/g) || []).length >= 2) return null;
  if (inOrderedList && stripped && !EYEBROW_ANNOUNCE.test(stripped)) return null;
  const cls = getAttr(A.open, 'class') || '';
  const aDecls = styleFor(ctx, cls, A.name);
  const pos = declValue(ctx, aDecls, 'position');
  if (pos && /absolute|fixed/.test(pos)) return null;
  const aPx = fontPxOf(ctx, aDecls);
  if (!eyebrowHeadingBearing(ctx, B, aPx)) return null;
  if (EYEBROW_CLASS.test(cls)) return { text };
  let signals = 0;
  const tt = declValue(ctx, aDecls, 'text-transform');
  if ((tt && /uppercase/.test(tt)) || (capsRatio(text) >= 0.6 && /[A-Z]/.test(text))) signals++;
  const tr = trackingEmOf(ctx, aDecls, aPx || 16);
  if (tr != null && tr >= 0.04) signals++;
  if (aPx != null && aPx <= 15) signals++;
  const ff = declValue(ctx, aDecls, 'font-family');
  if (ff && MONO_FAMILY.test(firstFamily(ff))) signals++;
  const fv = declValue(ctx, aDecls, 'font-variant-caps');
  if (fv && /small-caps/.test(fv)) signals++;
  if (signals >= 2) return { text };
  if (EYEBROW_ANNOUNCE.test(stripped)) return { text };
  return null;
}
function tw54(it) {
  const f = it.info, fr = it.frame, doc = it.doc;
  if (it.idx < 0 || !/^(?:p|span|div|small)$/.test(it.name) || fr.eyeSkip) return null;
  if (!(f.upper || (f.em != null && f.em > 0.03) || f.accent)) return null;
  if (fr.size == null || fr.size > 14) return null;
  const t = doc.tags[it.idx];
  if (/role\s*=\s*["']?status|aria-live|aria-current|aria-hidden\s*=\s*["']?true/i.test(t.attrs)) return null;
  const c = closeIndex(doc, it.idx);
  const nx = doc.tags[c + 1];
  if (!nx || nx.close || !/^h[1-3]$/.test(nx.name)) return null;
  const inner = c > it.idx ? doc.src.slice(t.end, doc.tags[c].pos) : '';
  if (EYEBROW_BLOCKY.test(inner) || /<br\b|<time\b/i.test(inner)) return null;
  const href = /<a\b[^>]*\shref\s*=\s*["']([^"']*)["']/i.exec(inner);
  if (href && !/^#?$/.test(href[1].trim())) return null;
  const text = twPlain(doc, inner);
  if (!text) return null;
  const words = text.split(/[\s·/|\u2014\u2013]+/).filter(Boolean);
  if (words.length > 7 || text.length > 56 || /[\w/-]+\.[a-z]{1,4}$/i.test(text)) return null;
  const stripped = text.replace(/^\s*(?:no\.?\s*)?\d{1,3}(?:\s*[·./\u2014\u2013-]\s*|\s+|$)/i, '').trim();
  if ((stripped.match(/\d/g) || []).length >= 2) return null;
  if (fr.inOl && stripped && !EYEBROW_ANNOUNCE.test(stripped)) return null;
  return { text, next: nx.name };
}
function gate54(ctx) {
  const hit = new Set();
  for (const doc of ctx.docs) {
    const anc = ancestorMap(doc);
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing || !EYEBROW_CONTAINER.test(t.name)) continue;
      const ancestors = anc.get(i) || [];
      if (ancestors.some((n) => EYEBROW_ANCESTOR_SKIP.test(n))) continue;
      const inOl = ancestors.includes('ol');
      const kids = directChildren(doc, i);
      for (let k = 0; k < kids.length - 1; k++) {
        const A = kids[k];
        let B = null;
        for (let j = k + 1; j < Math.min(kids.length, k + 3); j++) {
          const c = kids[j];
          if (c.name === 'hr' || /aria-hidden\s*=\s*["']true/i.test(c.open)) continue;
          B = c; break;
        }
        if (!B) continue;
        const h = eyebrowHit(ctx, A, B, inOl);
        if (h) {
          const line = doc.tags[A.idx]?.line || t.line;
          hit.add(`${doc.file}:${line}`);
          ctx.report('54', 'FAIL', doc.file, line, `eyebrow "${trunc(h.text, 32)}" before <${B.name}>`, 'Open the section another way; keep the line only if it carries a fact');
          break;
        }
      }
    }
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing || !/^(section|article)$/.test(t.name)) continue;
      const labelledBy = getAttr(t.attrs, 'aria-labelledby');
      if (!labelledBy) continue;
      const body = innerOf(doc, i);
      if (!body || /<h[1-6][\s>]/i.test(body.inner)) continue;
      const m = new RegExp(`<([a-z][\\w-]*)\\b[^>]*\\sid\\s*=\\s*["']${labelledBy.split(/\s+/)[0].replace(/[^\w-]/g, '')}["'][^>]*>`, 'i').exec(body.inner);
      if (!m || /^h[1-6]$/i.test(m[1])) continue;
      ctx.report('54', 'WARN', doc.file, doc.lineOf(body.endPos - body.inner.length + m.index), `section labelled by <${m[1].toLowerCase()}> with no heading element`, 'Promote the label to a heading');
    }
  }
  for (const it of twGroup(ctx).items) {
    const e = tw54(it);
    if (e && !hit.has(`${it.doc.file}:${it.line}`)) ctx.report('54', 'FAIL', it.doc.file, it.line, `eyebrow "${trunc(e.text, 24)}" before <${e.next}> on ${twWhere(it)}`, 'Open the section another way; keep the line only if it carries a fact');
  }
}

// Gate 55a. Upstream check55 L2343-L2359 (55a half).
function gate55a(ctx) {
  for (const r of mergedDeclsBySelector(ctx)) {
    if (!r.decls.some((d) => d.prop === 'text-transform' && /uppercase/.test(d.value))) continue;
    const lhD = r.decls.find((d) => d.prop === 'line-height');
    if (!lhD) continue;
    const lh = parseFloat(resolveVars(lhD.value, ctx.tokens));
    if (Number.isNaN(lh) || lh >= 1.0) continue;
    const big = r.decls.some((d) => d.prop === 'font-size' && (pxOf(resolveVars(d.value, ctx.tokens)) ?? 0) >= 28);
    if (!HEADING_SEL.test(r.selector) && !big) continue;
    if (r.decls.some((d) => d.prop === 'white-space' && /nowrap/.test(d.value))) continue;
    ctx.report('55a', 'FAIL', r.file, lhD.line, `uppercase heading at line-height ${lh} on ${r.selector} (lines collide when it wraps)`, 'line-height 1.0 or more');
  }
}

// Gate 62. Upstream HIDE_OK + startingStyleText + check62 L2397-L2433.
const HIDE_OK = /tooltip|popover|menu|dropdown|modal|dialog|toast|overlay|backdrop|sheet|drawer|panel|:hover|:focus|:checked|:target|\[open|\[aria-(?:expanded|selected|current|pressed)|::before|::after|\.is-|\[hidden|\[aria-hidden|sr-only|visually-hidden|skip|placeholder|::marker|\[data-slot/i;
function startingStyleText(css) {
  let out = '';
  for (const m of css.matchAll(/@starting-style\s*\{/gi)) {
    let depth = 1, k = m.index + m[0].length;
    while (k < css.length && depth > 0) { if (css[k] === '{') depth++; else if (css[k] === '}') depth--; k++; }
    out += css.slice(m.index, k) + ' ';
    const open = css.lastIndexOf('{', m.index - 1), close = css.lastIndexOf('}', m.index - 1);
    if (open > close) out += css.slice(Math.max(close + 1, 0), open) + ' ';
  }
  return out;
}
function gate62(ctx) {
  const starting = startingStyleText(ctx.allCss);
  const jsScoped = (sel) => /(^|[\s,])(html|body)?\.js\b|\[data-js|\.no-js|html\.has-js/i.test(sel);
  const animated = new Map();
  for (const r of ctx.rules) if (r.keyframes) { const a = animated.get(r.keyframes) || []; a.push(r); animated.set(r.keyframes, a); }
  const animatesVisible = (name) => (animated.get(name) || []).some((r) => /to|100%/.test(r.selector) && r.decls.some((d) => d.prop === 'opacity' && parseFloat(d.value) === 1));
  const seen = new Set();
  for (const r of ctx.rules) {
    if (r.keyframes || (r.media && /\bprint\b/i.test(r.media)) || r.selector === '@font-face' || r.tailwindConfig) continue;
    const hidden = r.decls.find((d) => (d.prop === 'opacity' && parseFloat(resolveVars(d.value, ctx.tokens)) === 0) || (d.prop === 'visibility' && /hidden/.test(d.value)));
    if (!hidden) continue;
    if (HIDE_OK.test(r.selector.replace(/:not\([^)]*\)/g, '')) || jsScoped(r.selector) || (starting && starting.includes(r.selector))) continue;
    const revealish = /reveal|fade|animate|aos|in-view|inview|appear|enter|rise|slide|stagger|observe|lazy/i.test(r.selector) || r.decls.some((d) => d.prop === 'transform' && /translate|scale/.test(d.value));
    if (!revealish) continue;
    const anim = r.decls.find((d) => d.prop === 'animation' || d.prop === 'animation-name');
    const animName = anim ? anim.value.split(/\s+/).find((w) => animated.has(w)) : null;
    if (animName && animatesVisible(animName)) continue;
    if (seen.has(r.selector)) continue;
    seen.add(r.selector);
    ctx.report('62', 'FAIL', r.file, hidden.line, `${r.selector} is hidden at rest (${hidden.prop}: ${hidden.value}) and needs a script to appear`, 'Visible by default; hide only under a .js class, or use @starting-style');
  }
}

// Gate 63. Upstream TEXT_TAGS + check63 L2435-L2473 and checkComponentText.
const TEXT_TAGS = new Set(['p', 'span', 'li', 'small', 'a', 'div', 'figcaption', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'time', 'dd', 'dt', 'cite', 'strong', 'em', 'b', 'label', 'button', 'summary']);
function gate63(ctx) {
  for (const doc of ctx.docs) {
    const dotLines = new Set(), arrowLines = new Set();
    let dotCount = 0;
    const tickers = [];
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing || !/marquee|ticker|tape|crawl/i.test(getAttr(t.attrs, 'class') || '')) continue;
      const inner = innerOf(doc, i);
      if (inner) tickers.push([t.pos, inner.endPos]);
    }
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing || !TEXT_TAGS.has(t.name)) continue;
      const cls = getAttr(t.attrs, 'class') || '';
      if (/marquee|ticker|tape|crawl/i.test(cls) || tickers.some(([a, b]) => t.pos > a && t.pos < b)) continue;
      const inner = innerOf(doc, i);
      if (!inner || /<(p|div|li|section|article|ul|ol|table)\b/i.test(inner.inner)) continue;
      const text = plainText(inner.inner);
      if (!text) continue;
      if ((text.match(/\s[·•]\s/g) || []).length >= 2 && !dotLines.has(t.line)) { dotLines.add(t.line); ctx.report('63', 'FAIL', doc.file, t.line, `middle-dot meta string "${trunc(text, 50)}"`, 'Line breaks, columns or rules; one dot in a byline at most'); }
      if ((t.name === 'a' || t.name === 'button') && /(\u2192|->|\u203a|\u00bb|\u27f6)\s*$/.test(text) && !arrowLines.has(t.line)) { arrowLines.add(t.line); ctx.report('63', 'FAIL', doc.file, t.line, `arrow glued to the label "${trunc(text, 40)}"`, 'A verb as the label; the link already goes somewhere'); }
      if (/^[A-Z]{3,}\s+-\s+\S/.test(text) && text.length < 60) ctx.report('63', 'FAIL', doc.file, t.line, `WORD - fragment label "${trunc(text, 40)}"`, 'Say it as a sentence or a heading');
    }
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || !/^(span|i|b|em|s)$/.test(t.name)) continue;
      const cls = getAttr(t.attrs, 'class') || '';
      if (!/(^|\s)(dot|status-dot|indicator|bullet|pip|blip)(\s|$|__|-)/i.test(cls) || /aria-live|role\s*=\s*"status"/i.test(t.attrs)) continue;
      const inner = innerOf(doc, i);
      if (inner && plainText(inner.inner)) continue;
      if (++dotCount === 3) ctx.report('63', 'FAIL', doc.file, t.line, `decorative status dots (${cls.trim()}) repeated across the page`, 'Delete them; a dot means live state, only where it is one');
    }
    for (let c = 0; c < doc.comps.length; c++) {
      const t = doc.comps[c];
      if (t.close || t.selfClosing) continue;
      const inner = compInner(doc, c);
      if (!inner || /<(?:p|div|li|section|article|ul|ol|table)\b/i.test(inner)) continue;
      const text = twPlain(doc, inner);
      if (!text) continue;
      if (/(?:link|button|btn|cta)$/i.test(t.name) && /(\u2192|->|\u203a|\u00bb|\u27f6)\s*$/.test(text)) ctx.report('63', 'FAIL', doc.file, t.line, `arrow glued to the label "${trunc(text, 40)}" (<${t.name}>)`, 'A verb as the label');
      if ((text.match(/\s[·•]\s/g) || []).length >= 2) ctx.report('63', 'FAIL', doc.file, t.line, `middle-dot meta string "${trunc(text, 50)}"`, 'Line breaks, columns or rules');
    }
  }
}

// Gate 64. Upstream monoIsMaterial L2392 + check64 L2475-L2492 + Tailwind font-mono. The page's
// own mono display/body face still suppresses the gate; a DESIGN.md declaration reports WAIVED.
function cssFaceIsMono(ctx) {
  const fams = [];
  for (const r of ctx.rules) {
    const bodyish = /^(html|body|:root)$/i.test(r.selector.trim());
    const headish = !isTokenRule(r) && HEADING_SEL.test(r.selector);
    if (!bodyish && !headish) continue;
    for (const d of r.decls) if (d.prop === 'font-family') fams.push(firstFamily(resolveVars(d.value, ctx.tokens)));
  }
  for (const r of ctx.rules) {
    if (!isTokenRule(r)) continue;
    for (const d of r.decls) if (/^--[\w-]*(font|family|ff)[\w-]*-(display|body|base|text|sans|heading)$|^--[\w-]*(display|body|heading)[\w-]*-(font|family)$/i.test(d.prop)) fams.push(firstFamily(resolveVars(d.value, ctx.tokens)));
  }
  return fams.some((f) => f && f !== 'monospace' ? MONO_FAMILY.test(f) : f === 'monospace');
}
function gate64(ctx) {
  const declared = ctx.design ? DECLARED['64'](ctx.design) : null;
  if (!declared && cssFaceIsMono(ctx)) return;
  const LABELISH = /label|caption|meta|eyebrow|kicker|tag\b|badge|chip|small|folio|footnote|legend|\bth\b|thead|figcaption|overline|dateline|byline|credit|note\b/i;
  const DATAISH = /code|pre\b|kbd|samp|num|figure|stat|price|value|data|tabular|counter|timer|clock|coord|amount|total|score|version|hash|\bid\b|sku|time|date|hour|utc|eta|lot\b|edition|ref\b|dimension|measure|reading|url|uri\b|path|endpoint|command|cmd|snippet|install/i;
  const seen = new Set();
  for (const r of ctx.rules) {
    if (r.keyframes || r.selector === '@font-face' || isTokenRule(r)) continue;
    if (!LABELISH.test(r.selector) || DATAISH.test(r.selector)) continue;
    const fam = r.decls.find((d) => d.prop === 'font-family' || (d.prop === 'font' && /var\(--|mono/i.test(d.value)));
    if (!fam) continue;
    const raw = fam.prop === 'font' ? (/var\(--[\w-]+\)/.exec(fam.value) || [fam.value])[0] : fam.value;
    if (!MONO_FAMILY.test(firstFamily(resolveVars(raw, ctx.tokens)))) continue;
    const key = baseSelector(r.selector);
    if (seen.has(key)) continue;
    seen.add(key);
    ctx.report('64', 'FAIL', r.file, fam.line, `monospace label voice on ${r.selector}`, 'Labels in the body face, a step smaller, normal case');
  }
  for (const it of twGroup(ctx).items) {
    const f = it.info;
    if (!f.mono || it.virtual || it.frame.code || /^(?:code|pre|kbd|samp|time|var)$/.test(it.name) || it.frame.size == null || it.frame.size > 14) continue;
    const text = twText(it);
    if (/[A-Za-z]/.test(text) && !twDataText(text)) ctx.report('64', 'FAIL', it.doc.file, it.line, `font-mono on "${trunc(text, 24)}" at ${it.frame.size}px (${twWhere(it)})`, 'Labels in the body face; font-mono only for code and figures');
  }
}

// Gate 67. Upstream LABEL67 .. check67Html L2771-L2883 and tw67 L3727-L3740.
const LABEL67 = /label|caption|meta|eyebrow|kicker|tag\b|badge|chip|small|folio|footnote|legend|\bth\b|thead|figcaption|overline|dateline|byline|credit|note\b|\bnav\b|menu|link|pill|status|unit|smallcaps|count|placard/i;
const CONTROL67 = /btn|button|cta|\.sign\b|plate|control/i;
const EXEMPT67_NAME = /^(wordmark|marquee|ticker|logo|brand|abbr|logo-?(mark|type|text)|brand-?(mark|name|type))$/i;
const EXEMPT67_PART = /(^|[-_])(wordmark|marquee|ticker|logotype|logo|brand)([-_]|$)|(^|[-_])(slab|nav|site|head|header|masthead|bar)[-_]+mark([-_]|$)/i;
const exemptName67 = (n) => !!n && (EXEMPT67_NAME.test(n.split('--')[0].split('__').pop()) || EXEMPT67_PART.test(n));
const SCROLLER67 = /(^|[-_])(marquee|ticker)([-_]|$)/i;
function exempt67(sel) {
  return sel.split(',').some((part) => {
    const comps = baseSelector(part).split(/[\s>+~]+/).filter(Boolean);
    const comp = comps[comps.length - 1] || '';
    const names = (comp.match(/\.[a-zA-Z_][\w-]*/g) || []).map((c) => c.slice(1));
    names.push((/^[a-zA-Z][\w-]*/.exec(comp) || [''])[0]);
    if (names.some(exemptName67)) return true;
    return comps.slice(0, -1).some((c) => (c.match(/\.[a-zA-Z_][\w-]*/g) || []).some((x) => SCROLLER67.test(x.slice(1))));
  });
}
function inherited67(bySel, sel, prop) {
  const base = baseSelector(sel);
  let best = null, bestLen = 0;
  for (const o of bySel) {
    if (/:hover|:focus|:active/.test(o.selector) || (o.media && /max-width/i.test(o.media))) continue;
    for (const part of o.selector.split(',')) {
      const ob = baseSelector(part);
      if (!ob || ob === base || ob.length <= bestLen || !base.startsWith(ob) || !/[\s>+~]/.test(base[ob.length] || '')) continue;
      const d = o.decls.filter((x) => x.prop === prop).pop();
      if (d) { best = d.value; bestLen = ob.length; }
    }
  }
  return best;
}
const isSmallCaps67 = (prop, v) => (/^font-variant(-caps)?$/.test(prop) && /\b(all-)?(small|petite)-caps\b/.test(v)) || (prop === 'font-feature-settings' && /\b(smcp|c2sc)\b/.test(v));
const CAPS_TAGS = /^(p|span|small|a|li|div|figcaption|td|th|dt|dd|label|time|cite|strong|b|em|button|summary)$/;
function gate67(ctx) {
  const bySel = mergedDeclsBySelector(ctx).filter((r) => !isTokenRule(r));
  const displayish = (r) => HEADING_SEL.test(r.selector) || /display|title|headline|bill|poster|banner/i.test(r.selector) || (fontSizePxOf(r, ctx) || 0) >= 28;
  const upperDisplay = bySel.some((r) => displayish(r) && !LABEL67.test(r.selector) && r.decls.some((d) => d.prop === 'text-transform' && /uppercase/.test(d.value)));
  const isUpper = (v) => v != null && /uppercase/.test(resolveVars(v, ctx.tokens));
  const seen = new Set();
  const cssHits = new Set();
  for (const r of bySel) {
    if (exempt67(r.selector) || /::first-letter\s*(,|$)/.test(r.selector)) continue;
    const ownTT = r.decls.filter((d) => d.prop === 'text-transform').pop();
    const ownUpper = ownTT ? isUpper(ownTT.value) : null;
    const ownSmallCaps = r.decls.some((d) => isSmallCaps67(d.prop, resolveVars(d.value, ctx.tokens)));
    const px = fontSizePxOf(r, ctx);
    const ownEm = trackingEmOf(ctx, r.decls, px || 16);
    if (!(ownUpper === true || ownSmallCaps || (ownEm != null && ownEm > 0.03))) continue;
    const upper = ownUpper != null ? ownUpper : isUpper(inherited67(bySel, r.selector, 'text-transform'));
    const smallCaps = ownSmallCaps || ['font-variant', 'font-variant-caps', 'font-feature-settings'].some((prop) => { const v = inherited67(bySel, r.selector, prop); return v != null && isSmallCaps67(prop, resolveVars(v, ctx.tokens)); });
    let em = ownEm;
    if (em == null) { const v = inherited67(bySel, r.selector, 'letter-spacing'); if (v != null) em = trackingEmOf(ctx, [{ prop: 'letter-spacing', value: v }], px || 16); }
    const tracked = em != null && em > 0.03;
    const subject = r.selector.split(',').map((p) => baseSelector(p).split(/[\s>+~]+/).filter(Boolean).pop() || '');
    const bigToken = r.decls.some((d) => d.prop === 'font-size' && /--text-(display|section|title)|clamp\(\s*(?:[2-9]|\d{2,})(?:\.\d+)?rem/.test(d.value));
    const labelish = subject.some((s) => LABEL67.test(s)) ? !((px != null && px >= 28) || bigToken) : LABEL67.test(r.selector) && !subject.every((s) => /^h[1-6]\b/i.test(s)) && (px == null || px < 20);
    const control = CONTROL67.test(r.selector);
    const heading = HEADING_SEL.test(r.selector) && !labelish;
    if (heading && !control) continue;
    const key = baseSelector(r.selector);
    if (seen.has(key)) continue;
    const small = px != null && px <= 15;
    if (control && !labelish) {
      if (!upper && !smallCaps) { if (!(tracked && small)) continue; } else if (upperDisplay && (em == null || em <= 0.045)) continue;
      seen.add(key);
      for (const part of r.selector.split(',')) for (const c of baseSelector(part).match(/\.[\w-]+/g) || []) cssHits.add(c.slice(1));
      ctx.report('67', 'FAIL', r.file, r.line, `${r.selector}: uppercase control on a page whose display is not uppercase`, 'Controls follow the display voice: sentence case');
      continue;
    }
    if (((upper || smallCaps) && (labelish || smallCaps || tracked || small)) || (tracked && (labelish || small))) {
      seen.add(key);
      for (const part of r.selector.split(',')) for (const c of baseSelector(part).match(/\.[\w-]+/g) || []) cssHits.add(c.slice(1));
      const what = smallCaps ? 'small caps' : upper ? 'uppercase' : 'letter-spaced';
      ctx.report('67', 'FAIL', r.file, r.line, `${r.selector}: ${what}${tracked ? ` tracked ${em}em` : ''}${px != null ? ` at ${Math.round(px)}px` : ''} in a label role`, 'The body face, a step smaller, sentence case, no tracking');
    }
  }
  for (const doc of ctx.docs) {
    const anc = ancestorMap(doc);
    const seenHtml = new Set();
    for (let i = 0; i < doc.tags.length; i++) {
      const t = doc.tags[i];
      if (t.close || t.selfClosing || !CAPS_TAGS.test(t.name)) continue;
      const cls = getAttr(t.attrs, 'class') || '';
      if (cls.split(/\s+/).some((c) => exemptName67(c) || cssHits.has(c))) continue;
      if ((anc.get(i) || []).some((n) => /^(svg|pre|code|abbr|kbd|samp)$/.test(n))) continue;
      const inner = innerOf(doc, i);
      if (!inner || /<(p|div|ul|ol|h[1-6]|table|section|article|svg|img|abbr|code|kbd)\b/i.test(inner.inner)) continue;
      const text = plainText(inner.inner);
      const letters = text.replace(/[^A-Za-z]/g, '');
      if (letters.length < 5 || capsRatio(text) < 0.95 || /^[A-Z]{2,5}$/.test(text)) continue;
      const decls = styleFor(ctx, cls, t.name);
      const px = fontPxOf(ctx, decls);
      const em = trackingEmOf(ctx, decls, px || 16);
      const tracked = em != null && em > 0.03;
      if (!((px != null && px <= 15) || tracked)) continue;
      const key = cls || t.name;
      if (seenHtml.has(key)) continue;
      seenHtml.add(key);
      ctx.report('67', 'FAIL', doc.file, t.line, `"${trunc(text, 32)}" typed in capitals${px != null ? ` at ${Math.round(px)}px` : ''}`, 'Sentence case in the body face');
    }
  }
  const tw = twGroup(ctx);
  for (const it of tw.items) {
    const f = it.info, fr = it.frame;
    if (!(f.upper || f.caps || (f.em != null && f.em > 0.03))) continue;
    if (fr.logo || fr.logoSelf || fr.noLabel) continue;
    const size = fr.size, em = fr.em;
    if ((size != null && size >= 24) || (size == null && /^h[1-6]$/.test(it.name))) continue;
    const caps = fr.upper || fr.caps;
    const small = size != null && size <= 15;
    const tracked = em != null && em > 0.03;
    const control = /^(?:button|input)$/.test(it.name) || /(?:button|btn|cta)$/i.test(it.name) || /role\s*=\s*["']?button/i.test(it.attrs);
    if (tw.upperDisplay && control && (em == null || em <= 0.04)) continue;
    if (!((caps && (small || tracked)) || (tracked && small))) continue;
    const text = it.virtual ? '' : twText(it);
    ctx.report('67', 'FAIL', it.doc.file, it.line, `${text ? `"${trunc(text, 24)}" ` : ''}${fr.caps ? 'small caps' : fr.upper ? 'uppercase' : 'letter-spaced'}${size != null ? ` at ${size}px` : ''} on ${twWhere(it)}`, 'Sentence case, a step smaller, no tracking class');
  }
}

// Gate 74. Upstream TAILWIND_HEX L3178 and the Tailwind palette count in checkTailwind L3836.
const STOCK_HEX = new Map(Object.entries({
  '6366f1': 'indigo-500', '4f46e5': 'indigo-600', '8b5cf6': 'violet-500', '7c3aed': 'violet-600', 'a855f7': 'purple-500',
  '9333ea': 'purple-600', '3b82f6': 'blue-500', '2563eb': 'blue-600', '0ea5e9': 'sky-500', 'ec4899': 'pink-500',
  '10b981': 'emerald-500', 'f8fafc': 'slate-50', 'f1f5f9': 'slate-100', '64748b': 'slate-500', '1e293b': 'slate-800',
  '0f172a': 'slate-900', '020617': 'slate-950', 'f9fafb': 'gray-50', 'f3f4f6': 'gray-100', '6b7280': 'gray-500',
  '111827': 'gray-900', '18181b': 'zinc-900', '09090b': 'zinc-950',
}));
function gate74(ctx) {
  for (const r of ctx.rules) {
    for (const d of r.decls) {
      for (const m of d.value.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
        const name = STOCK_HEX.get(m[1].toLowerCase());
        if (name) ctx.report('74', 'FAIL', r.file, d.line, `stock Tailwind ${name} (#${m[1]}) as ${d.prop} on ${trunc(r.selector, 30)}`, 'A colour from DESIGN.md', { hex: `#${m[1].toLowerCase()}` });
      }
    }
  }
  const byDoc = new Map();
  for (const it of twGroup(ctx).items) {
    if (!byDoc.has(it.doc)) byDoc.set(it.doc, { pal: new Map() });
    const e = byDoc.get(it.doc);
    for (const p of it.info.pal) if (!e.pal.has(p)) e.pal.set(p, it);
  }
  for (const [doc, e] of byDoc) {
    if (e.pal.size < 3) continue;
    const first = [...e.pal.values()][0];
    ctx.report('74', 'FAIL', doc.file, first.line, `stock Tailwind palette classes: ${e.pal.size} distinct (${[...e.pal.keys()].slice(0, 4).join(' ')})`, 'Put the DESIGN.md colours in the Tailwind theme and use those names');
  }
}

const GATES = [gate1, gate2, gate4, gate7a, gate10, gate12, gate15, gate19, gate26, gate27, gate28, gate30, gate33, gate34, gate37, gate38i, gate39, gate47, gate48, gate50, gate53, gate54, gate55a, gate62, gate63, gate64, gate67, gate74];

// ---------------------------------------------------------------------------------------------
// Waivers (new; replaces upstream applyWaivers L919-L1015 and its CSS stamp syntax).
// ---------------------------------------------------------------------------------------------
const WAIVER_FILLER = /\b(a|an|the|is|it|this|that|was|are|and|but|so|very|just|really|here|quite|more|most)\b/gi;
const WAIVER_BOILERPLATE = ['design choice', 'design decision', 'intentionally', 'intentional', 'by design', 'looks better', 'for the aesthetic', 'aesthetic', 'necessary here', 'necessary', 'the prompt requires it', 'prompt requires', 'the brief requires it', 'brief requires', 'on purpose', 'deliberate', 'deliberately', 'it works', 'works better', 'needed', 'required', 'fine', 'ok', 'okay', '设计选择', '故意', '有意为之', '更好看', '需要'];
function reasonIsBoilerplate(reason) {
  let r = reason.toLowerCase();
  for (const p of WAIVER_BOILERPLATE) r = r.split(p).join(' ');
  r = r.replace(WAIVER_FILLER, ' ').replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ').trim();
  return r.replace(/\s/g, '').length < 10;
}
const wordsOf = (s) => {
  const lower = s.toLowerCase();
  const latin = lower.match(/[a-z]{4,}/g) || [];
  const cjk = [];
  for (const run of lower.match(/[\u3400-\u9fff]{2,}/g) || []) for (let k = 0; k + 1 < run.length; k++) cjk.push(run.slice(k, k + 2));
  return [...latin, ...cjk];
};
function readWaivers(design, pageText) {
  const accepted = new Map();
  const notes = [];
  if (!design?.waiverSec) return { accepted, notes };
  const pageWords = new Set(wordsOf(`${pageText}\n${design.bodyText}\n${design.fm.name || ''} ${design.fm.description || ''}`));
  const reasons = new Map();
  const claims = [];
  for (const { text, line } of design.waiverSec.lines) {
    const t = text.trim();
    if (!/^-\s+waive\b/i.test(t)) continue;
    const m = /^-\s+waive\s+(\S+)\s+·\s+(.+?)\s+·\s+(.+?)\s*$/i.exec(t);
    if (!m) { notes.push({ gate: 'waiver', line, message: `malformed waiver line, ignored: ${trunc(t, 60)}`, fix: 'Three fields separated by " · ": - waive <gate> · <evidence> · <reason>' }); continue; }
    claims.push({ id: m[1], evidence: m[2].trim(), reason: m[3].trim(), line });
    reasons.set(m[3].trim().toLowerCase(), (reasons.get(m[3].trim().toLowerCase()) || 0) + 1);
  }
  const reject = (c, why) => notes.push({ gate: c.id, line: c.line, message: `waiver rejected: ${why}`, fix: 'Fix the finding, or write a reason about this page' });
  for (const c of claims) {
    const tier = TIERS[c.id];
    if (!tier) {
      const clauses = Object.keys(TIERS).filter((k) => k !== c.id && new RegExp(`^${c.id}[a-z]+$`).test(k));
      reject(c, clauses.length ? `name the clause (${clauses.join(' or ')})` : `unknown gate ${c.id}`);
      continue;
    }
    if (tier === 'floor') { reject(c, 'Floor is never waivable'); continue; }
    if (tier === 'finish') { reject(c, 'Finish checks are answered in the report, not waived'); continue; }
    if (accepted.has(c.id)) { reject(c, 'one waiver per gate'); continue; }
    if (c.reason.length < 24) { reject(c, 'reason under 24 characters'); continue; }
    if (reasonIsBoilerplate(c.reason)) { reject(c, 'boilerplate reason'); continue; }
    if (reasons.get(c.reason.toLowerCase()) > 1) { reject(c, 'reason reused on another waiver'); continue; }
    if (!wordsOf(c.reason).some((w) => pageWords.has(w))) { reject(c, 'reason shares no word with the page or DESIGN.md'); continue; }
    accepted.set(c.id, c);
  }
  if (accepted.size > 3) notes.push({ gate: 'waiver', line: design.waiverSec.start, message: `${accepted.size} gates waived (${[...accepted.keys()].join(', ')}): that is a house style`, fix: 'Describe the style in the DESIGN.md body instead of listing exceptions' });
  return { accepted, notes };
}

// ---------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------
const GRADE_RANK = { FAIL: 0, REFLEX: 1, WARN: 2, WAIVED: 3, NOTE: 4 };
function gateSortKey(g) {
  const f = /^F(\d+)$/.exec(g);
  if (f) return 900 + Number(f[1]);
  const n = parseFloat(g);
  return Number.isNaN(n) ? 999 : n;
}
const USAGE = 'usage: node slop_check.mjs <file-or-dir ...> [--design DESIGN.md] [--scope page|component|app] [--json]';

/**
 * Run the checker. Returns { code, findings, summary, output } and never exits the process.
 * @param {string[]} argv
 * @param {{cwd?: string}} [env]
 */
export function run(argv, env = {}) {
  const cwd = env.cwd || process.cwd();
  const opts = { scope: 'page', json: false, design: null, paths: [] };
  const fail = (msg) => ({ code: 2, findings: [], summary: null, output: '', error: `slop_check: ${msg}\n${USAGE}` });
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--scope') { opts.scope = argv[++i]; if (!['page', 'component', 'app'].includes(opts.scope)) return fail('--scope must be page, component or app'); }
    else if (a === '--design') { opts.design = argv[++i]; if (!opts.design) return fail('--design needs a path'); }
    else if (a === '--help' || a === '-h') return { code: 0, findings: [], summary: null, output: USAGE };
    else if (a.startsWith('--')) return fail(`unknown flag ${a}`);
    else opts.paths.push(isAbsolute(a) ? a : resolve(cwd, a));
  }
  if (!opts.paths.length) return fail('no input paths');
  const errors = [];
  const files = collectFiles(opts.paths, errors);
  if (errors.length) return fail(errors.join('; '));

  let designFile = null;
  if (opts.design) {
    designFile = isAbsolute(opts.design) ? opts.design : resolve(cwd, opts.design);
    if (!existsSync(designFile) || !statSync(designFile).isFile()) return fail(`--design ${opts.design} is not a file`);
  } else designFile = findDesign(opts.paths[0]);
  let design = null;
  if (designFile) {
    try { design = readDesign(designFile); } catch (e) { return fail(`cannot read ${designFile}: ${e.message}`); }
  }

  const rules = [];
  const cssFiles = [];
  const docs = [];
  const loaded = new Set();
  const loadCss = (f) => {
    if (loaded.has(f)) return;
    loaded.add(f);
    let raw;
    try { raw = readFileSync(f, 'utf8'); } catch { return; }
    cssFiles.push({ file: f, raw });
    rules.push(...parseCss(raw, f));
  };
  for (const f of files) {
    const ext = extname(f).toLowerCase();
    if (TW_CONFIG.test(basename(f))) { try { rules.push(parseTailwindConfig(readFileSync(f, 'utf8'), f)); } catch { /* unreadable config */ } continue; }
    if (ext === '.css') { loadCss(f); continue; }
    let raw;
    try { raw = readFileSync(f, 'utf8'); } catch { continue; }
    const doc = parseDoc(f, raw);
    docs.push(doc);
    for (const st of doc.styles) rules.push(...parseCss(st.css, f, st.lineOffset));
  }
  for (const doc of docs) {
    if (doc.kind !== 'html') continue;
    for (const m of (doc.raw || doc.src).matchAll(/<link\b[^>]*>/gi)) {
      if (!/rel\s*=\s*["']?stylesheet/i.test(m[0])) continue;
      const href = getAttr(m[0], 'href');
      if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) continue;
      const p = resolve(dirname(doc.file), href.split(/[?#]/)[0]);
      if (existsSync(p) && extname(p).toLowerCase() === '.css') loadCss(p);
    }
  }
  const allCss = cssFiles.map((c) => c.raw).join('\n') + '\n' + docs.map((d) => d.styles.map((s) => s.css).join('\n')).join('\n');
  const raw = [];
  const ctx = {
    rules, cssFiles, docs, allCss, design, scope: opts.scope, root: opts.paths[0],
    tokens: buildTokens(rules),
    report(gate, grade, file, line, message, fix, data = {}) {
      const g = String(gate);
      if (opts.scope === 'component' && PAGE_ONLY.has(g)) return;
      if (opts.scope === 'app' && APP_SKIP.has(g)) return;
      raw.push({ gate: g, tier: TIERS[g] || 'floor', grade, file, line: line || 1, message, fix, data });
    },
  };
  for (const gate of GATES) {
    try { gate(ctx); } catch (e) {
      raw.push({ gate: 'internal', tier: 'finish', grade: 'NOTE', file: firstFile(ctx) || cwd, line: 1, message: `internal error in ${gate.name}: ${e.message}`, fix: 'Report this with the input file', data: {} });
    }
  }

  const pageText = docs.map((d) => d.text).join('\n');
  const { accepted, notes } = readWaivers(design, pageText);
  for (const n of notes) raw.push({ gate: n.gate, tier: TIERS[n.gate] || 'note', grade: 'NOTE', file: design.file, line: n.line, message: n.message, fix: n.fix, data: {}, waiverNote: true, rule: /^waiver rejected/.test(n.message) ? "waiver-rejected" : "waiver" });

  for (const f of raw) {
    if (f.waiverNote || f.grade === 'NOTE') continue;
    if (f.grade === 'FAIL' && f.tier === 'reflex') f.grade = 'REFLEX';
    if (f.tier !== 'house' && f.tier !== 'reflex') continue;
    if (!['FAIL', 'REFLEX', 'WARN'].includes(f.grade)) continue;
    const pred = design ? DECLARED[f.gate] : null;
    const why = pred ? pred(design, f) : null;
    if (why) { f.grade = 'WAIVED'; f.waiver = 'declared'; f.message = `(declared: ${why}) ${f.message}`; continue; }
    if (accepted.has(f.gate)) { f.grade = 'WAIVED'; f.waiver = 'manual'; f.message = `(waived: ${accepted.get(f.gate).reason}) ${f.message}`; }
  }

  const relp = (p) => { const r = relative(cwd, p); return (r && !r.startsWith('..') && !isAbsolute(r) ? r : p).split('\\').join('/'); };
  const seen = new Set();
  const findings = raw.filter((f) => {
    const k = `${f.gate}|${f.grade}|${f.file}|${f.line}|${f.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).map((f) => ({ gate: f.gate, tier: f.tier, grade: f.grade, file: relp(f.file), line: f.line, message: f.message, fix: f.fix, ...(f.waiver ? { waiver: f.waiver } : {}), ...(f.rule ? { rule: f.rule } : {}) }))
    .sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || gateSortKey(a.gate) - gateSortKey(b.gate) || a.gate.localeCompare(b.gate) || a.file.localeCompare(b.file) || a.line - b.line);

  const count = (pred) => findings.filter(pred).length;
  const summary = {
    floorFail: count((f) => f.grade === 'FAIL' && f.tier === 'floor'),
    houseFail: count((f) => f.grade === 'FAIL' && f.tier === 'house'),
    houseWaived: count((f) => f.grade === 'WAIVED' && f.tier === 'house'),
    reflex: count((f) => f.grade === 'REFLEX'),
    reflexWaived: count((f) => f.grade === 'WAIVED' && f.tier === 'reflex'),
    waived: count((f) => f.grade === 'WAIVED'),
    warn: count((f) => f.grade === 'WARN'),
    note: count((f) => f.grade === 'NOTE'),
    files: files.length,
    design: design ? relp(design.file) : null,
    scope: opts.scope,
  };
  summary.fail = summary.floorFail + summary.houseFail;
  const code = summary.fail > 0 || summary.reflex > 0 ? 1 : 0;

  let output;
  if (opts.json) output = JSON.stringify({ summary, findings }, null, 2);
  else {
    const lines = [];
    const shown = new Map();
    for (const f of findings) {
      const key = `${f.grade}|${f.gate}|${f.file}`;
      const n = (shown.get(key) || 0) + 1;
      shown.set(key, n);
      if (n <= FOLD_AFTER) lines.push(`${f.grade} ${f.gate} ${f.file}:${f.line} ${f.message} → ${f.fix}`);
      else if (n === FOLD_AFTER + 1) {
        const total = findings.filter((x) => `${x.grade}|${x.gate}|${x.file}` === key).length;
        lines.push(`${f.grade} ${f.gate} ${f.file} +${total - FOLD_AFTER} more`);
      }
    }
    lines.push(`slop_check: Floor ${summary.floorFail} FAIL · House ${summary.houseFail} FAIL (${summary.houseWaived} waived) · Reflex ${summary.reflex} REFLEX (${summary.reflexWaived} waived) · WARN ${summary.warn} · NOTE ${summary.note} · files ${summary.files} · design ${summary.design || 'none'}`);
    output = lines.join('\n');
  }
  return { code, findings, summary, output };
}

const invokedDirectly = (() => {
  try { return process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url; } catch { return false; }
})();
if (invokedDirectly) {
  const r = run(process.argv.slice(2));
  if (r.error) process.stderr.write(r.error + '\n');
  if (r.output) process.stdout.write(r.output + '\n');
  process.exitCode = r.code;
}
export const SCRIPT_PATH = fileURLToPath(import.meta.url);
