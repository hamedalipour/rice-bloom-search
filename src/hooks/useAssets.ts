import { useState, useEffect } from 'react';

export interface Asset {
  name: string;
  path: string;
  filename: string;
  size?: number;
  lastModified?: Date;
  type: 'image' | 'other';
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded assets from src/assets
  const staticAssets: Asset[] = [
    { name: 'درباره ما', path: '/src/assets/about-us.jpg', filename: 'about-us.jpg', type: 'image' },
    { name: 'برنج فجر', path: '/src/assets/fajr.jpg', filename: 'fajr.jpg', type: 'image' },
    { name: 'فاویکون', path: '/src/assets/favicon.png', filename: 'favicon.png', type: 'image' },
    { name: 'برنج هاشمی', path: '/src/assets/hashemi.jpg', filename: 'hashemi.jpg', type: 'image' },
    { name: 'مزرعه برنج', path: '/src/assets/hero-rice-field.jpg', filename: 'hero-rice-field.jpg', type: 'image' },
    { name: 'برنج فجر (کوچک)', path: '/src/assets/rice-fajr.jpg', filename: 'rice-fajr.jpg', type: 'image' },
    { name: 'برنج هاشمی (کوچک)', path: '/src/assets/rice-hashemi.jpg', filename: 'rice-hashemi.jpg', type: 'image' },
    { name: 'برنج شیرودی (کوچک)', path: '/src/assets/rice-shirudi.jpg', filename: 'rice-shirudi.jpg', type: 'image' },
    { name: 'برنج طارم (کوچک)', path: '/src/assets/rice-tarom.jpg', filename: 'rice-tarom.jpg', type: 'image' },
    { name: 'برنج شیرودی', path: '/src/assets/shirodi.jpg', filename: 'shirodi.jpg', type: 'image' },
    { name: 'برنج طارم', path: '/src/assets/tarom.jpg', filename: 'tarom.jpg', type: 'image' },
  ];

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start with static assets
      let allAssets = [...staticAssets];

      // Try to load dynamic assets from public/assets/products
      try {
        const response = await fetch('/assets/products/.index.json');
        if (response.ok) {
          const dynamicAssets = await response.json();
          allAssets = [
            ...allAssets,
            ...dynamicAssets.map((asset: any) => ({
              name: asset.name || asset.filename,
              path: `/assets/products/${asset.filename}`,
              filename: asset.filename,
              size: asset.size,
              lastModified: asset.lastModified ? new Date(asset.lastModified) : undefined,
              type: 'image' as const,
            })),
          ];
        }
      } catch (e) {
        // Dynamic assets not available, use only static
        console.log('Dynamic assets not available, using static assets only');
      }

      setAssets(allAssets);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      // Fallback to static assets only
      setAssets(staticAssets);
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async (file: File): Promise<string | null> => {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedName}`;

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', filename);

      // Upload to server
      const response = await fetch('/api/upload-asset', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const assetPath = data.path || `/assets/products/${filename}`;

      // Add to local assets list
      const newAsset: Asset = {
        name: file.name,
        path: assetPath,
        filename: filename,
        size: file.size,
        lastModified: new Date(),
        type: 'image',
      };

      setAssets((prev) => [...prev, newAsset]);

      return assetPath;
    } catch (err) {
      console.error('Error uploading asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload asset');
      return null;
    }
  };

  const deleteAsset = async (filename: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/delete-asset?filename=${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Remove from local assets list
      setAssets((prev) => prev.filter((asset) => asset.filename !== filename));

      return true;
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      return false;
    }
  };

  const refreshAssets = () => {
    loadAssets();
  };

  useEffect(() => {
    loadAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    uploadAsset,
    deleteAsset,
    refreshAssets,
  };
};
