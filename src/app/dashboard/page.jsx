
"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Calendar as CalendarIcon, DollarSign, BarChart, Users, BedDouble, FileText, Download } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Overview } from "./components/overview"
import { RecentBookings } from "./components/recent-bookings"
import { AnalyticsCharts } from "./components/analytics-charts"

export default function DashboardPage() {
  const [date, setDate] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const reports = [
    { name: "Monthly Revenue Report", period: "June 2024" },
    { name: "Occupancy Analysis", period: "Q2 2024" },
    { name: "Guest Booking Patterns", period: "2024" },
    { name: "Profit and Loss Statement", period: "June 2024" },
  ]
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
            <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
                Analytics
            </TabsTrigger>
            <TabsTrigger value="reports">
                Reports
            </TabsTrigger>
            </TabsList>
             <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setDate({ from: new Date(), to: new Date() })}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => setDate({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) })}>This Week</Button>
                <Button variant="outline" size="sm" onClick={() => setDate({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}>This Month</Button>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="sm"
                        className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Occupancy Rate
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82.4%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Guests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+230</div>
                <p className="text-xs text-muted-foreground">
                  +18.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Stay Length
                </CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2 Nights</div>
                <p className="text-xs text-muted-foreground">
                  +0.2 from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentBookings />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
         <TabsContent value="analytics" className="space-y-4">
          <AnalyticsCharts />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
              <CardDescription>
                Download your generated reports in CSV or PDF format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.name} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">{report.period}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                         <Button variant="outline" size="sm">
                           <Download className="mr-2 h-4 w-4" />
                           CSV
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
