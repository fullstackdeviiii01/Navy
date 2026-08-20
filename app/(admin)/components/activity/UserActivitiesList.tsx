// components/activity/UserActivitiesList.tsx
"use client"

import { FaSignInAlt, FaUserPlus, FaShoppingCart, FaEye } from "react-icons/fa"

interface UserActivity {
  _id: string
  email: string
  name: string
  activity_type: string
  activity_date: string
  details: string
}

interface UserActivitiesListProps {
  activities: UserActivity[]
}

export default function UserActivitiesList({ activities }: UserActivitiesListProps) {

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <FaSignInAlt className="text-blue-500 text-sm sm:text-base"  />
      case "signup":
        return <FaUserPlus className="text-green-500 text-sm sm:text-base"  />
      case "order":
        return <FaShoppingCart className="text-purple-500 text-sm sm:text-base" />
      default:
        return <FaEye className="text-gray-500 text-sm sm:text-base"/>
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
        No user activities found for the selected time period.
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-3 sm:p-4 border border-theme-border-light dark:border-theme-border-dark"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">{getActivityIcon(activity.activity_type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {activity.name || activity.email}
                  </p>
                  <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark break-words">
                    {activity.details}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark whitespace-nowrap flex-shrink-0">
                  <div className="hidden sm:block">
                    {new Date(activity.activity_date).toLocaleString()}
                  </div>
                  <div className="sm:hidden">
                    <div>{new Date(activity.activity_date).toLocaleDateString()}</div>
                    <div className="text-xs">{new Date(activity.activity_date).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}