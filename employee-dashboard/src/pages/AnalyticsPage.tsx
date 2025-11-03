export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Today's Orders</h3>
          <p className="text-3xl font-bold text-amber-900">24</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold text-amber-900">$432.50</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Average Order</h3>
          <p className="text-3xl font-bold text-amber-900">$18.02</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Popular Items</h2>
        <p className="text-gray-600">
          Charts with Recharts showing popular items and sales trends will be displayed here.
        </p>
      </div>
    </div>
  );
}
