import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, GitFork, Eye, ExternalLink } from "lucide-react"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  updated_at: string
  owner: {
    avatar_url: string
    login: string
  }
}

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-600",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  Ruby: "bg-red-400",
  C: "bg-gray-500",
  "C++": "bg-pink-500",
  "C#": "bg-purple-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-400",
  Shell: "bg-green-400",
  HTML: "bg-orange-500",
  CSS: "bg-purple-300",
  Dart: "bg-teal-400",
  PHP: "bg-indigo-400",
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function RepoTable() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("https://api.github.com/orgs/anthropics/repos?sort=stars&per_page=30")
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
        return res.json()
      })
      .then((data: GitHubRepo[]) => {
        setRepos(data.sort((a, b) => b.stargazers_count - a.stargazers_count))
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Erro ao carregar repositorios</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[280px]">Repositorio</TableHead>
              <TableHead className="hidden md:table-cell">Descricao</TableHead>
              <TableHead className="w-[100px]">Linguagem</TableHead>
              <TableHead className="w-[80px] text-right">
                <Star className="inline h-4 w-4" />
              </TableHead>
              <TableHead className="w-[80px] text-right hidden sm:table-cell">
                <GitFork className="inline h-4 w-4" />
              </TableHead>
              <TableHead className="w-[80px] text-right hidden sm:table-cell">
                <Eye className="inline h-4 w-4" />
              </TableHead>
              <TableHead className="w-[110px] hidden lg:table-cell">Atualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-60" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              : repos.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="h-6 w-6 rounded-full"
                        />
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {repo.name}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground text-sm line-clamp-1">
                        {repo.description || "Sem descricao"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {repo.language && (
                        <Badge variant="secondary" className="gap-1.5 text-xs">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              languageColors[repo.language] || "bg-gray-400"
                            }`}
                          />
                          {repo.language}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatNumber(repo.stargazers_count)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                      {formatNumber(repo.forks_count)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                      {formatNumber(repo.watchers_count)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                      {formatDate(repo.updated_at)}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && repos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum repositorio encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && (
        <p className="text-xs text-muted-foreground text-center">
          Mostrando {repos.length} de {repos.length} repositorios da org{" "}
          <a
            href="https://github.com/anthropics"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            anthropics
          </a>
        </p>
      )}
    </div>
  )
}
