import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateUser, deleteUser, getUserById } from "@/lib/users"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = getUserById(id)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { passwordHash, ...safeUser } = user
  return NextResponse.json(safeUser)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { username, email, role } = body

    const user = updateUser(id, { username, email, role })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { passwordHash, ...safeUser } = user
    return NextResponse.json(safeUser)
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Prevent deleting yourself
  if (session.user.id === id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    )
  }

  const success = deleteUser(id)
  if (!success) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
