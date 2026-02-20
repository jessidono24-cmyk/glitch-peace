'use strict';
// ═══════════════════════════════════════════════════════════════════════
//  GLITCH·PEACE — electron/preload.js
//
//  Exposes safe Electron + Steam APIs to the renderer via contextBridge.
//  Only whitelisted APIs are accessible — no raw Node.js access.
// ═══════════════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Steam achievements ─────────────────────────────────────────────
  unlockAchievement: (apiName) => ipcRenderer.invoke('steam:unlockAchievement', apiName),
  getPlayerName:     ()        => ipcRenderer.invoke('steam:getPlayerName'),

  // ── Desktop info ──────────────────────────────────────────────────
  platform:  process.platform,
  isElectron: true,
});
