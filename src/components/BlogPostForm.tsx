import React, { useState, useEffect } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUpload from '@/components/ImageUpload';
import AssetSelector from '@/components/AssetSelector';
import { X } from 'lucide-react';

interface BlogPostFormProps {
  post?: any;
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, isOpen, onClose, mode }) => {
  const { createBlogPost, updateBlogPost } = useBlogPosts();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    image: '',
    read_time: '',
    published: false,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: (post.tags && post.tags[0]) || '',
        author: post.author_id ? 'Author' : 'System',
        image: post.image || '',
        read_time: '5 minutes', // Default since this field doesn't exist in actual schema
        published: post.published || false,
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('عنوان مقاله الزامی است');
      return;
    }
    if (!formData.slug.trim()) {
      alert('اسلاگ الزامی است');
      return;
    }
    if (!formData.content.trim()) {
      alert('محتوای مقاله الزامی است');
      return;
    }
    
    // Image is not required, but warn user
    if (!formData.image.trim()) {
      if (!confirm('هیچ تصویری انتخاب نشده. آیا مایل به ادامه هستید؟')) {
        return;
      }
    }
    
    try {
      const blogData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim() || 'خلاصه‌ای ارائه نشده',
        content: formData.content.trim(),
        category: formData.category.trim() || 'عمومی',
        author: formData.author.trim() || 'نویسنده نامشخص',
        image: formData.image.trim() || '',
        read_time: formData.read_time.trim() || '۵ دقیقه',
        published: formData.published,
      };

      console.log('Submitting blog data:', blogData);

      let result;
      if (mode === 'edit' && post) {
        result = await updateBlogPost(post.id, blogData);
      } else {
        result = await createBlogPost(blogData);
      }

      if (result?.error) {
        console.error('Error saving blog post:', result.error);
        
        // Provide more specific error messages
        let errorMsg = result.error;
        if (result.error.includes('duplicate key')) {
          errorMsg = 'اسلاگ تکراری است. لطفاً اسلاگ دیگری انتخاب کنید';
        } else if (result.error.includes('column') && result.error.includes('does not exist')) {
          errorMsg = 'مشکل در ساختار پایگاه داده. لطفاً با مدیر سیستم تماس بگیرید';
        } else if (result.error.includes('permission')) {
          errorMsg = 'عدم دسترسی برای ذخیره مقاله';
        }
        
        alert(`خطا در ذخیره مقاله: ${errorMsg}`);
        return;
      }

      console.log('Blog post saved successfully');
      alert('مقاله با موفقیت ذخیره شد');
      onClose();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('خطای غیرمنتظره‌ای رخ داد');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'افزودن مقاله جدید' : 
             mode === 'edit' ? 'ویرایش مقاله' : 'مشاهده مقاله'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>عنوان</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label>اسلاگ</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label>خلاصه</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              disabled={mode === 'view'}
              rows={3}
              required
            />
          </div>

          <div>
            <Label>محتوا</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              disabled={mode === 'view'}
              rows={10}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>دسته‌بندی</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                disabled={mode === 'view'}
                required
              />
            </div>
            <div>
              <Label>نویسنده</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                disabled={mode === 'view'}
                required
              />
            </div>
          </div>

          <div>
            <Label>تصویر مقاله</Label>
            <div className="space-y-4">
              {/* Option 1: Upload new image */}
              <div>
                <Label className="text-sm font-medium">آپلود تصویر جدید</Label>
                <p className="text-xs text-gray-500 mb-2">توجه: در حال حاضر آپلود به صورت موقت عمل می‌کند</p>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  disabled={mode === 'view'}
                />
              </div>
              
              {/* Option 2: Select from assets */}
              {mode !== 'view' && (
                <div>
                  <Label className="text-sm font-medium">یا انتخاب از تصاویر موجود (پیشنهادی)</Label>
                  <p className="text-xs text-green-600 mb-2">بهترین گزینه برای تصاویر دائمی</p>
                  <AssetSelector
                    selectedImage={formData.image}
                    onSelect={(imagePath) => setFormData(prev => ({ ...prev, image: imagePath }))}
                  />
                </div>
              )}
              
              {/* Option 3: Enter URL manually */}
              <div>
                <Label className="text-sm font-medium">یا آدرس تصویر را وارد کنید</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => {
                    const url = e.target.value;
                    // Validate URL format
                    if (url && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('blob:')) {
                      console.warn('Invalid URL format:', url);
                    }
                    setFormData(prev => ({ ...prev, image: url }));
                  }}
                  disabled={mode === 'view'}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && formData.image.includes('drive.google.com') && (
                  <p className="text-sm text-orange-600 mt-1">
                    توجه: لینک Google Drive به صورت مستقیم کار نمی‌کند. لطفاً تصویر را آپلود کنید یا از پوشه Assets انتخاب کنید.
                  </p>
                )}
              </div>
              
              {/* Preview */}
              {formData.image && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">پیش‌نمایش:</Label>
                  <div className="mt-2 border rounded-lg p-4 bg-muted/50">
                    <div className="w-48 h-32 mx-auto relative">
                      <img
                        src={formData.image}
                        alt="پیش‌نمایش تصویر"
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          console.error('Image failed to load:', formData.image);
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          
                          // Show error message if not already shown
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message w-full h-full flex items-center justify-center bg-gray-100 rounded-md border-2 border-dashed border-gray-300';
                            errorDiv.innerHTML = `
                              <div class="text-center text-gray-500">
                                <svg class="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p class="text-xs">خطا در بارگذاری تصویر</p>
                                <p class="text-xs text-gray-400 mt-1">لطفاً آدرس صحیح وارد کنید</p>
                              </div>
                            `;
                            parent.appendChild(errorDiv);
                          }
                        }}
                        onLoad={(e) => {
                          // Remove error message if image loads successfully
                          const parent = (e.currentTarget as HTMLImageElement).parentElement;
                          const errorMsg = parent?.querySelector('.error-message');
                          if (errorMsg) {
                            errorMsg.remove();
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2 break-all">
                      {formData.image.length > 50 
                        ? `${formData.image.substring(0, 50)}...` 
                        : formData.image
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>زمان مطالعه</Label>
            <Input
              value={formData.read_time}
              onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
              disabled={mode === 'view'}
              placeholder="مثال: ۵ دقیقه"
              required
            />
          </div>

          {mode !== 'view' && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: !!checked }))}
              />
              <Label htmlFor="published">منتشر شود</Label>
            </div>
          )}

          {mode !== 'view' && (
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {mode === 'create' ? 'افزودن' : 'ذخیره'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BlogPostForm;