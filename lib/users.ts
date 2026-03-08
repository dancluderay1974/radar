// In-memory user store - no passwords needed since auth is via GitHub OAuth
export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "user"
  githubId?: string
  createdAt: Date
}

const users: User[] = [
  {
    id: "1",
    username: "dan",
    email: "dan@e-yar.com",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
]

export function getUsers(): User[] {
  return users
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email)
}

export function addUser(
  username: string,
  email: string,
  role: "admin" | "user" = "user",
  githubId?: string
): User {
  const newUser: User = {
    id: String(users.length + 1),
    username,
    email,
    role,
    githubId,
    createdAt: new Date(),
  }
  users.push(newUser)
  return newUser
}

export function updateUser(
  id: string,
  data: Partial<Pick<User, "username" | "email" | "role">>
): User | null {
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return null
  users[index] = { ...users[index], ...data }
  return users[index]
}

export function deleteUser(id: string): boolean {
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return false
  users.splice(index, 1)
  return true
}
