export const runtime = "edge"

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
    const { username, email, role } = body

    if (!username || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user = addUser(username, email, role || "user")
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
