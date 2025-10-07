// Script to generate sitemap.xml for the Rice Bloom Search website
const fs = require('fs');
const path = require('path');

// Use your actual domain
const BASE_URL = 'https://atre-shalizar.ir';

// Static routes that are always available
const staticRoutes = [
  '/',
  '/shop',
  '/blog',
  '/about',
  '/contact',
  '/login',
  '/register'
];

// Product slugs from data
const productSlugs = [
  'berenj-tarom-mahali-daraje-yek',
  'berenj-hashemi-moattar',
  'berenj-fajr-gilan',
  'berenj-shirudi-sonati'
];

// Blog post slugs from data
const blogPostSlugs = [
  'rahnama-pokht-berenj-irani',
  'tafavot-berenj-tarom-hashemi',
  'negahdari-berenj'
];

// Generate dynamic routes
const dynamicProductRoutes = productSlugs.map(slug => `/product/${slug}`);
const dynamicBlogRoutes = blogPostSlugs.map(slug => `/blog/${slug}`);

// Combine all routes
const allRoutes = [...staticRoutes, ...dynamicProductRoutes, ...dynamicBlogRoutes];

// Generate sitemap XML
const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Determine priority based on route
const getPriority = (route) => {
  if (route === '/') return '1.0';
  if (route === '/shop') return '0.9';
  if (route.includes('/product/')) return '0.8';
  if (route === '/blog') return '0.7';
  if (route.includes('/blog/')) return '0.6';
  if (route === '/about' || route === '/contact') return '0.5';
  return '0.4';
};

// Write sitemap to public directory
const sitemapContent = generateSitemap();
const outputPath = path.join(__dirname, '../public/sitemap.xml');

fs.writeFileSync(outputPath, sitemapContent);

console.log('Sitemap generated successfully at:', outputPath);
console.log('Sitemap URL:', BASE_URL + '/sitemap.xml');
console.log('');
console.log('Sitemap includes:');
console.log('- 7 static pages');
console.log(`- ${productSlugs.length} product pages`);
console.log(`- ${blogPostSlugs.length} blog post pages`);
console.log(`- Total: ${allRoutes.length} pages`);