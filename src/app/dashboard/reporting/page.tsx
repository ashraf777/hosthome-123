
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Download, BarChart2 } from "lucide-react"
import { DateRange } from "react-day-picker"

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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { date: "2024-07-01", revenue: 450, bookings: 3 },
  { date: "2024-07-02", revenue: 300, bookings: 2 },
  { date: "2024-07-03", revenue: 550, bookings: 4 },
  { date: "2024-07-04", revenue: 750, bookings: 5 },
  { date: "2024-07-05", revenue: 600, bookings: 4 },
  { date: "2024-07-06", revenue: 800, bookings: 6 },
  { date: "2024-07-07", revenue: 950, bookings: 7 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const tableData = [
    { id: 'BK-001', property: 'Beachside Villa', checkIn: '2024-07-01', checkOut: '2024-07-04', revenue: 450, channel: 'Airbnb'},
    { id: 'BK-002', property: 'Cozy Downtown Apartment', checkIn: '2024-07-02', checkOut: '2024-07-03', revenue: 120, channel: 'Booking.com'},
    { id: 'BK-003', property: 'Mountain Cabin Retreat', checkIn: '2024-07-04', checkOut: '2024-07-08', revenue: 750, channel: 'Direct'},
    { id: 'BK-004', property: 'Beachside Villa', checkIn: '2024-07-05', checkOut: '2024-07-09', revenue: 600, channel: 'Expedia'},
    { id: 'BK-005', property: 'Urban Studio Loft', checkIn: '2024-07-06', checkOut: '2024-07-07', revenue: 95, channel: 'Airbnb'},
]

export default function ReportingPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 6, 1),
    to: new Date(2024, 6, 7),
  })
  const [showReport, setShowReport] = React.useState(false)

  const handleGenerateReport = () => {
    setShowReport(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h1>
        <p className="text-muted-foreground">
          Gain insights into your property management performance.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Generator</CardTitle>
          <CardDescription>Select your criteria to generate a report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className={cn("grid gap-2")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
                <PopoverContent className="w-auto p-0" align="start">
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
             <Select defaultValue="booking-analysis">
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking-analysis">Booking Analysis</SelectItem>
                <SelectItem value="revenue-report">Revenue Report</SelectItem>
                <SelectItem value="occupancy-report">Occupancy Report</SelectItem>
                <SelectItem value="pnl-statement">Profit & Loss</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="prop-001">Cozy Downtown Apartment</SelectItem>
                <SelectItem value="prop-002">Beachside Villa</SelectItem>
                <SelectItem value="prop-003">Mountain Cabin Retreat</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateReport}>
                <BarChart2 className="mr-2" />
                Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReport && (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <span className="text-muted-foreground">$</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$3,455</div>
                        <p className="text-xs text-muted-foreground">+5.2% from last period</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <span className="text-muted-foreground">#</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">25</div>
                        <p className="text-xs text-muted-foreground">+10 from last period</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Daily Rate</CardTitle>
                        <span className="text-muted-foreground">ADR</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$138.20</div>
                         <p className="text-xs text-muted-foreground">-1.5% from last period</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <span className="text-muted-foreground">%</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">88%</div>
                         <p className="text-xs text-muted-foreground">+3% from last period</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Booking Analysis Report</CardTitle>
                        <CardDescription>
                            Displaying results for July 1, 2024 - July 7, 2024
                        </CardDescription>
                    </div>
                     <Button variant="outline">
                        <Download className="mr-2"/>
                        Download
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-8">
                     <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => format(new Date(value), 'MMM d')} />
                                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent 
                                    formatter={(value, name) => (name === "revenue" ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value as number) : value)}
                                    />} 
                                />
                                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="bookings" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                             <TableHead>Channel</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {tableData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="font-medium">{row.id}</TableCell>
                                <TableCell>{row.property}</TableCell>
                                <TableCell>{row.checkIn}</TableCell>
                                <TableCell>{row.checkOut}</TableCell>
                                <TableCell>{row.channel}</TableCell>
                                <TableCell className="text-right font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.revenue)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
