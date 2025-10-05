# Cloudflare Pages Configuration

## Build Settings for Cloudflare Pages Dashboard

When setting up your project in Cloudflare Pages, use these settings:

### Build Configuration
- **Build command**: `npm install && npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (default)

### Environment Variables
Add these in the Cloudflare Pages dashboard:

```
NODE_VERSION=18
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here  
VITE_SUPABASE_PROJECT_ID=your_project_id_here
```

### Build Settings Override
If the automatic detection fails, manually set:
- **Framework preset**: None (or Vite)
- **Build command**: `npm install && npm run build`
- **Output directory**: `dist`

## Troubleshooting Common Issues

### Issue 1: "lockfile had changes, but lockfile is frozen"
**Solution**: The build system detected bun.lockb but tried to use npm. This has been fixed by:
- Removing bun.lockb file
- Regenerating package-lock.json with npm
- Adding explicit npm configuration

### Issue 2: "Cannot find module @rollup/rollup-linux-x64-gnu"
**Solution**: This is an npm optional dependencies bug. Fixed by:
- Using `npm install` instead of `npm ci` in build command
- This allows npm to properly install optional dependencies

### Issue 3: Build command not found
**Solution**: Use `npm install && npm run build` instead of just `npm run build`

### Issue 4: Environment variables not working
**Solution**: Make sure all VITE_ prefixed variables are set in Cloudflare Pages dashboard

## Manual Build Test
To test locally before deploying:
```bash
npm ci
npm run build
```

The `dist` folder should be created with all built files.