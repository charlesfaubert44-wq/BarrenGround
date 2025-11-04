import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import {
  getPlans,
  getMembershipStatus,
  subscribe,
  cancelSubscription,
} from '../api/membership';
import type { MembershipPlan } from '../api/membership';

export default function MembershipPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { membership, setMembership } = useMembershipStore();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/membership');
    }
  }, [isAuthenticated, navigate]);

  // Fetch plans
  const { data: plansData } = useQuery({
    queryKey: ['membershipPlans'],
    queryFn: getPlans,
  });

  // Fetch membership status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['membershipStatus'],
    queryFn: getMembershipStatus,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (statusData?.membership) {
      setMembership(statusData.membership);
    }
  }, [statusData, setMembership]);

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: subscribe,
    onSuccess: (data) => {
      setMembership(data.membership);
      queryClient.invalidateQueries({ queryKey: ['membershipStatus'] });
      setSelectedPlan(null);
      setIsProcessing(false);
    },
    onError: (error: any) => {
      alert(error.error || 'Failed to subscribe');
      setIsProcessing(false);
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      setMembership(data.membership);
      queryClient.invalidateQueries({ queryKey: ['membershipStatus'] });
    },
    onError: (error: any) => {
      alert(error.error || 'Failed to cancel subscription');
    },
  });

  const handleSubscribe = async (plan: MembershipPlan) => {
    if (isProcessing) return;
    setIsProcessing(true);

    subscribeMutation.mutate({
      planId: plan.id,
      paymentMethodId: 'mock_pm_' + Date.now(),
    });
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your membership? You will keep access until the end of your billing period.')) {
      cancelMutation.mutate();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-stone-300">Loading membership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-100 mb-4 distressed-text uppercase tracking-wide">
            ☕ Coffee Membership
          </h1>
          <p className="text-lg sm:text-xl text-amber-500 font-semibold">
            Your Daily Brew, Delivered with Savings
          </p>
          <p className="text-stone-400 mt-2 max-w-2xl mx-auto">
            Join our coffee club and enjoy premium northern-roasted coffee every day at unbeatable prices
          </p>
        </div>

        {/* Current Membership Status */}
        {membership && membership.status === 'active' && (
          <div className="bg-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 border-4 border-amber-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full font-bold uppercase text-sm mb-3">
                  ✓ Active Member
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-2 distressed-text uppercase">
                  {membership.plan?.name}
                </h2>
                <p className="text-stone-400">{membership.plan?.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-stone-900/50 border-2 border-amber-600 rounded-xl p-4 text-center">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Coffees Remaining</p>
                <p className="text-4xl font-bold text-amber-500">{membership.coffees_remaining}</p>
                <p className="text-xs text-stone-500 mt-1">This period</p>
              </div>

              <div className="bg-stone-900/50 border-2 border-stone-700 rounded-xl p-4 text-center">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Today's Coffee</p>
                {membership.canRedeemToday ? (
                  <>
                    <p className="text-3xl font-bold text-green-500">✓</p>
                    <p className="text-sm text-green-400 mt-1 font-semibold">Available Now</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-stone-600">✗</p>
                    <p className="text-sm text-stone-500 mt-1">Already Redeemed</p>
                  </>
                )}
              </div>

              <div className="bg-stone-900/50 border-2 border-stone-700 rounded-xl p-4 text-center">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Renews On</p>
                <p className="text-lg font-bold text-stone-100">
                  {new Date(membership.current_period_end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-stone-500 mt-1">{formatDate(membership.current_period_end)}</p>
              </div>
            </div>

            {membership.plan && (
              <div className="bg-amber-900/20 border border-amber-600 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-stone-300 text-sm">Your Plan</p>
                    <p className="text-2xl font-bold text-amber-500">
                      ${membership.plan.price.toFixed(2)} <span className="text-sm text-stone-400">/ {membership.plan.interval}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-stone-300 text-sm">You're Saving</p>
                    <p className="text-2xl font-bold text-green-500">
                      ${((membership.plan.coffees_per_interval * 5) - membership.plan.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Usage History */}
            {membership.usageHistory && membership.usageHistory.length > 0 && (
              <div className="mt-6 border-t-2 border-stone-700 pt-6">
                <h3 className="text-lg font-bold text-stone-100 mb-4 uppercase tracking-wide">Recent Redemptions</h3>
                <div className="space-y-2">
                  {membership.usageHistory.slice(0, 5).map((usage) => (
                    <div key={usage.id} className="flex justify-between items-center bg-stone-900/50 border border-stone-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">☕</span>
                        <span className="font-semibold text-stone-200">{usage.coffee_name || 'Coffee'}</span>
                      </div>
                      <span className="text-sm text-stone-400">
                        {new Date(usage.redeemed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {!membership.cancel_at_period_end ? (
              <div className="mt-6 border-t-2 border-stone-700 pt-6 text-center">
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wide disabled:opacity-50 transition"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Membership'}
                </button>
              </div>
            ) : (
              <div className="mt-6 border-t-2 border-stone-700 pt-6">
                <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-4">
                  <p className="text-yellow-300 font-semibold">
                    <span className="text-yellow-500 font-bold">⚠ Membership Ending:</span> {formatDate(membership.current_period_end)}
                  </p>
                  <p className="text-yellow-400 text-sm mt-2">
                    You can continue using your remaining coffees until then.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Active Membership - Show Plans */}
        {(!membership || membership.status !== 'active') && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-stone-100 mb-8 text-center distressed-text uppercase">Choose Your Plan</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plansData?.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 hover:shadow-amber-900/20 transition-all border-4 border-amber-800/50 hover:border-amber-600 relative"
                >
                  {/* Savings Badge */}
                  <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg rotate-12">
                    Save ${((plan.coffees_per_interval * 5) - plan.price).toFixed(2)}!
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-3 distressed-text uppercase">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-stone-400 text-sm mb-4">{plan.description}</p>
                    )}
                    <div className="text-5xl font-bold text-amber-500 mb-2">
                      ${plan.price.toFixed(2)}
                    </div>
                    <p className="text-stone-400 uppercase text-sm tracking-wide">per {plan.interval}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-stone-200 bg-stone-900/50 rounded-lg p-3">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">{plan.coffees_per_interval} premium coffees</span>
                    </div>
                    <div className="flex items-center text-stone-200 bg-stone-900/50 rounded-lg p-3">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">One coffee per day</span>
                    </div>
                    <div className="flex items-center text-stone-200 bg-stone-900/50 rounded-lg p-3">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Skip the payment line</span>
                    </div>
                    <div className="flex items-center text-stone-200 bg-stone-900/50 rounded-lg p-3">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Cancel anytime</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isProcessing || subscribeMutation.isPending}
                    className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white py-4 rounded-xl font-bold shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    {isProcessing || subscribeMutation.isPending ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-amber-800/50">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-8 text-center distressed-text uppercase">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-stone-100 uppercase">Subscribe</h3>
              <p className="text-stone-400">Choose your plan and subscribe with secure payment</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-stone-100 uppercase">Order Daily</h3>
              <p className="text-stone-400">Your membership coffee is automatically applied at checkout</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-stone-100 uppercase">Enjoy & Save</h3>
              <p className="text-stone-400">Pick up your premium coffee and save money every week</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-2 border-amber-600 rounded-2xl p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-amber-500 mb-6 text-center distressed-text uppercase">Member Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-bold text-stone-100">Huge Savings</p>
                <p className="text-sm text-stone-400">Save up to 40% on your daily coffee</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-stone-100">Skip the Line</p>
                <p className="text-sm text-stone-400">Members get priority service</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold text-stone-100">Flexible</p>
                <p className="text-sm text-stone-400">Cancel or pause anytime, no commitment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏔️</span>
              <div>
                <p className="font-bold text-stone-100">Northern Quality</p>
                <p className="text-sm text-stone-400">Premium roasted beans from the north</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
