# Cloudflare Pages Configuration

## Build Settings for Cloudflare Pages:

### Framework preset: 
`None (Configure all settings manually)`

### Build command:
```bash
npm install && npm run build
```

### Build output directory:
```
dist
```

### Root directory:
```
/
```

### Node.js version:
```
18
```

## Environment Variables (Required):
```
VITE_SUPABASE_URL=https://ssbeycbrkfpxqdzlzhwa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzYmV5Y2Jya2ZweHFkemx6aHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzY1MTcsImV4cCI6MjA3NDkxMjUxN30.xGEbCfVmxdesLMDAhOAHhclCx0iC2XFp7RGz0TYAHVA
VITE_SUPABASE_PROJECT_ID=ssbeycbrkfpxqdzlzhwa
```

## Cloudflare Pages Compatible Build Command:
Since Cloudflare Pages uses `npm install` (not `npm ci`), the build should work with the current package.json structure.

## Alternative Build Commands:
If the standard build fails, try these:

1. `npm install --legacy-peer-deps && npm run build`
2. `npm install --no-optional && npm run build`

## Cloudflare Pages Deployment Steps:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to "Pages"
3. Click "Create a project"
4. Connect your GitHub account
5. Select the "rice-bloom-search" repository
6. Configure build settings as above
7. Add environment variables
8. Click "Save and Deploy"

## Expected Build Time:
2-4 minutes on Cloudflare Pages infrastructure.

## Notes:
- Cloudflare Pages automatically installs platform-specific dependencies
- The Linux-specific Rollup modules will be installed automatically during deployment
- No need for manual platform-specific configuration