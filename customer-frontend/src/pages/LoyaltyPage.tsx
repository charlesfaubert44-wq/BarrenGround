import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBalance, getHistory, checkBirthdayBonus } from '../api/loyalty';

export default function LoyaltyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/loyalty');
    }
  }, [isAuthenticated, navigate]);

  // Fetch balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['loyaltyBalance'],
    queryFn: getBalance,
    enabled: isAuthenticated,
  });

  // Fetch history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['loyaltyHistory'],
    queryFn: () => getHistory(50),
    enabled: isAuthenticated,
  });

  // Check birthday bonus mutation
  const birthdayMutation = useMutation({
    mutationFn: checkBirthdayBonus,
    onSuccess: (data) => {
      if (data.eligible && data.pointsAwarded) {
        alert(`${data.message}`);
        queryClient.invalidateQueries({ queryKey: ['loyaltyBalance'] });
        queryClient.invalidateQueries({ queryKey: ['loyaltyHistory'] });
      } else {
        alert(data.message);
      }
    },
    onError: (error: any) => {
      alert(error.error || 'Failed to check birthday bonus');
    },
  });

  const handleCheckBirthday = () => {
    birthdayMutation.mutate();
  };

  if (balanceLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const pointsBalance = balance?.points || 0;
  const pointsValue = balance?.value || 0;
  const nextReward = balance?.nextReward || 100;
  const progressPercent = ((pointsBalance % 100) / 100) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Loyalty Rewards</h1>
        <p className="text-lg text-gray-600">
          Earn points with every purchase and redeem them for discounts
        </p>
      </div>

      {/* Points Balance Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-medium mb-2 opacity-90">Your Points Balance</h2>
            <div className="text-6xl font-bold mb-2">{pointsBalance}</div>
            <p className="text-2xl font-medium">
              ≈ ${pointsValue.toFixed(2)} in rewards
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 md:w-64">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Next $5 Reward</span>
              <span className="text-sm font-bold">{nextReward} pts away</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs mt-2 opacity-90">
              You have {pointsBalance % 100} of 100 points
            </p>
          </div>
        </div>

        {/* Birthday Bonus Button */}
        <div className="mt-6 pt-6 border-t border-white/30">
          <button
            onClick={handleCheckBirthday}
            disabled={birthdayMutation.isPending}
            className="bg-white text-amber-600 px-6 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {birthdayMutation.isPending ? 'Checking...' : 'Claim Birthday Bonus'}
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Earn Points</h3>
            <p className="text-gray-600">Get 1 point for every $1 you spend</p>
          </div>

          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Redeem Rewards</h3>
            <p className="text-gray-600">100 points = $5 off your order</p>
          </div>

          <div className="text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Bonus Points</h3>
            <p className="text-gray-600">Get 50 points on your birthday</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">Points never expire!</p>
              <p className="text-gray-600 text-sm">Save up your points for bigger rewards or use them right away.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Points History</h2>

        {historyData?.history && historyData.history.length > 0 ? (
          <div className="space-y-3">
            {historyData.history.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`text-lg font-bold ${
                      transaction.points_earned > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.points_earned > 0 ? '+' : '-'}
                    {transaction.points_earned || transaction.points_spent} pts
                  </div>
                  <div className="text-sm text-gray-500 w-20 text-right">
                    Balance: {transaction.balance_after}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm">Start earning points by placing orders!</p>
          </div>
        )}
      </div>

      {/* Redeem at Checkout CTA */}
      {pointsBalance >= 100 && (
        <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Ready to redeem your points?
          </p>
          <p className="text-gray-600 mb-4">
            You can use your points at checkout to get discounts on your order!
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Order Now
          </button>
        </div>
      )}
    </div>
  );
}
