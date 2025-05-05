"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface RevenueData {
  date: string
  amount: number
}

export default function Overview() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/revenue/overview')
        if (!response.ok) throw new Error('Failed to fetch revenue data')
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error("Error fetching revenue data:", error)
        // Use mock data for demonstration
        setData([
          { date: "Jan", amount: 8500 },
          { date: "Feb", amount: 9200 },
          { date: "Mar", amount: 10500 },
          { date: "Apr", amount: 9800 },
          { date: "May", amount: 11200 },
          { date: "Jun", amount: 12500 },
          { date: "Jul", amount: 13800 },
          { date: "Aug", amount: 14200 },
          { date: "Sep", amount: 13500 },
          { date: "Oct", amount: 12800 },
          { date: "Nov", amount: 15200 },
          { date: "Dec", amount: 16500 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-white p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-gray-500">
                                Revenue
                              </span>
                              <span className="font-bold text-gray-900">
                                ${payload[0].value?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 