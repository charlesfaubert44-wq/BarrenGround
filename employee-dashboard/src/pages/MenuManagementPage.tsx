import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllMenuItems, updateMenuItemAvailability } from '../api/menu';

export default function MenuManagementPage() {
  const queryClient = useQueryClient();

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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Menu Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Item
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Price
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm capitalize">{item.category}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleAvailability(item.id, !item.available)}
                    className={`px-4 py-2 rounded text-sm font-medium transition ${
                      item.available
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {item.available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No menu items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
