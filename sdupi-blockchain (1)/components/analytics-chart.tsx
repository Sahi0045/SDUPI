"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface ChartData {
  time: string
  tps: number
  latency: number
  transactions: number
}

interface AnalyticsChartProps {
  realTimeData?: {
    network: {
      tps: number
      latency: number
    }
    blockchain: {
      totalTransactions: number
    }
  } | null
}

export function AnalyticsChart({ realTimeData }: AnalyticsChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<"tps" | "latency" | "transactions">("tps")

  useEffect(() => {
    // Generate historical data for the last 24 hours
    const generateHistoricalData = () => {
      const data: ChartData[] = []
      const now = new Date()

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        // Use real data if available, otherwise use realistic defaults
        const baseTPS = realTimeData?.network?.tps || 45000
        const baseLatency = realTimeData?.network?.latency || 7
        const baseTransactions = realTimeData?.blockchain?.totalTransactions || 15000
        
        data.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tps: baseTPS + Math.floor(Math.random() * 2000 - 1000),
          latency: Math.max(1, baseLatency + (Math.random() * 2 - 1)),
          transactions: baseTransactions + Math.floor(Math.random() * 1000 - 500),
        })
      }
      return data
    }

    setChartData(generateHistoricalData())

    // Update data every 5 minutes with real data influence
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        
        // Use real data if available
        const baseTPS = realTimeData?.network?.tps || 45000
        const baseLatency = realTimeData?.network?.latency || 7
        const baseTransactions = realTimeData?.blockchain?.totalTransactions || 15000
        
        newData.push({
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tps: baseTPS + Math.floor(Math.random() * 2000 - 1000),
          latency: Math.max(1, baseLatency + (Math.random() * 2 - 1)),
          transactions: baseTransactions + Math.floor(Math.random() * 1000 - 500),
        })
        return newData
      })
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [realTimeData])

  const getMetricData = () => {
    switch (selectedMetric) {
      case "tps":
        return { data: chartData.map((d) => d.tps), label: "TPS", color: "text-primary", icon: Zap }
      case "latency":
        return { data: chartData.map((d) => d.latency), label: "Latency (ms)", color: "text-secondary", icon: Activity }
      case "transactions":
        return {
          data: chartData.map((d) => d.transactions),
          label: "Transactions/Hour",
          color: "text-accent",
          icon: TrendingUp,
        }
    }
  }

  const metricData = getMetricData()
  const currentValue = metricData.data[metricData.data.length - 1] || 0
  const previousValue = metricData.data[metricData.data.length - 2] || 0
  const change = (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
  const isPositive = Number.parseFloat(change) > 0

  // Simple ASCII-style chart visualization
  const renderMiniChart = () => {
    const max = Math.max(...metricData.data)
    const min = Math.min(...metricData.data)
    const range = max - min

    return (
      <div className="flex items-end gap-1 h-16 mt-4">
        {metricData.data.slice(-12).map((value, index) => {
          const height = range > 0 ? ((value - min) / range) * 60 + 4 : 32
          return (
            <div
              key={index}
              className={`w-2 bg-gradient-to-t from-primary/60 to-primary rounded-sm transition-all duration-300`}
              style={{ height: `${height}px` }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Advanced Analytics
            </CardTitle>
            <CardDescription>24-hour performance trends and insights</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={selectedMetric === "tps" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedMetric("tps")}
            >
              TPS
            </Badge>
            <Badge
              variant={selectedMetric === "latency" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedMetric("latency")}
            >
              Latency
            </Badge>
            <Badge
              variant={selectedMetric === "transactions" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedMetric("transactions")}
            >
              Volume
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <metricData.icon className={`w-4 h-4 ${metricData.color}`} />
              <span className="text-sm font-medium">{metricData.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${metricData.color}`}>
                {selectedMetric === "latency" ? currentValue.toFixed(2) : Math.round(currentValue).toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(Number.parseFloat(change))}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs previous hour</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Last 12 Hours Trend</p>
            {renderMiniChart()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Peak TPS</p>
            <p className="font-semibold text-primary">{Math.max(...chartData.map((d) => d.tps)).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg Latency</p>
            <p className="font-semibold text-secondary">
              {(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length).toFixed(1)}ms
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="font-semibold text-accent">
              {chartData.reduce((sum, d) => sum + d.transactions, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
