'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — electron/main.js — Steam Packaging (Phase 8)
//
//  Electron main process for desktop (Windows / Mac / Linux) build.
//  Wraps the Vite-built dist/ in a BrowserWindow, optionally connecting
//  to the Steam SDK via steamworks.js when running through Steam.
//
//  Usage:
//    Development:  npm run electron:dev
//    Production:   npm run electron:build  (creates installer in release/)
// ═══════════════════════════════════════════════════════════════════════

const { app, BrowserWindow, ipcMain } = require('electron');
const path  = require('node:path');
const isDev = !app.isPackaged;

// Optional Steam integration — steamworks.js is loaded only when available
let steam = null;
try {
  steam = require('steamworks.js');
} catch (_e) {
  // steamworks.js not bundled (web build / dev without Steam)
}

const GLITCH_PEACE_APP_ID = 480; // Use Valve test AppID until real AppID assigned

function createWindow() {
  const win = new BrowserWindow({
    width:          854,
    height:         640,
    minWidth:       640,
    minHeight:      480,
    frame:          true,
    icon:           path.join(__dirname, '../dist/icon.png'),
    backgroundColor: '#01010a',
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      preload:          path.join(__dirname, 'preload.js'),
    },
    title: 'GLITCH·PEACE',
  });

  // Load the Vite build (production) or dev server
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.setMenuBarVisibility(false);
  win.on('ready-to-show', () => win.show());
}

// ── Steam SDK init ───────────────────────────────────────────────────────
function initSteam() {
  if (!steam) return;
  try {
    steam.init(GLITCH_PEACE_APP_ID);
    console.log('[Steam] SDK initialised — AppID', GLITCH_PEACE_APP_ID);
    // Expose achievement unlock via IPC
    ipcMain.handle('steam:unlockAchievement', (_evt, apiName) => {
      try { steam.achievement.activate(apiName); return true; } catch (_e) { return false; }
    });
    ipcMain.handle('steam:getPlayerName', () => {
      try { return steam.localplayer.getName(); } catch (_e) { return 'Dreamer'; }
    });
  } catch (e) {
    console.warn('[Steam] SDK init failed:', e.message);
  }
}

app.whenReady().then(() => {
  initSteam();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (steam) { try { steam.runCallbacks(); } catch (_e) {} }
  if (process.platform !== 'darwin') app.quit();
});
