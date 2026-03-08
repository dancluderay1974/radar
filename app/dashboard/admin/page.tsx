export const runtime = 'edge'

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUsers } from "@/lib/users"
import { AdminUsersTable } from "@/components/admin/users-table"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const users = getUsers()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users and system settings.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  )
}
