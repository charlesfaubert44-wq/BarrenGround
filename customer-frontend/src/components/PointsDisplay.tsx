import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBalance } from '../api/loyalty';

export default function PointsDisplay() {
  const { isAuthenticated } = useAuthStore();

  const { data: balance } = useQuery({
    queryKey: ['loyaltyBalance'],
    queryFn: getBalance,
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refetch every minute
  });

  if (!isAuthenticated || !balance) {
    return null;
  }

  return (
    <Link
      to="/loyalty"
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
      title="View Loyalty Rewards"
    >
      <svg
        className="w-5 h-5 text-amber-500 group-hover:text-amber-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex flex-col items-start">
        <span className="text-xs text-gray-500 group-hover:text-gray-600 leading-none">Points</span>
        <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 leading-tight">
          {balance.points}
        </span>
      </div>
    </Link>
  );
}
