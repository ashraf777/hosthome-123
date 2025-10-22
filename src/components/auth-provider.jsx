"use client"

import { AuthProvider as AuthProviderContext } from "@/contexts/auth-context"

export function AuthProvider({ children }) {
  return <AuthProviderContext>{children}</AuthProviderContext>
}
