'use client'

import { AuthProviderContext } from "@/contexts/auth-context.jsx"

export function AuthProvider({ children }) {
  return <AuthProviderContext>{children}</AuthProviderContext>
}
