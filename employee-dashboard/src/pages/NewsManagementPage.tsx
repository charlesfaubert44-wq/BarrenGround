import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest } from '../api/client';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  active: boolean;
  priority: number;
  created_at: string;
}

interface NewsForm {
  title: string;
  content: string;
  image_url: string;
  active: boolean;
  priority: number;
}

export default function NewsManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<NewsForm>({
    title: '',
    content: '',
    image_url: '',
    active: true,
    priority: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: newsItems = [] } = useQuery<NewsItem[]>({
    queryKey: ['news'],
    queryFn: () => apiRequest<NewsItem[]>('/api/news'),
  });

  const openCreateModal = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      image_url: '',
      active: true,
      priority: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (news: NewsItem) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      image_url: news.image_url || '',
      active: news.active,
      priority: news.priority,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNews(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingNews) {
        await apiRequest(`/api/news/${editingNews.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest('/api/news', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['news'] });
      closeModal();
    } catch (error) {
      console.error('Failed to save news:', error);
      alert('Failed to save news. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (newsId: number, newsTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${newsTitle}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/news/${newsId}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    } catch (error) {
      console.error('Failed to delete news:', error);
      alert('Failed to delete news. Please try again.');
    }
  };

  const toggleActive = async (newsId: number, active: boolean) => {
    try {
      await apiRequest(`/api/news/${newsId}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active }),
      });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    } catch (error) {
      console.error('Failed to toggle news:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-100 distressed-text drop-shadow-lg">NEWS & ANNOUNCEMENTS</h1>
          <p className="text-stone-400 mt-2">Manage homepage news and announcements</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-lg font-bold uppercase transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add News
        </button>
      </div>

      {newsItems.length === 0 ? (
        <div className="bg-stone-800 rounded-xl shadow-2xl p-12 text-center border-4 border-amber-800/50">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-stone-200 mb-2">No News Yet</h3>
          <p className="text-stone-400 mb-6">Create your first news announcement</p>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-bold uppercase transition-all"
          >
            Create News
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {newsItems
            .sort((a, b) => b.priority - a.priority)
            .map((news) => (
              <div
                key={news.id}
                className="bg-stone-800 rounded-xl shadow-2xl p-6 border-4 border-amber-800/50 hover:shadow-amber-900/20 transition"
              >
                <div className="flex items-start gap-6">
                  {news.image_url && (
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-stone-700">
                      <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-stone-100 mb-2">{news.title}</h3>
                        <p className="text-stone-300 text-sm leading-relaxed">{news.content}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="px-2 py-1 rounded bg-amber-900/30 text-amber-300 text-xs font-bold">
                          Priority: {news.priority}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                            news.active
                              ? 'bg-green-900/50 text-green-300 border-green-600'
                              : 'bg-red-900/50 text-red-300 border-red-600'
                          }`}
                        >
                          {news.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-stone-500">
                        Posted {new Date(news.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(news.id, !news.active)}
                          className={`px-3 py-2 rounded text-xs font-bold uppercase transition ${
                            news.active
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {news.active ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => openEditModal(news)}
                          className="px-3 py-2 rounded text-xs font-bold uppercase transition bg-amber-600 text-white hover:bg-amber-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(news.id, news.title)}
                          className="px-3 py-2 rounded text-xs font-bold uppercase transition bg-stone-600 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div
            className="bg-stone-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-amber-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-stone-900 border-b-2 border-amber-800/50 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-stone-100 distressed-text">
                {editingNews ? 'EDIT NEWS' : 'ADD NEWS'}
              </h2>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-100 transition p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">TITLE *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., New Winter Menu Available!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">CONTENT *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Write the news announcement..."
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  IMAGE URL <span className="text-stone-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="https://example.com/news-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">PRIORITY</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="0-100 (higher = shown first)"
                />
                <p className="text-xs text-stone-400 mt-1">Higher priority news appears first on the homepage</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-stone-600 bg-stone-700 checked:bg-amber-600 focus:ring-2 focus:ring-amber-500"
                />
                <label htmlFor="active" className="text-stone-100 font-semibold">
                  Publish this news immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-stone-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-stone-300 bg-stone-700 hover:bg-stone-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : editingNews ? 'Update News' : 'Create News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
