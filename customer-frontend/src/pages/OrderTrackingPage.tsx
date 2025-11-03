import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderByToken } from '../api/orders';

export default function OrderTrackingPage() {
  const { token } = useParams<{ token: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', token],
    queryFn: () => getOrderByToken(token!),
    enabled: !!token,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'received', 'preparing', 'ready', 'completed'];
    return steps.indexOf(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'text-blue-600';
      case 'preparing':
        return 'text-yellow-600';
      case 'ready':
        return 'text-green-600';
      case 'completed':
        return 'text-gray-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center animated-gradient">
        <div className="text-center fade-in">
          <div className="glass rounded-3xl p-12 inline-block">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-amber-900 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Order Not Found</h1>
          <p className="text-red-600">
            We couldn't find an order with this tracking number. Please check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-50 via-orange-50 to-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-8 fade-in">Track Your Order 📦</h1>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-amber-100 scale-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Order #{order.id}</h2>
                <p className="text-gray-600 text-lg">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${getStatusColor(order.status)} capitalize px-6 py-3 rounded-2xl bg-white shadow-md`}>
                {order.status}
              </div>
            </div>

            {order.pickup_time && (
              <div className="bg-amber-100 rounded-2xl p-4 border-2 border-amber-200">
                <p className="text-gray-800 text-lg">
                  <strong className="text-amber-900">Pickup Time:</strong> {new Date(order.pickup_time).toLocaleString()}
                </p>
              </div>
            )}
          </div>

        {/* Order Status Progress */}
        {order.status !== 'cancelled' && (
          <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-green-100 fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 gradient-text">Order Progress</h3>

            <div className="space-y-6 relative">
              {/* Progress Line */}
              <div className="absolute left-5 top-5 bottom-5 w-1 bg-gray-200">
                <div
                  className="bg-gradient-to-b from-green-500 to-green-600 w-full transition-all duration-1000"
                  style={{ height: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>

              <div className={`flex items-start relative scale-in ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`} style={{ animationDelay: '0.3s' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10 ${currentStep >= 1 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white pulse-glow' : 'bg-gray-300'}`}>
                  {currentStep >= 1 ? '✓' : '1'}
                </div>
                <div className="ml-6 flex-grow">
                  <p className="font-bold text-lg">Order Received</p>
                  <p className="text-sm">We've received your order and payment</p>
                </div>
              </div>

              <div className={`flex items-start relative scale-in ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`} style={{ animationDelay: '0.4s' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10 ${currentStep >= 2 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white pulse-glow' : 'bg-gray-300'}`}>
                  {currentStep >= 2 ? '✓' : '2'}
                </div>
                <div className="ml-6 flex-grow">
                  <p className="font-bold text-lg">Preparing</p>
                  <p className="text-sm">Your order is being prepared with care</p>
                </div>
              </div>

              <div className={`flex items-start relative scale-in ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`} style={{ animationDelay: '0.5s' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10 ${currentStep >= 3 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white pulse-glow' : 'bg-gray-300'}`}>
                  {currentStep >= 3 ? '✓' : '3'}
                </div>
                <div className="ml-6 flex-grow">
                  <p className="font-bold text-lg">Ready for Pickup</p>
                  <p className="text-sm">Your order is ready! Come get it!</p>
                </div>
              </div>

              <div className={`flex items-start relative scale-in ${currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}`} style={{ animationDelay: '0.6s' }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10 ${currentStep >= 4 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white pulse-glow' : 'bg-gray-300'}`}>
                  {currentStep >= 4 ? '✓' : '4'}
                </div>
                <div className="ml-6 flex-grow">
                  <p className="font-bold text-lg">Completed</p>
                  <p className="text-sm">Order picked up - enjoy!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-amber-100 fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b-2 border-amber-100 pb-4 scale-in" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    <span className="text-amber-900">{item.quantity}x</span> {item.menu_item_name}
                  </p>
                  {item.customizations && (
                    <p className="text-sm text-gray-600 bg-amber-50 rounded-lg px-3 py-1 inline-block mt-1">
                      {Object.entries(item.customizations)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </p>
                  )}
                </div>
                <p className="font-bold text-lg text-amber-900">
                  ${(item.price_snapshot * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-amber-200 flex justify-between text-2xl font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-amber-900">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-6 text-center shadow-xl scale-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-gray-800 text-lg">
            Questions about your order? Call us at <strong className="text-amber-900 text-xl">(555) 123-4567</strong> ☎️
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
