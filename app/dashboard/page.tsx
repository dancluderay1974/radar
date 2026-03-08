export const runtime = 'edge'

import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, Plus, FolderGit2 } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Connect a repository to start building with AI assistance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Connect Repository Card */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Connect Repository
            </CardTitle>
            <CardDescription>
              Link a GitHub repository to start editing with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2">
              <GitBranch className="h-4 w-4" />
              Connect GitHub
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for connected repos */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
              <FolderGit2 className="h-5 w-5" />
              No Projects Yet
            </CardTitle>
            <CardDescription>
              Your connected repositories will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect a repository to get started with AI-powered development.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workspace Preview Area */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Workspace</h2>
        <Card className="min-h-[400px]">
          <CardContent className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <FolderGit2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">No Project Selected</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect a GitHub repository to start the AI-powered workspace
              </p>
              <Button variant="outline" className="gap-2">
                <GitBranch className="h-4 w-4" />
                Connect Repository
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
