import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain, runDemoCli } from '../../scripts/validate_demo.mjs';

export const config = {
  name: 'marble-note',
  staticFiles: ['index.html', 'styles.css', 'script.js'],
  htmlMustNotMatch: [
    { pattern: /https?:\/\//, message: 'Demo must not depend on remote URLs' },
    { pattern: /<span class="status-icons"><i>/, message: 'Status icons must use explicit SVG geometry' },
  ],
  htmlMustMatch: [
    { pattern: /data-go="home"/, message: 'Missing home click path' },
    { pattern: /data-go="meeting"/, message: 'Missing meeting click path' },
    { pattern: /data-view="search"/, message: 'Missing search view' },
    { pattern: /data-view="create"/, message: 'Missing create view' },
    { pattern: /data-view="schedule"/, message: 'Missing schedule view' },
    { pattern: /data-view="settings"/, message: 'Missing settings view' },
    { pattern: /dynamic-island/, message: 'Missing iOS Dynamic Island frame detail' },
  ],
  desktopViewport: { width: 1280, height: 960 },
  mobileViewport: { width: 390, height: 860 },
  readyExpression: 'document.readyState === "complete" && !!document.querySelector(".phone.is-active") && !!document.querySelector(".app-view.is-visible")',
  steps: [
    { name: 'initial', expression: 'document.querySelector(".phone.is-active").dataset.screen', expect: 'cover' },
    { name: 'afterHome', expression: 'document.querySelector("[data-screen=cover] [data-go=home]").click(), document.querySelector(".phone.is-active").dataset.screen', expect: 'home' },
    { name: 'afterSearch', expression: 'document.querySelector("[data-view-target=search]").click(), document.querySelector(".app-view.is-visible").dataset.view', expect: 'search' },
    { name: 'afterCreate', expression: 'document.querySelector(".dock [data-view-target=create]").click(), document.querySelector(".app-view.is-visible").dataset.view', expect: 'create' },
    { name: 'afterSchedule', expression: 'document.querySelector(".dock [data-view-target=home]").click(), document.querySelector(".schedule").click(), document.querySelector(".app-view.is-visible").dataset.view', expect: 'schedule' },
    { name: 'afterSettings', expression: 'document.querySelector(".dock [data-view-target=settings]").click(), document.querySelector(".app-view.is-visible").dataset.view', expect: 'settings' },
    { name: 'afterFolder', expression: 'document.querySelector("[data-view=settings] [data-view-target=home]").click(), document.querySelector(".folder-card").click(), document.querySelector(".app-view.is-visible").dataset.view', expect: 'folder' },
    { name: 'afterMeeting', expression: 'document.querySelector("[data-view=folder] [data-go=meeting]").click(), document.querySelector(".phone.is-active").dataset.screen', expect: 'meeting' },
    { name: 'brokenImages', expression: 'Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).length', expect: 0 },
    { name: 'dynamicIslands', expression: 'document.querySelectorAll(".dynamic-island").length', expect: 3 },
    { name: 'statusSvgCount', expression: 'document.querySelectorAll(".status-icons svg").length', expect: 9 },
    { name: 'appViewCount', expression: 'document.querySelectorAll(".app-view").length', expect: { op: '>=', value: 6 } },
  ],
};

const demoDir = path.dirname(fileURLToPath(import.meta.url));
if (isMain(import.meta.url)) process.exitCode = await runDemoCli(config, demoDir);
