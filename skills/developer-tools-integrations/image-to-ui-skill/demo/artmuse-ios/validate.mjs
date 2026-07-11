import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain, runDemoCli } from '../../scripts/validate_demo.mjs';

export const config = {
  name: 'artmuse-ios',
  staticFiles: ['index.html', 'styles.css', 'script.js'],
  htmlMustNotMatch: [{ pattern: /https?:\/\//, message: 'Demo must not depend on remote image URLs' }],
  htmlMustMatch: [
    { pattern: /\.\/assets\/starry-night\.svg/, message: 'Missing local Starry Night asset reference' },
    { pattern: /\.\/assets\/memory\.svg/, message: 'Missing local Memory asset reference' },
    { pattern: /\.\/assets\/pearl\.svg/, message: 'Missing local Pearl asset reference' },
  ],
  desktopViewport: { width: 1728, height: 960 },
  mobileViewport: { width: 390, height: 860 },
  readyExpression: 'document.readyState === "complete" && !!document.querySelector(".phone.is-active")',
  steps: [
    { name: 'initial', expression: 'document.querySelector(".phone.is-active").dataset.screen', expect: 'home' },
    { name: 'afterExhibitions', expression: 'document.querySelector("[data-screen=home] [data-go=exhibitions]").click(), document.querySelector(".phone.is-active").dataset.screen', expect: 'exhibitions' },
    { name: 'afterDetail', expression: 'document.querySelector("[data-screen=exhibitions] [data-go=detail]").click(), document.querySelector(".phone.is-active").dataset.screen', expect: 'detail' },
    { name: 'brokenImages', expression: 'Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).length', expect: 0 },
  ],
};

const demoDir = path.dirname(fileURLToPath(import.meta.url));
if (isMain(import.meta.url)) process.exitCode = await runDemoCli(config, demoDir);
