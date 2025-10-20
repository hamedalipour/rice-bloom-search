import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Folder,
  Check,
  Upload,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssetSelectorProps {
  onSelect: (imagePath: string) => void;
  selectedImage?: string;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  onSelect,
  selectedImage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { assets, loading, error, uploadAsset, deleteAsset, refreshAssets } =
    useAssets();

  const handleSelect = (assetPath: string) => {
    console.log("Asset selected:", assetPath);
    onSelect(assetPath);
    setIsOpen(false);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("فقط فایل‌های تصویری مجاز هستند");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم فایل نباید بیشتر از 5 مگابایت باشد");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const assetPath = await uploadAsset(file);

      if (assetPath) {
        console.log("Asset uploaded successfully:", assetPath);
        // Optionally auto-select the uploaded image
        onSelect(assetPath);
        // Refresh assets list
        refreshAssets();
      } else {
        setUploadError("خطا در آپلود فایل");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (filename: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm("آیا از حذف این تصویر اطمینان دارید؟")) {
      return;
    }

    const success = await deleteAsset(filename);
    if (success) {
      console.log("Asset deleted successfully");
      refreshAssets();
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Folder className="h-4 w-4 ml-2" />
            انتخاب از پوشه Assets
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>مدیریت تصاویر Assets</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={refreshAssets}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`}
                  />
                  بروزرسانی
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  {uploading ? "در حال آپلود..." : "آپلود تصویر جدید"}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Error Alert */}
            {(error || uploadError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Upload Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-sm mb-2">📝 راهنما:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• فقط فایل‌های تصویری (JPG, PNG, WebP) قابل آپلود هستند</li>
                <li>• حداکثر حجم: 5 مگابایت</li>
                <li>
                  • تصاویر آپلود شده به پوشه{" "}
                  <code className="bg-muted px-1 rounded">
                    public/assets/products
                  </code>{" "}
                  اضافه می‌شوند
                </li>
                <li>• برای حذف تصویر، روی آیکون سطل زباله کلیک کنید</li>
              </ul>
            </div>

            {/* Loading State */}
            {loading && !assets.length && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    در حال بارگذاری تصاویر...
                  </p>
                </div>
              </div>
            )}

            {/* Assets Grid */}
            {!loading || assets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
                {assets.map((asset) => {
                  const isSelected = selectedImage === asset.path;
                  const isStatic = asset.path.startsWith("/src/assets");

                  return (
                    <div
                      key={asset.path}
                      className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg group ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                          : "border-border hover:border-emerald-400"
                      }`}
                      onClick={() => handleSelect(asset.path)}
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden rounded-md mb-2 bg-muted">
                        <img
                          src={asset.path}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <p
                          className="text-xs font-medium truncate"
                          title={asset.name}
                        >
                          {asset.name}
                        </p>
                        <p
                          className="text-xs text-muted-foreground truncate"
                          title={asset.filename}
                        >
                          {asset.filename}
                        </p>
                        {asset.size && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(asset.size)}
                          </p>
                        )}
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {/* Delete Button (only for non-static assets) */}
                      {!isStatic && (
                        <button
                          onClick={(e) => handleDelete(asset.filename, e)}
                          className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="حذف تصویر"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}

                      {/* Static Badge */}
                      {isStatic && (
                        <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                          ثابت
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Empty State */}
            {!loading && assets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  هیچ تصویری وجود ندارد
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  برای شروع، یک تصویر آپلود کنید
                </p>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  آپلود اولین تصویر
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>تعداد تصاویر: {assets.length}</span>
              <span>
                تصاویر ثابت:{" "}
                {assets.filter((a) => a.path.startsWith("/src/assets")).length}{" "}
                | تصاویر آپلود شده:{" "}
                {assets.filter((a) => !a.path.startsWith("/src/assets")).length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssetSelector;
