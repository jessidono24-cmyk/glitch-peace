#!/bin/bash

# GLITCH·PEACE Distribution Builder
# Creates a downloadable package for end users

echo "🎮 Building GLITCH·PEACE distribution..."

# Build the project
echo "📦 Building production files..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create distribution directory
DIST_DIR="glitch-peace-playable"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Copy built files
echo "📋 Copying built files..."
cp -r dist/* "$DIST_DIR/"

# Copy documentation
echo "📄 Copying documentation..."
cp INSTALLATION.md "$DIST_DIR/"
cp README.md "$DIST_DIR/"
cp LICENSE.md "$DIST_DIR/"

# Create a simple README for the distribution
cat > "$DIST_DIR/START_HERE.txt" << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                      GLITCH·PEACE                              ║
║              A Consciousness Exploration Game                  ║
╚════════════════════════════════════════════════════════════════╝

HOW TO PLAY:
1. Open "index.html" in your web browser
2. That's it! No installation needed.

CONTROLS:
- Press M on title screen to switch between Grid and Shooter modes
- ESC to pause
- See INSTALLATION.md for detailed controls

TROUBLESHOOTING:
- If it doesn't open, right-click index.html → Open With → Your Browser
- Or drag index.html into an open browser window
- Works best in Chrome, Edge, or Firefox

MORE INFO:
- See INSTALLATION.md for full instructions
- See README.md for game information
- Visit GitHub: https://github.com/jessidono24-cmyk/glitch-peace

Enjoy! 🎮✨
EOF

# Create ZIP archive
echo "🗜️  Creating ZIP archive..."
zip -r "${DIST_DIR}.zip" "$DIST_DIR"

# Show results
echo ""
echo "✅ Distribution created successfully!"
echo ""
echo "📦 Package: ${DIST_DIR}.zip"
echo "📏 Size: $(du -h "${DIST_DIR}.zip" | cut -f1)"
echo ""
echo "📁 Folder: ${DIST_DIR}/"
echo ""
echo "To distribute:"
echo "  - Share ${DIST_DIR}.zip"
echo "  - Users extract and open index.html"
echo ""
echo "🎉 Done!"
