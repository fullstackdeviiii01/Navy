// app/(admin)/admin/activity/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import ActivityHeader from "../../components/activity/ActivityHeader"
import LoginActivitiesTable from "../../components/activity/LoginActivitiesTable"
import UserDetailsModal from "../../components/activity/UserDetailsModal"
import Loader from "../../../components/shared/Loader"
import { usersApi } from "../../../../lib/api/users"

interface LoginActivity {
  _id: string
  email: string
  name: string
  login_at: string
  ip: string
  method: string
  user_agent?: string
}

const PAGE_SIZE = 10

export default function ActivityPage() {
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<string>("7")
  const [selectedUser, setSelectedUser] = useState<LoginActivity | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchActivities()
  }, [dateFilter])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const data = await usersApi.getActivities(Number(dateFilter))
      setLoginActivities(data.loginActivities || [])
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) return loginActivities
    const q = searchTerm.toLowerCase()
    return loginActivities.filter(
      (a) =>
        a.email?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q)
    )
  }, [loginActivities, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE))
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const viewUserDetails = async (user: LoginActivity) => {
    try {
      const userData = await usersApi.getById(user._id)
      setSelectedUser({ ...user, ...userData })
      setShowUserModal(true)
    } catch (error) {
      // Fallback: show whatever we already have
      setSelectedUser(user)
      setShowUserModal(true)
    }
  }

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ActivityHeader
        dateFilter={dateFilter}
        onDateFilterChange={(val) => { setDateFilter(val); setCurrentPage(1) }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <LoginActivitiesTable
        activities={paginatedActivities}
        onViewUserDetails={viewUserDetails}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <UserDetailsModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
      />
    </div>
  )
}