import { Link } from 'react-router-dom';
import type { UserMembership } from '../../api/membership';

interface MembershipCardProps {
  membership: UserMembership | null;
  compact?: boolean;
}

export default function MembershipCard({ membership, compact = false }: MembershipCardProps) {
  if (!membership || membership.status !== 'active') {
    if (compact) return null;

    return (
      <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg p-6 border-2 border-amber-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              ☕ Get a Coffee Membership
            </h3>
            <p className="text-sm text-gray-700">
              Save money with daily coffee for just $25/week
            </p>
          </div>
          <Link
            to="/membership"
            className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <Link to="/membership" className="block">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-900">Active Membership</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">{membership.coffees_remaining} left</span>
              {membership.canRedeemToday && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Available
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-green-900 mb-1">
            {membership.plan?.name || 'Active Membership'}
          </h3>
          <p className="text-sm text-gray-700">
            {membership.plan?.description}
          </p>
        </div>
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Coffees Remaining</p>
          <p className="text-2xl font-bold text-green-900">{membership.coffees_remaining}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Today's Coffee</p>
          {membership.canRedeemToday ? (
            <p className="text-lg font-semibold text-green-600">✓ Available</p>
          ) : (
            <p className="text-lg font-semibold text-gray-500">Redeemed</p>
          )}
        </div>
      </div>

      {membership.canRedeemToday && (
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            🎉 Your daily coffee is ready! Add a coffee to your cart and it will be automatically discounted at checkout.
          </p>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <p className="text-xs text-gray-600">
          Renews {new Date(membership.current_period_end).toLocaleDateString()}
        </p>
        <Link
          to="/membership"
          className="text-sm text-green-700 font-medium hover:text-green-800"
        >
          Manage →
        </Link>
      </div>
    </div>
  );
}
