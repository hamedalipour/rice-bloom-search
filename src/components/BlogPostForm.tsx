import React, { useState, useEffect } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
        category: post.category || '',
        author: post.author || '',
        image: post.image || '',
        read_time: post.read_time || '',
        published: post.published || false,
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit' && post) {
      await updateBlogPost(post.id, formData);
    } else {
      await createBlogPost(formData);
    }
    
    onClose();
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تصویر</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                disabled={mode === 'view'}
                required
              />
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