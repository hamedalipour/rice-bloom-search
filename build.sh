# Deployment Build Script
# This script handles the Rollup dependency issue

echo "🔧 Fixing Rollup dependency issue..."

# Remove problematic files
rm -rf node_modules package-lock.json

# Install with specific flags to avoid the npm bug
npm install --no-optional --legacy-peer-deps

# Install Rollup dependencies manually if needed
npm install @rollup/rollup-linux-x64-gnu --save-dev --no-optional

# Run the build
npm run build

echo "✅ Build completed!"