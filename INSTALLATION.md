# GLITCH·PEACE Installation Guide

Welcome to GLITCH·PEACE! This guide will help you download, install, and run the game on your computer.

## Quick Start (Easiest Method)

### For End Users - Just Play the Game

1. **Download the game files:**
   - Go to the [GitHub repository](https://github.com/jessidono24-cmyk/glitch-peace)
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract the ZIP file to your computer
   - ⚠️ **IMPORTANT:** Extract to a folder path WITHOUT SPACES
     - ✅ Good: `C:\glitch-peace` or `C:\Games\glitch-peace`
     - ❌ Bad: `C:\New folder\glitch-peace` or `C:\My Games\glitch-peace`

2. **Run the game:**
   - Navigate to the extracted folder
   - Open the `dist` folder
   - Double-click `index.html`
   - The game will open in your default browser!

**That's it!** No installation, no dependencies, just play.

---

## Detailed Installation Methods

### Method 1: Pre-built Version (Recommended for Testing)

**What you need:**
- A modern web browser (Chrome, Firefox, Safari, Edge)

**Steps:**
1. Download the repository as ZIP (see Quick Start above)
2. Extract to any folder on your computer
3. Navigate to the `dist/` folder inside
4. Open `index.html` in your browser

**Advantages:**
- ✅ No installation required
- ✅ Works offline
- ✅ Instant startup
- ✅ Smallest download (96KB)

**Note:** If double-clicking doesn't work, try:
- Right-click `index.html` → Open with → Your browser
- Or drag `index.html` into an open browser window

---

### Method 2: Clone with Git (For Developers)

**What you need:**
- Git installed
- Node.js (v18 or higher)
- npm (comes with Node.js)

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jessidono24-cmyk/glitch-peace.git
   cd glitch-peace
   ```
   
   ⚠️ **IMPORTANT:** Clone to a path WITHOUT SPACES in the folder name
   - ✅ Good: `C:\projects\glitch-peace`
   - ❌ Bad: `C:\My Projects\glitch-peace`

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   **Troubleshooting:** If you get errors, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Go to `http://localhost:5173` (or the URL shown in terminal)

**Advantages:**
- ✅ Hot-reload (instant updates when editing code)
- ✅ Full development environment
- ✅ Can contribute to the project
- ✅ Latest updates via `git pull`

---

### Method 3: Build from Source

**What you need:**
- Node.js (v18 or higher)
- npm (comes with Node.js)

**Steps:**

1. **Download and extract:**
   - Download ZIP from GitHub
   - Extract to a folder WITHOUT SPACES in the path
   - ⚠️ **Important:** Use paths like `C:\glitch-peace` not `C:\New folder\glitch-peace`

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   **If you get errors:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions

2. **Install dependencies:**
   ```bash
   cd glitch-peace
   npm install
   ```

3. **Build production version:**
   ```bash
   npm run build
   ```

4. **Run the built version:**
   - Navigate to `dist/` folder
   - Open `index.html` in browser

**Advantages:**
- ✅ Latest optimized build
- ✅ Can customize and rebuild
- ✅ Smallest file size for deployment

---

## Running with a Local Server (Optional)

For best results, especially when testing features, you may want to run a local web server:

### Using Python (if installed):
```bash
cd dist
python -m http.server 8000
```
Then open: `http://localhost:8000`

### Using Node.js:
```bash
npx serve dist
```
Then open the URL shown in terminal.

### Using npm dev server:
```bash
npm run dev
```
Automatically opens with hot-reload enabled.

---

## System Requirements

**Minimum:**
- Modern web browser (2020 or newer)
- JavaScript enabled
- 1GB RAM
- Any operating system (Windows, Mac, Linux)

**Recommended:**
- Chrome or Edge (best performance)
- 2GB+ RAM
- Desktop or laptop (mobile works but keyboard recommended)

**Browser Support:**
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

---

## Game Controls

**Grid Mode:**
- **WASD** or **Arrow Keys**: Move player
- **Shift**: Toggle Matrix A/B
- **J**: Use archetype power
- **R**: Glitch pulse
- **Q**: Freeze enemies
- **C**: Containment zone
- **Escape**: Pause menu

**Shooter Mode:**
- **WASD**: Move (continuous)
- **Mouse**: Aim
- **Left Click**: Shoot
- **M** (on title screen): Switch modes
- **Escape**: Pause menu

---

## Troubleshooting

### Game won't start
- Make sure JavaScript is enabled in your browser
- Try a different browser (Chrome recommended)
- Check browser console (F12) for error messages

### Black screen or crashes
- Refresh the page (F5 or Ctrl+R)
- Clear browser cache
- Update your browser to latest version
- Check if hardware acceleration is enabled

### Performance issues
- Close other browser tabs
- Use Chrome or Edge for best performance
- Lower browser zoom level
- Update graphics drivers

### Files won't download
- Check your antivirus/firewall settings
- Try downloading from a different browser
- Download as ZIP instead of individual files

---

## Deployment Options

### Deploy to Your Own Website

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to your web hosting:**
   - FTP/SFTP upload
   - Or use hosting platform's file manager
   - Point domain to `dist/index.html`

### Deploy to GitHub Pages

1. **Push to GitHub**
2. **Go to Settings → Pages**
3. **Select source:** Deploy from branch
4. **Choose branch:** main or your branch
5. **Select folder:** `/docs` or `/` (root)
6. **Save and wait for deployment**

### Deploy to Netlify/Vercel (One-Click)

1. **Sign up for free account**
2. **Connect GitHub repository**
3. **Configure build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy automatically**

---

## File Structure

```
glitch-peace/
├── dist/                    # Built game files (ready to play)
│   ├── index.html          # Open this to play!
│   └── assets/             # Bundled JavaScript
├── src/                     # Source code
│   ├── modes/              # Game modes (Grid, Shooter)
│   ├── core/               # Core systems
│   ├── game/               # Game logic
│   ├── ui/                 # User interface
│   ├── systems/            # Consciousness systems
│   ├── audio/              # Sound engine
│   └── main.js             # Entry point
├── docs/                    # Documentation
├── index.html              # Development entry
├── package.json            # Node.js config
└── vite.config.js          # Build config
```

---

## Updates and Contributions

### Get Latest Version
```bash
git pull origin main
npm install
npm run build
```

### Report Issues
- Go to GitHub Issues
- Describe the problem
- Include browser/OS info
- Add screenshots if possible

### Contribute
- Fork the repository
- Make your changes
- Submit a pull request
- Follow the coding style in existing files

---

## Additional Resources

- **Documentation:** See `docs/` folder
- **Architecture:** Read `docs/ARCHITECTURE.md`
- **Roadmap:** Check `docs/ROADMAP.md`
- **Vision:** See `COMPREHENSIVE_RESEARCH_SESSION.md`

---

## Support

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Review the documentation in `docs/`
3. Open an issue on GitHub
4. Include detailed error messages and steps to reproduce

---

## License

See LICENSE.md for licensing information.

---

**Enjoy playing GLITCH·PEACE!** 🎮✨

*A consciousness-awakening, multidimensional exploration platform.*
