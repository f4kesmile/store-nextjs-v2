// src/types/index.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      roleId: number
      permissions: string[]
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    roleId: number
    permissions: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    roleId: number
    permissions: string[]
  }
}
