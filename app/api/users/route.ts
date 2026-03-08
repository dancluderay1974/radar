import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUsers, addUser } from "@/lib/users"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = getUsers()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { username, email, password, role } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user = addUser(username, email, password, role || "user")
    const { ...userWithoutPassword } = user
    // Remove passwordHash from response
    const safeUser = {
      id: userWithoutPassword.id,
      username: userWithoutPassword.username,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      createdAt: userWithoutPassword.createdAt,
    }

    return NextResponse.json(safeUser, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
