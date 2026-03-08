import bcrypt from "bcryptjs"

export interface User {
  id: string
  username: string
  email: string
  passwordHash: string
  role: "admin" | "user"
  createdAt: Date
}

// Generate hash at module load time (safe in Node.js server environment)
const DAN_PASSWORD_HASH = bcrypt.hashSync("dan", 10)

// In-memory user store (replace with database in production)
const users: User[] = [
  {
    id: "1",
    username: "dan",
    email: "dan@e-yar.com",
    passwordHash: DAN_PASSWORD_HASH,
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
]

console.log("[v0] Users initialized, dan hash generated")

export function getUsers(): Omit<User, "passwordHash">[] {
  return users.map(({ passwordHash, ...user }) => user)
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username)
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<User | null> {
  console.log("[v0] validateCredentials called with username:", username)
  const user = getUserByUsername(username)
  if (!user) {
    console.log("[v0] User not found:", username)
    return null
  }

  console.log("[v0] Found user:", user.username, "checking password...")
  const isValid = await bcrypt.compare(password, user.passwordHash)
  console.log("[v0] Password valid:", isValid)
  return isValid ? user : null
}

export function addUser(
  username: string,
  email: string,
  password: string,
  role: "admin" | "user" = "user"
): User {
  const newUser: User = {
    id: String(users.length + 1),
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
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
