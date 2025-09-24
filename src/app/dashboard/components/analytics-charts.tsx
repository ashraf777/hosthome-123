"use client"

import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const bookingTrendsData = [
  { date: "2024-07-01", bookings: 5 },
  { date: "2024-07-02", bookings: 8 },
  { date: "2024-07-03", bookings: 7 },
  { date: "2024-07-04", bookings: 12 },
  { date: "2024-07-05", bookings: 15 },
  { date: "2024-07-06", bookings: 10 },
  { date: "2024-07-07", bookings: 14 },
];

const bookingTrendsConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const occupancyData = [
  { property: "Beachside Villa", occupancy: 85, color: "hsl(var(--chart-1))" },
  { property: "Cozy Downtown Apartment", occupancy: 70, color: "hsl(var(--chart-2))" },
  { property: "Mountain Cabin Retreat", occupancy: 60, color: "hsl(var(--chart-3))" },
  { property: "Urban Studio Loft", occupancy: 90, color: "hsl(var(--chart-4))" },
];

const occupancyConfig = {
  occupancy: {
    label: "Occupancy",
  },
} satisfies ChartConfig

export function AnalyticsCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
       <Card>
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
          <CardDescription>Daily booking volume over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={bookingTrendsConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
                <LineChart data={bookingTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }}/>
                </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Occupancy by Property</CardTitle>
          <CardDescription>Current occupancy rate for each property.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={occupancyConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={occupancyData} dataKey="occupancy" nameKey="property" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                         {occupancyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent nameKey="property" />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
