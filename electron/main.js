'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — electron/main.js — Production Build (v2.4)
//
//  Electron main process for desktop (Windows / Mac / Linux) build.
//  Features:
//    - Auto-update via electron-updater (GitHub Releases)
//    - CrashReporter to Sentry-compatible endpoint (stub)
//    - Optional Steam SDK integration via steamworks.js
//    - Code signing via electron-builder (see package.json build config)
//
//  Usage:
//    Development:   npm run electron:dev
//    Production:    npm run electron:build  → release/<platform>/
//    Code signing:  set CSC_LINK / CSC_KEY_PASSWORD (macOS) or
//                   WIN_CSC_LINK / WIN_CSC_KEY_PASSWORD (Windows)
// ═══════════════════════════════════════════════════════════════════════

const { app, BrowserWindow, ipcMain, crashReporter, dialog } = require('electron');
const path  = require('node:path');
const isDev = !app.isPackaged;

// ── Crash reporter (stub — replace submitURL with your endpoint) ─────────
crashReporter.start({
  productName:   'GLITCH·PEACE',
  companyName:   'glitch-peace',
  submitURL:     'https://example.com/crash-reports',   // replace before shipping
  uploadToServer: false,  // set true when a real endpoint is configured
  ignoreSystemCrashHandler: false,
  extra: { version: app.getVersion() },
});

// ── Optional auto-updater (electron-updater, GitHub Releases) ───────────
let autoUpdater = null;
if (!isDev) {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
    autoUpdater.autoDownload    = false;  // ask user first
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox({
        type:    'info',
        buttons: ['Download update', 'Later'],
        title:   'Update available',
        message: `GLITCH·PEACE ${info.version} is available. Download now?`,
      }).then(({ response }) => {
        if (response === 0) autoUpdater.downloadUpdate();
      });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type:    'info',
        buttons: ['Restart now', 'Later'],
        title:   'Update ready',
        message: 'Update downloaded. Restart to apply?',
      }).then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
    });

    autoUpdater.on('error', (err) => {
      console.warn('[AutoUpdater] error:', err.message);
    });
  } catch (_e) {
    // electron-updater not installed (optional dep)
    console.info('[AutoUpdater] not available');
  }
}

// ── Optional Steam SDK ───────────────────────────────────────────────────
let steam = null;
try {
  steam = require('steamworks.js');
} catch (_e) {
  // steamworks.js not bundled (web build / dev without Steam)
}

const GLITCH_PEACE_APP_ID = 480; // Replace with actual AppID once assigned

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
      sandbox:          true,   // enable renderer sandbox for security
    },
    title: 'GLITCH·PEACE',
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
    // Check for updates 3 s after launch
    if (autoUpdater) setTimeout(() => autoUpdater.checkForUpdates(), 3000);
  }

  win.setMenuBarVisibility(false);
  win.on('ready-to-show', () => win.show());

  // Forward unhandled renderer errors to crashReporter
  win.webContents.on('render-process-gone', (_e, details) => {
    console.error('[Renderer] process gone:', details.reason);
  });
}

// ── Steam SDK init ───────────────────────────────────────────────────────
function initSteam() {
  if (!steam) return;
  try {
    steam.init(GLITCH_PEACE_APP_ID);
    console.log('[Steam] SDK initialised — AppID', GLITCH_PEACE_APP_ID);
    ipcMain.handle('steam:unlockAchievement', (_evt, apiName) => {
      try { steam.achievement.activate(apiName); return true; } catch (_e) { return false; }
    });
    ipcMain.handle('steam:getPlayerName', () => {
      try { return steam.localplayer.getName(); } catch (_e) { return 'Dreamer'; }
    });
    ipcMain.handle('steam:getStats', () => {
      try { return { friends: steam.friends.getFriendCount(), level: steam.apps.getAppBuildId() }; }
      catch (_e) { return {}; }
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

