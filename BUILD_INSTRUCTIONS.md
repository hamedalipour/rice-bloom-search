# Deployment Instructions for Cloudflare Pages / Vercel / Netlify

## Build Settings

### Build Command:
```bash
npm run build
```

### Build Output Directory:
```
dist
```

### Node.js Version:
```
18.x or higher (recommended: 20.x)
```

### Environment Variables Required:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

## Platform-Specific Instructions

### Vercel
1. Connect GitHub repository
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Install Command: `npm ci`
6. Node.js Version: `20.x`

### Netlify
1. Build Command: `npm ci && npm run build`
2. Publish Directory: `dist`
3. Node Version: `20`

### Cloudflare Pages
1. Build Command: `npm ci && npm run build`
2. Build Output Directory: `dist`
3. Root Directory: `/`
4. Node.js Version: `20.x`

## Troubleshooting Build Issues

### Rollup Module Error
If you see "Cannot find module @rollup/rollup-linux-x64-gnu":

1. **Delete node_modules and package-lock.json**
2. **Run:** `npm ci`
3. **Then run:** `npm run build`

### Alternative Build Commands (if main fails):
```bash
# Option 1: Clean install
rm -rf node_modules package-lock.json
npm install
npm run build

# Option 2: Force reinstall
npm ci --force
npm run build

# Option 3: Skip optional deps
npm ci --omit=optional
npm run build
```

### Memory Issues
If build fails due to memory issues, add to environment variables:
```
NODE_OPTIONS=--max-old-space-size=4096
```

## Post-Deployment Checklist

✅ **Test admin login**: `/admin`
- Email: `hamedalipour38@gmail.com`
- Password: `hamed69JOON`

✅ **Test product management**: `/admin/products`

✅ **Test public pages**: `/`, `/shop`, `/about`

✅ **Check mobile responsiveness**

✅ **Verify environment variables are set correctly**