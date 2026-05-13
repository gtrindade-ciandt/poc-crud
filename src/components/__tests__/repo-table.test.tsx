import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockReposWithLanguages = [
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
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/123', login: 'anthropics' },
  },
  {
    id: 2,
    name: 'anthropic-sdk-python',
    full_name: 'anthropics/anthropic-sdk-python',
    description: 'Python SDK',
    html_url: 'https://github.com/anthropics/anthropic-sdk-python',
    language: 'Python',
    stargazers_count: 800,
    forks_count: 90,
    watchers_count: 800,
    open_issues_count: 10,
    updated_at: '2025-02-20T14:30:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/456', login: 'anthropics' },
  },
  {
    id: 3,
    name: 'anthropic-sdk-typescript',
    full_name: 'anthropics/anthropic-sdk-typescript',
    description: 'TypeScript SDK',
    html_url: 'https://github.com/anthropics/anthropic-sdk-typescript',
    language: 'TypeScript',
    stargazers_count: 600,
    forks_count: 50,
    watchers_count: 600,
    open_issues_count: 5,
    updated_at: '2025-03-10T08:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/789', login: 'anthropics' },
  },
  {
    id: 4,
    name: 'courses',
    full_name: 'anthropics/courses',
    description: 'Educational courses',
    html_url: 'https://github.com/anthropics/courses',
    language: null,
    stargazers_count: 400,
    forks_count: 30,
    watchers_count: 400,
    open_issues_count: 2,
    updated_at: '2025-04-01T12:00:00Z',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/101', login: 'anthropics' },
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

async function openLanguageFilter() {
  const trigger = await screen.findByRole('combobox', { name: /linguagem/i });
  await userEvent.click(trigger);
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
      expect(avatars[0]).toHaveAttribute('src', 'https://avatars.githubusercontent.com/u/123');
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

  describe('name search', () => {
    it('renders search input with placeholder "Buscar repositorio..."', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      expect(screen.getByPlaceholderText('Buscar repositorio...')).toBeInTheDocument();
    });

    it('shows all repos immediately when typing before debounce fires', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      fireEvent.change(input, { target: { value: 'claude' } });

      // Before the 300ms debounce fires, all repos must still be visible
      expect(screen.getByText('claude-code')).toBeInTheDocument();
      expect(screen.getByText('anthropic-sdk-python')).toBeInTheDocument();
    });

    it('filters repos by name after 300ms debounce fires', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      fireEvent.change(input, { target: { value: 'claude' } });

      await waitFor(() => {
        expect(screen.queryByText('anthropic-sdk-python')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('claude-code')).toBeInTheDocument();
      expect(screen.queryByText('courses')).not.toBeInTheDocument();
    });

    it('filters repos by description after debounce fires', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      // 'CLI tool' matches claude-code's description, not its name
      fireEvent.change(input, { target: { value: 'CLI tool' } });

      await waitFor(() => {
        expect(screen.queryByText('anthropic-sdk-python')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('claude-code')).toBeInTheDocument();
      expect(screen.queryByText('courses')).not.toBeInTheDocument();
    });

    it('shows all repos when search input is cleared', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      fireEvent.change(input, { target: { value: 'claude' } });

      await waitFor(() => {
        expect(screen.queryByText('anthropic-sdk-python')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('anthropic-sdk-python')).toBeInTheDocument();
      }, { timeout: 1000 });

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(5); // 1 header + 4 repos
    });

    it('does not crash when a repo has null description', async () => {
      // mockRepos[1] (anthropic-sdk-python) has description: null
      // Searching 'cli' matches claude-code by description; anthropic-sdk-python must be excluded
      // without throwing (null?.toLowerCase().includes(term) ?? false)
      mockFetchSuccess(mockRepos);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      fireEvent.change(input, { target: { value: 'cli' } });

      // Wait for debounce to fire and the null-description repo to disappear
      await waitFor(() => {
        expect(screen.queryByText('anthropic-sdk-python')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('claude-code')).toBeInTheDocument();
    });

    it('applies search on top of active language filter', async () => {
      // Filter first, then search — search should narrow within filtered set
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      await openLanguageFilter();
      await userEvent.click(screen.getByRole('option', { name: /TypeScript/ }));

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      fireEvent.change(input, { target: { value: 'claude' } });

      await waitFor(() => {
        expect(screen.queryByText('anthropic-sdk-typescript')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('claude-code')).toBeInTheDocument();
      expect(screen.queryByText('anthropic-sdk-python')).not.toBeInTheDocument();
    });

    it('narrows search results when language filter is applied after searching', async () => {
      // Search first, then filter — language filter should narrow the search results
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      // 'sdk' matches both Python and TypeScript SDK repos
      fireEvent.change(input, { target: { value: 'sdk' } });

      await waitFor(() => {
        expect(screen.getByText('anthropic-sdk-python')).toBeInTheDocument();
      }, { timeout: 1000 });
      expect(screen.getByText('anthropic-sdk-typescript')).toBeInTheDocument();

      // Now filter to Python only — TypeScript SDK should disappear
      await openLanguageFilter();
      await userEvent.click(screen.getByRole('option', { name: /Python/ }));

      expect(screen.getByText('anthropic-sdk-python')).toBeInTheDocument();
      expect(screen.queryByText('anthropic-sdk-typescript')).not.toBeInTheDocument();
    });

    it('updates footer count to reflect search results', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);
      await screen.findByText('claude-code');

      const input = screen.getByPlaceholderText('Buscar repositorio...');
      fireEvent.change(input, { target: { value: 'claude' } });

      await waitFor(() => {
        expect(screen.getByText(/Mostrando 1 de 4 repositorios/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('language filter', () => {
    it('renders dropdown with unique sorted languages', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);

      await openLanguageFilter();

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('Todas as linguagens');
      expect(options[1]).toHaveTextContent('Python');
      expect(options[2]).toHaveTextContent('TypeScript');
      expect(options).toHaveLength(3);
    });

    it('filters repos when a language is selected', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);

      await openLanguageFilter();
      await userEvent.click(screen.getByRole('option', { name: /TypeScript/ }));

      const rows = screen.getAllByRole('row');
      // 1 header + 2 TypeScript repos = 3
      expect(rows).toHaveLength(3);
      expect(screen.getByText('claude-code')).toBeInTheDocument();
      expect(screen.getByText('anthropic-sdk-typescript')).toBeInTheDocument();
      expect(screen.queryByText('anthropic-sdk-python')).not.toBeInTheDocument();
      expect(screen.queryByText('courses')).not.toBeInTheDocument();
    });

    it('shows all repos including null-language when "Todas" is selected', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);

      // First filter by Python
      await openLanguageFilter();
      await userEvent.click(screen.getByRole('option', { name: /Python/ }));

      // Then switch back to "Todas"
      await openLanguageFilter();
      await userEvent.click(screen.getByRole('option', { name: /Todas as linguagens/ }));

      const rows = screen.getAllByRole('row');
      // 1 header + 4 repos = 5
      expect(rows).toHaveLength(5);
      expect(screen.getByText('courses')).toBeInTheDocument();
    });

    it('updates footer count when filter is active', async () => {
      mockFetchSuccess(mockReposWithLanguages);
      render(<RepoTable />);

      await openLanguageFilter();
      await userEvent.click(screen.getByRole('option', { name: /Python/ }));

      expect(screen.getByText(/Mostrando 1 de 4 repositorios/)).toBeInTheDocument();
    });

    it('shows empty state and filter with only "Todas" when API returns empty list', async () => {
      mockFetchSuccess([]);
      render(<RepoTable />);

      await waitFor(() => {
        expect(screen.getByText('Nenhum repositorio encontrado.')).toBeInTheDocument();
      });
      expect(screen.getByRole('combobox', { name: /linguagem/i })).toBeInTheDocument();
      expect(screen.getByText(/Mostrando 0 de 0 repositorios/)).toBeInTheDocument();
    });

    it('does not render the filter during loading', () => {
      vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}));
      render(<RepoTable />);

      expect(screen.queryByRole('combobox', { name: /linguagem/i })).not.toBeInTheDocument();
    });
  });
});
