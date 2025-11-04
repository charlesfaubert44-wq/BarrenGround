import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PointsDisplay from '../../components/PointsDisplay';
import { useAuthStore } from '../../store/authStore';

// Mock the auth store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the loyalty API
vi.mock('../../api/loyalty', () => ({
  getBalance: vi.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PointsDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
    } as any);

    const { container } = renderWithProviders(<PointsDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when user is authenticated with balance', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { getBalance } = await import('../../api/loyalty');
    vi.mocked(getBalance).mockResolvedValue({ points: 100 } as any);

    renderWithProviders(<PointsDisplay />);

    // Wait for component to render with data
    const pointsLabel = await screen.findByText('Points');
    expect(pointsLabel).toBeInTheDocument();
  });

  it('should display points value when available', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { getBalance } = await import('../../api/loyalty');
    vi.mocked(getBalance).mockResolvedValue({ points: 150 } as any);

    renderWithProviders(<PointsDisplay />);

    // Wait for points to be displayed
    const pointsElement = await screen.findByText('150', { exact: false });
    expect(pointsElement).toBeInTheDocument();
  });

  it('should be a clickable link to loyalty page', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { getBalance } = await import('../../api/loyalty');
    vi.mocked(getBalance).mockResolvedValue({ points: 100 } as any);

    renderWithProviders(<PointsDisplay />);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', '/loyalty');
    expect(link).toHaveAttribute('title', 'View Loyalty Rewards');
  });

  it('should have star icon', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { getBalance } = await import('../../api/loyalty');
    vi.mocked(getBalance).mockResolvedValue({ points: 100 } as any);

    const { container } = renderWithProviders(<PointsDisplay />);

    // Wait for component to render
    await screen.findByText('Points');

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
