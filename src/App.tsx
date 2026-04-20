import { RepoTable } from "@/components/repo-table"
import { GitBranch } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                GitHub Explorer
              </h1>
              <p className="text-sm text-muted-foreground">
                Repositorios populares da Anthropic
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <RepoTable />
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <p className="text-xs text-muted-foreground text-center">
            Dados obtidos da API publica do GitHub &middot; React + Vite + shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
