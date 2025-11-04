import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getAllMenuItems, updateMenuItemAvailability, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menu';
import type { MenuItem } from '../api/menu';

interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: 0,
    category: 'coffee',
    image_url: '',
    available: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: getAllMenuItems,
  });

  const toggleAvailability = async (itemId: number, available: boolean) => {
    try {
      await updateMenuItemAvailability(itemId, available);
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    } catch (error) {
      console.error('Failed to update menu item availability:', error);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'coffee',
      image_url: '',
      available: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      available: item.available,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await createMenuItem(formData);
      }
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      closeModal();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMenuItem(itemId);
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-stone-100 distressed-text drop-shadow-lg">MENU MANAGEMENT</h1>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-lg font-bold uppercase transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Menu Item
        </button>
      </div>

      <div className="bg-stone-800 rounded-xl shadow-2xl overflow-hidden border-4 border-amber-800/50">
        <table className="w-full">
          <thead className="bg-stone-900 border-b-2 border-amber-800/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                Item
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                Category
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                Price
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-stone-200 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-700">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-stone-700/50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-stone-100">{item.name}</p>
                    <p className="text-sm text-stone-400">{item.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm capitalize text-stone-200">{item.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-amber-500">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                      item.available
                        ? 'bg-green-900/50 text-green-300 border-green-600'
                        : 'bg-red-900/50 text-red-300 border-red-600'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAvailability(item.id, !item.available)}
                      className={`px-3 py-2 rounded text-xs font-bold uppercase transition ${
                        item.available
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {item.available ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-2 rounded text-xs font-bold uppercase transition bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="px-3 py-2 rounded text-xs font-bold uppercase transition bg-stone-600 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-300">No menu items found</p>
          </div>
        )}
      </div>

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
                {editingItem ? 'EDIT MENU ITEM' : 'ADD MENU ITEM'}
              </h2>
              <button
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-100 transition p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">ITEM NAME *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., Americano"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">DESCRIPTION *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Describe the item..."
                  rows={3}
                  required
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-amber-400 mb-2">PRICE *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg pl-8 pr-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-amber-400 mb-2">CATEGORY *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="coffee">Coffee</option>
                    <option value="cold-drinks">Cold Drinks</option>
                    <option value="pastries">Pastries</option>
                    <option value="food">Food</option>
                    <option value="specialty">Specialty</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  IMAGE URL
                  <span className="text-stone-400 font-normal ml-2 text-xs">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-stone-700 border-2 border-stone-600 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-500 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Available Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-stone-600 bg-stone-700 checked:bg-amber-600 focus:ring-2 focus:ring-amber-500"
                />
                <label htmlFor="available" className="text-stone-100 font-semibold">
                  Make this item available immediately
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
