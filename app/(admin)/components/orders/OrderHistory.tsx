"use client"

import { useState, useEffect } from "react"
import { FaSearch, FaEye, FaCalendarAlt, FaDollarSign } from "react-icons/fa"
import Loader from "../../../components/shared/Loader"

interface Order {
  _id: string
  user_email: string
  user_name: string
  order_date: string
  total_amount: number
  status: string
  items_count: number
  payment_method: string
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("30")

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, dateFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/users/orders?status=${statusFilter}&days=${dateFilter}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0

  if (loading) {
  return (
    <div className="relative h-64">
      <Loader />
    </div>
  );
}

 return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">Order History</h2>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-theme-text-muted-light" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-dark" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 border border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredOrders.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FaEye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 border border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FaDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 border border-theme-border-light dark:border-theme-border-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark">Average Order Value</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <FaDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
            <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {order.user_name || "No name"}
                      </div>
                      <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">{order.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {order.items_count} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {order.payment_method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-theme-text-muted-light dark:text-theme-text-muted-dark">
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
