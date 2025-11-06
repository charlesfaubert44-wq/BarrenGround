import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MembershipCard from '../../components/membership/MembershipCard';
import type { UserMembership } from '../../api/membership';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MembershipCard Component', () => {
  const mockActiveMembership: UserMembership = {
    id: 1,
    user_id: 1,
    plan_id: 1,
    status: 'active',
    coffees_remaining: 5,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    stripe_subscription_id: 'sub_123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    canRedeemToday: true,
    plan: {
      id: 1,
      name: 'Weekly Coffee Plan',
      description: 'Get one coffee per day',
      price: 25.00,
      interval: 'week' as const,
      coffees_per_interval: 7,
      active: true,
      created_at: new Date().toISOString(),
    },
  };

  describe('No Membership State', () => {
    it('should show promotional card when no membership', () => {
      renderWithRouter(<MembershipCard membership={null} />);

      expect(screen.getByText(/Get a Coffee Membership/i)).toBeInTheDocument();
      expect(screen.getByText(/Save money with daily coffee/i)).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should not render in compact mode when no membership', () => {
      const { container } = renderWithRouter(
        <MembershipCard membership={null} compact={true} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show promotional card when membership is inactive', () => {
      const inactiveMembership = { ...mockActiveMembership, status: 'canceled' as const };
      renderWithRouter(<MembershipCard membership={inactiveMembership} />);

      expect(screen.getByText(/Get a Coffee Membership/i)).toBeInTheDocument();
    });
  });

  describe('Active Membership - Full View', () => {
    it('should display membership plan name', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} />);

      expect(screen.getByText('Weekly Coffee Plan')).toBeInTheDocument();
    });

    it('should display coffees remaining', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} />);

      expect(screen.getByText('Coffees Remaining')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should show available status when can redeem today', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} />);

      expect(screen.getByText('Available', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/Your daily coffee is ready/i)).toBeInTheDocument();
    });

    it('should show redeemed status when cannot redeem today', () => {
      const redeemedMembership = { ...mockActiveMembership, canRedeemToday: false };
      renderWithRouter(<MembershipCard membership={redeemedMembership} />);

      expect(screen.getByText('Redeemed')).toBeInTheDocument();
      expect(screen.queryByText(/Your daily coffee is ready/i)).not.toBeInTheDocument();
    });

    it('should display renewal date', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} />);

      expect(screen.getByText(/Renews/i)).toBeInTheDocument();
    });

    it('should have active status badge', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} />);

      const badges = screen.getAllByText('Active');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should have manage link', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} />);

      const manageLink = screen.getByText('Manage →');
      expect(manageLink).toBeInTheDocument();
      expect(manageLink.closest('a')).toHaveAttribute('href', '/membership');
    });
  });

  describe('Active Membership - Compact View', () => {
    it('should display compact version when compact prop is true', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} compact={true} />);

      expect(screen.getByText('Active Membership')).toBeInTheDocument();
      expect(screen.getByText('5 left')).toBeInTheDocument();
    });

    it('should show available badge in compact view when can redeem', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} compact={true} />);

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should not show available badge in compact view when cannot redeem', () => {
      const redeemedMembership = { ...mockActiveMembership, canRedeemToday: false };
      renderWithRouter(<MembershipCard membership={redeemedMembership} compact={true} />);

      expect(screen.queryByText('Available')).not.toBeInTheDocument();
    });

    it('should be clickable in compact view', () => {
      renderWithRouter(<MembershipCard membership={mockActiveMembership} compact={true} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/membership');
    });

    it('should have green indicator dot in compact view', () => {
      const { container } = renderWithRouter(
        <MembershipCard membership={mockActiveMembership} compact={true} />
      );

      const greenDot = container.querySelector('.bg-green-500.rounded-full');
      expect(greenDot).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing plan data gracefully', () => {
      const membershipWithoutPlan = { ...mockActiveMembership, plan: undefined };
      renderWithRouter(<MembershipCard membership={membershipWithoutPlan} />);

      expect(screen.getByText('Active Membership')).toBeInTheDocument();
    });

    it('should handle zero coffees remaining', () => {
      const noRefillsMembership = { ...mockActiveMembership, coffees_remaining: 0 };
      renderWithRouter(<MembershipCard membership={noRefillsMembership} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
