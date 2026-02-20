// build/notarize.js — macOS notarization afterSign hook for electron-builder
// ─────────────────────────────────────────────────────────────────────────────
//  Required environment variables (set in CI / local keychain):
//    APPLE_ID            — your Apple ID email (notarization submitter)
//    APPLE_APP_SPECIFIC_PASSWORD — app-specific password generated at appleid.apple.com
//    APPLE_TEAM_ID       — your 10-char Apple Developer Team ID
//
//  Install the notarize package before shipping:
//    npm install --save-dev @electron/notarize
//
//  electron-builder calls this script automatically after code-signing
//  when building for macOS (triggered by the "afterSign" key in package.json).
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const path = require('node:path');

exports.default = async function notarize(context) {
  const { electronPlatformName, appOutDir, packager } = context;

  // Only notarize on macOS builds
  if (electronPlatformName !== 'darwin') return;

  // Skip if credentials are not configured (e.g. local dev builds)
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD || !process.env.APPLE_TEAM_ID) {
    console.log('[notarize] Skipping — APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID not set.');
    return;
  }

  let notarize;
  try {
    ({ notarize } = require('@electron/notarize'));
  } catch (_e) {
    console.warn('[notarize] @electron/notarize not installed. Run: npm install --save-dev @electron/notarize');
    return;
  }

  const appName = packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`[notarize] Submitting ${appPath} to Apple notarization service…`);

  await notarize({
    tool:     'notarytool',
    appPath,
    appleId:          process.env.APPLE_ID,
    appleIdPassword:  process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId:           process.env.APPLE_TEAM_ID,
  });

  console.log('[notarize] Notarization complete.');
};
