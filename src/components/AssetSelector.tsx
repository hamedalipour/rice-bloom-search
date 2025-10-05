import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Folder, Check } from 'lucide-react';

// Import all assets
import aboutUsImg from '@/assets/about-us.jpg';
import fajrImg from '@/assets/fajr.jpg';
import faviconImg from '@/assets/favicon.png';
import hashemiImg from '@/assets/hashemi.jpg';
import heroRiceFieldImg from '@/assets/hero-rice-field.jpg';
import riceFajrImg from '@/assets/rice-fajr.jpg';
import riceHashemiImg from '@/assets/rice-hashemi.jpg';
import riceShirudiImg from '@/assets/rice-shirudi.jpg';
import riceTargomImg from '@/assets/rice-tarom.jpg';
import shirodiImg from '@/assets/shirodi.jpg';
import taromImg from '@/assets/tarom.jpg';

interface AssetSelectorProps {
  onSelect: (imagePath: string) => void;
  selectedImage?: string;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({ onSelect, selectedImage }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Available assets with their imported paths
  const assets = [
    { name: 'درباره ما', path: aboutUsImg, filename: 'about-us.jpg' },
    { name: 'برنج فجر', path: fajrImg, filename: 'fajr.jpg' },
    { name: 'فاویکون', path: faviconImg, filename: 'favicon.png' },
    { name: 'برنج هاشمی', path: hashemiImg, filename: 'hashemi.jpg' },
    { name: 'مزرعه برنج', path: heroRiceFieldImg, filename: 'hero-rice-field.jpg' },
    { name: 'برنج فجر (کوچک)', path: riceFajrImg, filename: 'rice-fajr.jpg' },
    { name: 'برنج هاشمی (کوچک)', path: riceHashemiImg, filename: 'rice-hashemi.jpg' },
    { name: 'برنج شیرودی (کوچک)', path: riceShirudiImg, filename: 'rice-shirudi.jpg' },
    { name: 'برنج طارم (کوچک)', path: riceTargomImg, filename: 'rice-tarom.jpg' },
    { name: 'برنج شیرودی', path: shirodiImg, filename: 'shirodi.jpg' },
    { name: 'برنج طارم', path: taromImg, filename: 'tarom.jpg' },
  ];

  const handleSelect = (assetPath: string) => {
    console.log('Asset selected:', assetPath);
    onSelect(assetPath);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Folder className="h-4 w-4 ml-2" />
          انتخاب از پوشه Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>انتخاب تصویر از پوشه Assets</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {assets.map((asset) => (
            <div
              key={asset.filename}
              className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedImage === asset.path
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary'
              }`}
              onClick={() => handleSelect(asset.path)}
            >
              <div className="aspect-square overflow-hidden rounded-md mb-2">
                <img
                  src={asset.path}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-center font-medium truncate" title={asset.name}>
                {asset.name}
              </p>
              <p className="text-xs text-center text-muted-foreground truncate" title={asset.filename}>
                {asset.filename}
              </p>
              {selectedImage === asset.path && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetSelector;