"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../context/UserContext"

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useUser()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout()
        router.push("/")
      } catch (error) {
        console.error("Logout failed:", error)
        router.push("/")
      }
    }

    handleLogout()
  }, [router, logout])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  )
}
