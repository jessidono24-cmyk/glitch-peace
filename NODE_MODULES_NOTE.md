# Node Modules Note

## Important: Dependencies in Repository Root

Several files and directories in the repository root are actually from `node_modules` and should NOT be tracked in git:

### Files to exclude (from postcss, nanoid, picocolors, vite, rollup, esbuild):
- `esbuild`, `esbuild.cmd`, `esbuild.exe`, `esbuild.ps1`
- `index.browser.cjs`, `index.browser.js`, `index.cjs`, `index.d.ts`, `index.js`
- `index.d.cts`
- `install.js`
- `nanoid`, `nanoid.cmd`, `nanoid.js`, `nanoid.ps1`
- `picocolors.browser.js`, `picocolors.d.ts`, `picocolors.js`
- `posix.js`
- `rollup`, `rollup.cmd`, `rollup.ps1`
- `types.d.ts`
- `vite`, `vite.cmd`, `vite.ps1`

### Directories to exclude:
- `lib/` (from postcss)
- `async/` (from nanoid)
- `bin/` (from esbuild)
- `dist/` (build output - already in .gitignore)
- `estree/` (from rollup)
- `non-secure/` (from nanoid)
- `rollup-win32-x64-gnu/` (from rollup)
- `rollup-win32-x64-msvc/` (from rollup)
- `url-alphabet/` (from nanoid)

## Solution

These files should be removed from the repository and instead installed via `npm install`. They are already tracked in `package.json` as dependencies.

To clean up (DO NOT RUN THIS YET - for reference):
1. Back up the repository
2. Delete these files/folders from git tracking
3. Run `npm install` to reinstall them in `node_modules/` where they belong
4. The `.gitignore` file now includes `node_modules/` to prevent this issue

## Current Structure

The game source files are now properly organized in:
- `src/` - All game source code
  - `src/main.js` - Entry point
  - `src/core/` - Core systems (state, constants, utils, storage)
  - `src/game/` - Game logic (grid, player, enemy, particles)
  - `src/systems/` - Advanced systems (emotional-engine, temporal-system)
  - `src/ui/` - UI rendering (renderer, menus)
- `docs/` - Documentation files
- `index.html` - Entry HTML file
- `vite.config.js` - Build configuration
- `package.json` - Project dependencies
