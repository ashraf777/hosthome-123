"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", revenue: 1860 },
  { month: "February", revenue: 3050 },
  { month: "March", revenue: 2370 },
  { month: "April", revenue: 730 },
  { month: "May", revenue: 2090 },
  { month: "June", revenue: 2140 },
  { month: "July", revenue: 2800 },
  { month: "August", revenue: 3200 },
  { month: "September", revenue: 2500 },
  { month: "October", revenue: 1900 },
  { month: "November", revenue: 2400 },
  { month: "December", revenue: 3800 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
}

export function Overview() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis
            dataKey="month"
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
            cursor={false}
            content={<ChartTooltipContent 
              formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)}
            />} 
          />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
