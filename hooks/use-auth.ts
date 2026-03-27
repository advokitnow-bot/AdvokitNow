"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  avatar: string
  id: string
  phoneNumber: string
  name: string | null
  subscription: string | null
  docUrl: string | null
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setAuthState({ user: data.user, loading: false, error: null })
      } else {
        setAuthState({ user: null, loading: false, error: null })
      }
    } catch (error) {
      setAuthState({ user: null, loading: false, error: "Failed to check authentication" })
    }
  }


  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setAuthState({ user: null, loading: false, error: null })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    ...authState,
    logout,
    checkAuth,
  }
}
