import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RepoTable } from '@/components/repo-table';

const mockRepos = [
  {
    id: 1,
    name: 'claude-code',
    full_name: 'anthropics/claude-code',
    description: 'CLI tool for Claude',
    html_url: 'https://github.com/anthropics/claude-code',
    language: 'TypeScript',
    stargazers_count: 25000,
    forks_count: 1200,
    watchers_count: 25000,
    open_issues_count: 50,
    updated_at: '2025-01-15T10:00:00Z',
    owner: {
      avatar_url: 'https://avatars.githubusercontent.com/u/123',
      login: 'anthropics',
    },
  },
  {
    id: 2,
    name: 'anthropic-sdk-python',
    full_name: 'anthropics/anthropic-sdk-python',
    description: null,
    html_url: 'https://github.com/anthropics/anthropic-sdk-python',
    language: 'Python',
    stargazers_count: 800,
    forks_count: 90,
    watchers_count: 800,
    open_issues_count: 10,
    updated_at: '2025-02-20T14:30:00Z',
    owner: {
      avatar_url: 'https://avatars.githubusercontent.com/u/456',
      login: 'anthropics',
    },
  },
];

function mockFetchSuccess(data: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function mockFetchError() {
  vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
}

function mockFetchHttpError(status: number) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RepoTable', () => {
  describe('loading state', () => {
    it('renders skeleton rows while fetching', () => {
      // Never resolve the fetch to keep loading state
      vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}));

      render(<RepoTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // The component renders 8 skeleton rows during loading
      const rows = screen.getAllByRole('row');
      // 1 header row + 8 skeleton rows = 9
      expect(rows).toHaveLength(9);
    });

    it('does not show the footer count while loading', () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}));

      render(<RepoTable />);

      expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when fetch rejects', async () => {
      mockFetchError();

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar repositorios')).toBeInTheDocument();
      });
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('shows error message when API returns non-ok status', async () => {
      mockFetchHttpError(403);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar repositorios')).toBeInTheDocument();
      });
      expect(screen.getByText('GitHub API error: 403')).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    it('renders repo names as links', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      const link = await screen.findByRole('link', { name: /claude-code/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://github.com/anthropics/claude-code');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders all repos from the response', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      await screen.findByText('claude-code');
      expect(screen.getByText('anthropic-sdk-python')).toBeInTheDocument();
    });

    it('displays formatted star counts using formatNumber', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      // 25000 should render as "25.0k"
      await waitFor(() => {
        expect(screen.getAllByText('25.0k')).toHaveLength(2); // stars + watchers
      });
      // 800 should render as "800"
      expect(screen.getAllByText('800')).toHaveLength(2); // stars + watchers
    });

    it('displays formatted fork counts', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      // 1200 -> "1.2k"
      await waitFor(() => {
        expect(screen.getByText('1.2k')).toBeInTheDocument();
      });
      // 90 -> "90"
      expect(screen.getByText('90')).toBeInTheDocument();
    });

    it('displays language badges', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    it('displays repo description', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('CLI tool for Claude')).toBeInTheDocument();
      });
    });

    it('displays fallback text when description is null', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('Sem descricao')).toBeInTheDocument();
      });
    });

    it('displays footer with repo count', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText(/Mostrando 2 de 2 repositorios/)).toBeInTheDocument();
      });
    });

    it('displays formatted dates in pt-BR locale', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      // '2025-01-15T10:00:00Z' formatted with pt-BR { day: '2-digit', month: 'short', year: 'numeric' }
      await waitFor(() => {
        expect(screen.getByText(/15 de jan\. de 2025/)).toBeInTheDocument();
      });
    });

    it('renders owner avatar images', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      const avatars = await screen.findAllByRole('img', { name: 'anthropics' });
      expect(avatars).toHaveLength(2);
      expect(avatars[0]).toHaveAttribute(
        'src',
        'https://avatars.githubusercontent.com/u/123'
      );
    });
  });

  describe('empty state', () => {
    it('shows empty message when repos array is empty', async () => {
      mockFetchSuccess([]);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum repositorio encontrado.')).toBeInTheDocument();
      });
    });

    it('shows footer with zero count when repos array is empty', async () => {
      mockFetchSuccess([]);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText(/Mostrando 0 de 0 repositorios/)).toBeInTheDocument();
      });
    });
  });

  describe('formatNumber (tested indirectly)', () => {
    it('renders numbers below 1000 as-is', async () => {
      const repoWith999Stars = [
        {
          ...mockRepos[0],
          id: 10,
          stargazers_count: 999,
          forks_count: 50,
          watchers_count: 999,
        },
      ];
      mockFetchSuccess(repoWith999Stars);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getAllByText('999')).toHaveLength(2); // stars + watchers
      });
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('renders exactly 1000 as "1.0k"', async () => {
      const repoWith1000Stars = [
        {
          ...mockRepos[0],
          id: 11,
          stargazers_count: 1000,
          forks_count: 1000,
          watchers_count: 1000,
        },
      ];
      mockFetchSuccess(repoWith1000Stars);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getAllByText('1.0k')).toHaveLength(3); // stars + forks + watchers
      });
    });

    it('renders 1500 as "1.5k"', async () => {
      const repoWith1500Stars = [
        {
          ...mockRepos[0],
          id: 12,
          stargazers_count: 1500,
          forks_count: 100,
          watchers_count: 1500,
        },
      ];
      mockFetchSuccess(repoWith1500Stars);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getAllByText('1.5k')).toHaveLength(2); // stars + watchers
      });
    });
  });

  describe('formatDate (tested indirectly)', () => {
    it('formats ISO date to pt-BR locale string', async () => {
      const repoWithDate = [
        {
          ...mockRepos[0],
          id: 20,
          updated_at: '2024-07-10T12:00:00Z',
        },
      ];
      mockFetchSuccess(repoWithDate);

      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText(/10 de jul\. de 2024/)).toBeInTheDocument();
      });
    });
  });

  describe('table structure', () => {
    it('renders table headers', async () => {
      mockFetchSuccess(mockRepos);

      render(<RepoTable />);

      await screen.findByText('claude-code');

      expect(screen.getByText('Repositorio')).toBeInTheDocument();
      expect(screen.getByText('Descricao')).toBeInTheDocument();
      expect(screen.getByText('Linguagem')).toBeInTheDocument();
      expect(screen.getByText('Atualizado')).toBeInTheDocument();
    });

    it('sorts repos by stars descending', async () => {
      const unsortedRepos = [
        { ...mockRepos[1], stargazers_count: 100 },
        { ...mockRepos[0], stargazers_count: 5000 },
      ];
      mockFetchSuccess(unsortedRepos);

      render(<RepoTable />);

      await waitFor(() => {
        const links = screen.getAllByRole('link', { name: /claude-code|anthropic-sdk-python/ });
        expect(links[0]).toHaveTextContent('claude-code');
        expect(links[1]).toHaveTextContent('anthropic-sdk-python');
      });
    });
  });
});
