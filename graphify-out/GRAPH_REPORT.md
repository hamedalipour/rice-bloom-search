# Graph Report - rice-bloom-search  (2026-09-25)

## Corpus Check
- 146 files · ~334,529 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .jfif 5, (none) 4, .xml 2)

## Summary
- 876 nodes · 1631 edges · 80 communities (50 shown, 30 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core App & Routing
- Package Dependencies
- Radix UI Primitives
- Breadcrumb & Menu UI
- Form & Layout Components
- Content Scripts
- Toast Notifications
- Local Admin Server
- Dialog Components
- Package Metadata
- UI Components Mixed
- TSConfig App
- Dev Dependencies
- Command Palette
- Path Aliases
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78

## God Nodes (most connected - your core abstractions)
1. `cn()` - 226 edges
2. `react` - 57 edges
3. `lucide-react` - 33 edges
4. `useSEO()` - 26 edges
5. `compilerOptions` - 20 edges
6. `Button` - 16 edges
7. `react-router-dom` - 14 edges
8. `Navbar()` - 14 edges
9. `compilerOptions` - 14 edges
10. `Card` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Rice Bloom Search / فروشگاه برنج آنلاین project` --semantically_similar_to--> `Atre Shalizar (عطر شالیزار) store`  [AMBIGUOUS] [semantically similar]
  README.md → index.html
- `build job (checkout, npm ci, npm run build, upload ./dist)` --semantically_similar_to--> `Build command: npm run build`  [INFERRED] [semantically similar]
  .github/workflows/deploy.yml → BUILD_INSTRUCTIONS.md
- `Publish tab: git commit + push triggers GitHub Actions` --references--> `deploy.yml (Deploy to GitHub Pages workflow)`  [INFERRED]
  README.md → .github/workflows/deploy.yml
- `GitHub Pages deployment instructions` --references--> `deploy.yml (Deploy to GitHub Pages workflow)`  [INFERRED]
  README.md → .github/workflows/deploy.yml
- `Admin panel credentials (hamedalipour38@gmail.com)` --semantically_similar_to--> `Post-deployment checklist`  [INFERRED] [semantically similar]
  DEPLOYMENT_GUIDE.md → BUILD_INSTRUCTIONS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Deployment pipeline documentation and CI workflow** — github_workflows_deploy, build_instructions, quick_deploy, cloudflare_pages, deployment_guide [INFERRED 0.75]
- **Local admin content-to-deploy publish workflow** — panel_index_admin_panel, readme_local_admin_panel, readme_products_json, readme_blogposts_json, readme_github_actions_publish, github_workflows_deploy [INFERRED 0.75]
- **SEO and search-engine ownership configuration** — index_seo_meta_tags, index_schema_org_structured_data, index_canonical_domain, index_bing_verification, public_robots_crawl_rules, public_robots_sitemap_ref, public_atre_shalizar_idxnow_7f3a9c2e5b8d416a_token [INFERRED 0.75]

## Communities (80 total, 30 thin omitted)

### Community 0 - "Core App & Routing"
Cohesion: 0.06
Nodes (85): lucide-react, next-themes, react-router-dom, sonner, @tanstack/react-query, About, Blog, BlogPost (+77 more)

### Community 1 - "Package Dependencies"
Cohesion: 0.04
Nodes (55): dependencies, class-variance-authority, clsx, cmdk, cors, date-fns, embla-carousel-react, express (+47 more)

### Community 2 - "Radix UI Primitives"
Cohesion: 0.06
Nodes (30): clsx, @radix-ui/react-checkbox, @radix-ui/react-hover-card, @radix-ui/react-popover, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-slider (+22 more)

### Community 3 - "Breadcrumb & Menu UI"
Cohesion: 0.09
Nodes (37): @radix-ui/react-menubar, @radix-ui/react-slot, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage (+29 more)

### Community 4 - "Form & Layout Components"
Cohesion: 0.06
Nodes (34): Input, Separator, src_components_ui_sheet_sheet, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+26 more)

### Community 5 - "Content Scripts"
Cohesion: 0.06
Nodes (30): ref_fs, fs, newPost, NOW, path, posts, POSTS_FILE, categoryRoutes (+22 more)

### Community 6 - "Toast Notifications"
Cohesion: 0.11
Nodes (26): @radix-ui/react-toast, Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, src_components_ui_toast_toastprovider (+18 more)

### Community 7 - "Local Admin Server"
Cohesion: 0.09
Nodes (24): app, ASSET_DIRS, cors, crypto, DATA_FILES, ensureAssetDir(), { execFile }, express (+16 more)

### Community 8 - "Dialog Components"
Cohesion: 0.09
Nodes (22): @radix-ui/react-alert-dialog, react-day-picker, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader() (+14 more)

### Community 9 - "Package Metadata"
Cohesion: 0.08
Nodes (23): description, name, private, type, version, autoprefixer, concurrently, date-fns (+15 more)

### Community 10 - "UI Components Mixed"
Cohesion: 0.11
Nodes (20): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, Alert, AlertDescription, AlertTitle, alertVariants (+12 more)

### Community 11 - "TSConfig App"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+13 more)

### Community 12 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): devDependencies, autoprefixer, concurrently, dotenv, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+13 more)

### Community 13 - "Command Palette"
Cohesion: 0.10
Nodes (18): cmdk, @radix-ui/react-dialog, Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem (+10 more)

### Community 14 - "Path Aliases"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (14): @radix-ui/react-label, react-hook-form, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (13): panel/index.html (local admin panel), Local admin panel UI (پنل مدیریت عطر شالیزار), Image assets management tab, Blog management tab, Panel HTTP API endpoints (/api/data, /api/products/*, /api/blog/*, /api/upload/*, /api/assets/*), Products management tab, ASSETS_MANAGEMENT_GUIDE.md reference, .index.json asset index (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (11): index.html (site entry), Atre Shalizar (عطر شالیزار) store, Bing Webmaster Tools verification, Canonical domain atre-shalizar.ir, Enamad trust seal (trustseal.enamad.ir), schema.org Store/WebSite structured data, SEO meta tags (title, description, keywords, robots), idxnow verification token (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (10): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, baseUrl, noImplicitAny, noUnusedLocals, noUnusedParameters, paths, skipLibCheck (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.24
Nodes (9): Build command: npm run build, Netlify build settings, Build output directory: dist, Post-deployment checklist, Vercel build settings, Admin panel credentials (hamedalipour38@gmail.com), GitHub repository rice-bloom-search, Netlify deployment guide (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (11): scripts, build, build:cf, build:dev, build:prod, dev, dev:full, lint (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (9): lovable-tagger, ref_path, sharp, vite, @vitejs/plugin-react-swc, fs, jobs, path (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (10): @radix-ui/react-context-menu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (10): @radix-ui/react-dropdown-menu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut() (+2 more)

### Community 27 - "Community 27"
Cohesion: 0.24
Nodes (9): deploy.yml (Deploy to GitHub Pages workflow), build job (checkout, npm ci, npm run build, upload ./dist), deploy job (actions/deploy-pages@v4), GitHub Pages, npm run build, /api/git/publish endpoint, Git publish tab (انتشار در گیت‌هاب), SPA redirect fallback for GitHub Pages (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.27
Nodes (9): AssetSelector component, Products and User Profiles database schema, GitHub Pages deployment instructions, ImageUpload component, ProductForm component, React 18 + TypeScript + Vite tech stack, Rice Bloom Search / فروشگاه برنج آنلاین project, RLS policy fix (SIMPLE_FIX_RLS_CORRECTED.sql) (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (7): Cloudflare Pages build settings, VITE_SUPABASE_* environment variables, Cloudflare Pages build settings (npm install && npm run build), Cloudflare Pages deployment steps, Supabase project ssbeycbrkfpxqdzlzhwa, npm run build:safe, Fallback build commands

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (7): vaul, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 32 - "Community 32"
Cohesion: 0.39
Nodes (8): Brewed tea in glass, Product photo - Iranian Saghdar black tea, Iranian tea, Loose-leaf black tea, Natural taste, no additives claim, Premium quality from famous farms claim, Saghdar Tea, Tea plantation background

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (7): Database, DatabaseWithoutInternals, DefaultSchema, Json, Tables, TablesInsert, TablesUpdate

### Community 34 - "Community 34"
Cohesion: 0.38
Nodes (7): 100% طبیعی و خالص (100% natural and pure) claim, چای سیاه (Chai Siah) black tea, مناسب برای تمام روز (suitable for all day) claim, انتخابی سالم برای لحظات خوب (healthy choice for good moments) badge, Chai Siah (Black Tea) product photo, طعم اصیل، اثر طبیعی (authentic taste, natural effect) tagline, طعم غنی و دلپذیر (rich and pleasant taste) claim

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (5): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, typescript-eslint

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (5): input-otp, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 37 - "Community 37"
Cohesion: 0.47
Nodes (4): blogCategories, BlogPostRow, blogPosts, BlogPost

### Community 38 - "Community 38"
Cohesion: 0.60
Nodes (5): Correct tea brewing method (روش صحیح دم کردن), Brewing tips: water quality, steeping time, pure tea buds, Chai Lahijan Chist promotional image, Iranian tea (چای ایرانی), Lahijan tea region association

### Community 39 - "Community 39"
Cohesion: 0.60
Nodes (5): Damnoosh-e Aramesh brand name, Herbal tea / damnoosh, damnoosh.svg product image (damnoosh-e aramesh), Purple gradient visual palette, Relaxation / tranquility

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (5): Fajr rice product photo, Fajr rice variety, Fajr rice bowl photo, Fajr rice source image, Fajr cooked rice source

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (5): Hashemi rice product photo, Hashemi rice variety, Hashemi rice bowl photo, Hashemi rice source image, Hashemi cooked rice source

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (5): Shirodi rice bowl photo, Shirodi rice product photo, Shirodi rice variety, Shirodi cooked rice source, Shirodi rice source image

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (5): Tarom rice bowl photo, Tarom rice product photo, Tarom rice variety, Tarom cooked rice source, Tarom rice source image

### Community 44 - "Community 44"
Cohesion: 0.40
Nodes (4): @radix-ui/react-accordion, AccordionContent, AccordionItem, AccordionTrigger

### Community 45 - "Community 45"
Cohesion: 0.40
Nodes (4): @radix-ui/react-avatar, Avatar, AvatarFallback, AvatarImage

### Community 46 - "Community 46"
Cohesion: 0.40
Nodes (4): react-dom, App(), src_index, spaRedirect

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (4): About Us Photo - rice cooker and cooked rice kitchen scene, Bowl of cooked white rice, Warm home kitchen scene with window and wooden utensils, Stainless steel rice cooker with Arabic-script control panel

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (3): engines, node, npm

### Community 49 - "Community 49"
Cohesion: 1.00
Nodes (3): Green tea cup illustration (Spring green tea from Gilan), Spring green tea from Gilan (product), Visual attributes: green gradient background, white cup with green tea surface, leaf emoji, Persian text label

## Ambiguous Edges - Review These
- `README.md` → `ASSETS_MANAGEMENT_GUIDE.md reference`  [AMBIGUOUS]
  public/assets/README.md · relation: conceptually_related_to
- `Rice Bloom Search / فروشگاه برنج آنلاین project` → `Atre Shalizar (عطر شالیزار) store`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to
- `Iranian tea (چای ایرانی)` → `Lahijan tea region association`  [AMBIGUOUS]
  public/assets/chai-lahijan-chist.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **327 isolated node(s):** `build.sh script`, `$schema`, `style`, `rsc`, `tsx` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `README.md` and `ASSETS_MANAGEMENT_GUIDE.md reference`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Rice Bloom Search / فروشگاه برنج آنلاین project` and `Atre Shalizar (عطر شالیزار) store`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Iranian tea (چای ایرانی)` and `Lahijan tea region association`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Radix UI Primitives` to `Core App & Routing`, `Breadcrumb & Menu UI`, `Form & Layout Components`, `Toast Notifications`, `Dialog Components`, `Package Metadata`, `UI Components Mixed`, `Command Palette`, `Community 15`, `Community 17`, `Community 20`, `Community 25`, `Community 26`, `Community 30`, `Community 31`, `Community 36`, `Community 37`, `Community 44`, `Community 45`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `cn()` connect `Breadcrumb & Menu UI` to `Core App & Routing`, `Radix UI Primitives`, `Form & Layout Components`, `Community 36`, `Toast Notifications`, `Dialog Components`, `UI Components Mixed`, `Community 44`, `Community 45`, `Command Palette`, `Community 15`, `Community 17`, `Community 20`, `Community 25`, `Community 26`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `build.sh script`, `$schema`, `style` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._