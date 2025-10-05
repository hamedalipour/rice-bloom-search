# Faster Build Configuration

## Quick Deployment Settings

### Build Command (Simple):
```
npm run build
```

### Install Command:
```
npm install
```

### Output Directory:
```
dist
```

### Node Version:
```
18
```

### Root Directory:
```
/
```

## Environment Variables:
```
VITE_SUPABASE_URL=https://ssbeycbrkfpxqdzlzhwa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzYmV5Y2Jya2ZweHFkemx6aHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzY1MTcsImV4cCI6MjA3NDkxMjUxN30.xGEbCfVmxdesLMDAhOAHhclCx0iC2XFp7RGz0TYAHVA
VITE_SUPABASE_PROJECT_ID=ssbeycbrkfpxqdzlzhwa
```

## Platform Settings:

### Vercel:
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Netlify:
- Build Command: `npm run build`
- Publish Directory: `dist`
- Package Manager: npm

### Cloudflare Pages:
- Build Command: `npm run build`
- Build Output Directory: `dist`
- Root Directory: `/`

## If Build Still Fails:
Try these alternative commands:

1. `npm install --legacy-peer-deps && npm run build`
2. `npm install --force && npm run build` 
3. `yarn install && yarn build`

## Build Time Optimization:
The simplified config should build in 2-3 minutes instead of 7+ minutes.