import type { MockData } from "@/types/dashboard"

export const defaultDashboardData: MockData = {
  dashboardStats: [
    {
      label: "Total Memories",
      value: "0",
      description: "Memories created",
      intent: "neutral",
      icon: "camera",
      direction: "up"
    },
    {
      label: "Completed Items",
      value: "0",
      description: "Bucket list items completed",
      intent: "neutral",
      icon: "check",
      direction: "up"
    },
    {
      label: "Points Earned",
      value: "0",
      description: "Total points",
      intent: "positive",
      icon: "trophy",
      direction: "up"
    }
  ],
  chartData: {
    week: [],
    month: [],
    year: []
  },
  rebelsRanking: [],
  securityStatus: [],
  notifications: [],
  widgetData: {
    location: "Global",
    timezone: "UTC",
    temperature: "20°C",
    weather: "Sunny",
    date: new Date().toISOString()
  }
}
