/**
 * Simple Express server for handling file uploads during development
 * This server handles uploading images to public/assets/products folder
 *
 * Usage:
 * node server/upload-server.js
 *
 * Endpoints:
 * POST /api/upload-asset - Upload a new image
 * DELETE /api/delete-asset?filename=xxx - Delete an image
 * GET /api/list-assets - List all uploaded assets
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for development
app.use(cors());
app.use(express.json());

// Ensure assets directory exists
const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets', 'products');

async function ensureAssetsDir() {
  try {
    await fs.access(ASSETS_DIR);
  } catch {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    console.log('✅ Created assets directory:', ASSETS_DIR);
  }
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureAssetsDir();
    cb(null, ASSETS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
    }
    cb(null, true);
  }
});

// Upload endpoint
app.post('/api/upload-asset', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'هیچ فایلی انتخاب نشده است' });
    }

    const assetPath = `/assets/products/${req.file.filename}`;

    console.log('✅ File uploaded successfully:', req.file.filename);

    // Update index file
    await updateAssetsIndex();

    res.json({
      success: true,
      path: assetPath,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete endpoint
app.delete('/api/delete-asset', async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({ error: 'نام فایل مشخص نشده است' });
    }

    // Security check: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'نام فایل نامعتبر است' });
    }

    const filePath = path.join(ASSETS_DIR, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'فایل یافت نشد' });
    }

    // Delete file
    await fs.unlink(filePath);
    console.log('✅ File deleted successfully:', filename);

    // Update index file
    await updateAssetsIndex();

    res.json({
      success: true,
      message: 'فایل با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List assets endpoint
app.get('/api/list-assets', async (req, res) => {
  try {
    await ensureAssetsDir();

    const files = await fs.readdir(ASSETS_DIR);
    const assets = [];

    for (const filename of files) {
      // Skip hidden files and index file
      if (filename.startsWith('.') || filename === '.index.json') {
        continue;
      }

      const filePath = path.join(ASSETS_DIR, filename);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        assets.push({
          filename: filename,
          name: filename,
          size: stats.size,
          lastModified: stats.mtime,
          path: `/assets/products/${filename}`
        });
      }
    }

    res.json({
      success: true,
      assets: assets,
      count: assets.length
    });
  } catch (error) {
    console.error('❌ List assets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update assets index file
async function updateAssetsIndex() {
  try {
    await ensureAssetsDir();

    const files = await fs.readdir(ASSETS_DIR);
    const assets = [];

    for (const filename of files) {
      // Skip hidden files and index file
      if (filename.startsWith('.') || filename === '.index.json') {
        continue;
      }

      const filePath = path.join(ASSETS_DIR, filename);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        assets.push({
          filename: filename,
          name: filename,
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        });
      }
    }

    const indexPath = path.join(ASSETS_DIR, '.index.json');
    await fs.writeFile(indexPath, JSON.stringify(assets, null, 2));

    console.log('✅ Assets index updated:', assets.length, 'files');
  } catch (error) {
    console.error('❌ Error updating index:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'assets-upload-server',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: error.message || 'خطای داخلی سرور'
  });
});

// Start server
async function startServer() {
  await ensureAssetsDir();
  await updateAssetsIndex();

  app.listen(PORT, () => {
    console.log('🚀 Upload server started successfully!');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`📁 Assets directory: ${ASSETS_DIR}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  POST   /api/upload-asset  - Upload image');
    console.log('  DELETE /api/delete-asset  - Delete image');
    console.log('  GET    /api/list-assets   - List all images');
    console.log('  GET    /api/health        - Health check');
    console.log('');
  });
}

startServer().catch(error => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});
