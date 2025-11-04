import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest } from '../api/client';

interface Promo {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface PromoForm {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  active: boolean;
  start_date: string;
  end_date: string;
}

export default function PromoManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [formData, setFormData] = useState<PromoForm>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    active: true,
    start_date: '',
    end_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: promos = [] } = useQuery<Promo[]>({
    queryKey: ['promos'],
    queryFn: () => apiRequest<Promo[]>('/api/promos'),
  });

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      active: true,
      start_date: '',
      end_date: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo: Promo) => {
    setEditingPromo(promo);
    setFormData({
      title: promo.title,
      description: promo.description,
      image_url: promo.image_url,
      link_url: promo.link_url || '',
      active: promo.active,
      start_date: promo.start_date || '',
      end_date: promo.end_date || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingPromo) {
        await apiRequest(`/api/promos/${editingPromo.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest('/api/promos', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['promos'] });
      closeModal();
    } catch (error) {
      console.error('Failed to save promo:', error);
      alert('Failed to save promo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promoId: number, promoTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${promoTitle}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/promos/${promoId}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['promos'] });
    } catch (error) {
      console.error('Failed to delete promo:', error);
      alert('Failed to delete promo. Please try again.');
    }
  };

  const toggleActive = async (promoId: number, active: boolean) => {
    try {
      await apiRequest(`/api/promos/${promoId}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active }),
      });
      queryClient.invalidateQueries({ queryKey: ['promos'] });
    } catch (error) {
      console.error('Failed to toggle promo:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-100 distressed-text drop-shadow-lg">PROMO MANAGEMENT</h1>
          <p className="text-stone-400 mt-2">Manage homepage banner promotions and special offers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-lg font-bold uppercase transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Promo
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="bg-stone-800 rounded-xl shadow-2xl p-12 text-center border-4 border-amber-800/50">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-stone-200 mb-2">No Promos Yet</h3>
          <p className="text-stone-400 mb-6">Create your first promotional banner</p>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-bold uppercase transition-all"
          >
            Create Promo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="bg-stone-800 rounded-xl shadow-2xl overflow-hidden border-4 border-amber-800/50 hover:shadow-amber-900/20 transition"
            >
              {/* Promo Image */}
              <div className="h-48 bg-stone-700 flex items-center justify-center overflow-hidden">
                {promo.image_url ? (
                  <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🎉</span>
                )}
              </div>

              {/* Promo Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-100 mb-1">{promo.title}</h3>
                    <p className="text-sm text-stone-400">{promo.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ml-3 ${
                      promo.active
                        ? 'bg-green-900/50 text-green-300 border-green-600'
                        : 'bg-red-900/50 text-red-300 border-red-600'
                    }`}
                  >
                    {promo.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {(promo.start_date || promo.end_date) && (
                  <div className="text-xs text-amber-400 mb-3">
                    {promo.start_date && <span>Start: {new Date(promo.start_date).toLocaleDateString()}</span>}
                    {promo.start_date && promo.end_date && <span className="mx-2">→</span>}
                    {promo.end_date && <span>End: {new Date(promo.end_date).toLocaleDateString()}</span>}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => toggleActive(promo.id, !promo.active)}
                    className={`px-3 py-2 rounded text-xs font-bold uppercase transition ${
                      promo.active
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {promo.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(promo)}
                    className="px-3 py-2 rounded text-xs font-bold uppercase transition bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id, promo.title)}
                    className="px-3 py-2 rounded text-xs font-bold uppercase transition bg-stone-600 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
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
                {editingPromo ? 'EDIT PROMO' : 'ADD PROMO'}
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
                  placeholder="e.g., Summer Special 20% Off"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">DESCRIPTION *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Describe the promotion..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">IMAGE URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="https://example.com/promo-banner.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  LINK URL <span className="text-stone-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="/menu or https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-amber-400 mb-2">
                    START DATE <span className="text-stone-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-amber-400 mb-2">
                    END DATE <span className="text-stone-400 font-normal text-xs">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
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
                  Activate this promo immediately
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
                  {isSubmitting ? 'Saving...' : editingPromo ? 'Update Promo' : 'Create Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
