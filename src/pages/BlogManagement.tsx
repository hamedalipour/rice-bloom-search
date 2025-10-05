import React, { useState } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import BlogPostForm from '@/components/BlogPostForm';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogManagement: React.FC = () => {
  const { blogPosts, loading, deleteBlogPost, publishBlogPost, fetchBlogPosts } = useBlogPosts();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');

  React.useEffect(() => {
    // Fetch all blog posts including unpublished ones for admin
    fetchBlogPosts(true);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
      await deleteBlogPost(id);
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    await publishBlogPost(id, !published);
  };

  const openModal = (type: 'create' | 'edit' | 'view', post = null) => {
    setModalType(type);
    setSelectedPost(post);
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت بلاگ</h1>
        <Button onClick={() => openModal('create')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 ml-2" />
          افزودن مقاله جدید
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                عنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                دسته‌بندی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                نویسنده
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                تاریخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogPosts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded overflow-hidden ml-4 bg-gray-100 flex-shrink-0">
                      <img
                        className="h-full w-full object-cover"
                        src={(post as any).featured_image_url || '/placeholder-image.jpg'}
                        alt={post.title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = '/placeholder-image.jpg';
                          target.onerror = null; // Prevent infinite loop
                        }}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {post.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(post as any).tags ? (post as any).tags[0] || 'بدون دسته‌بندی' : 'بدون دسته‌بندی'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(post as any).author_id ? 'نویسنده' : 'سیستم'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    post.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.published ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(post.created_at).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => openModal('view', post)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', post)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePublish(post.id, post.published)}
                      className={post.published ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                    >
                      {post.published ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <BlogPostForm
        post={selectedPost}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />
    </div>
  );
};

export default BlogManagement;