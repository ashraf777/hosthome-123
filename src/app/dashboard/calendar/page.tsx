"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isWithinInterval,
} from "date-fns"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { CheckedState } from "@radix-ui/react-checkbox"


// Mock Data
const bookings = [
  {
    id: "booking-001",
    guestName: "Olivia Martin",
    checkIn: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
    checkOut: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
    status: "Confirmed",
    channel: "Airbnb",
    total: 796.0,
    roomType: "Entire Place"
  },
  {
    id: "booking-002",
    guestName: "Jackson Lee",
    checkIn: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    checkOut: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
    status: "Pending",
    channel: "Booking.com",
    total: 450.0,
    roomType: "Private Room"
  },
  {
    id: "booking-003",
    guestName: "Isabella Nguyen",
    checkIn: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    checkOut: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    status: "Confirmed",
    channel: "Agoda",
    total: 1100.0,
    roomType: "Entire Place"
  },
  {
    id: "booking-004",
    guestName: "William Kim",
    checkIn: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    checkOut: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    status: "Cancelled",
    channel: "Expedia",
    total: 600.0,
    roomType: "Shared Room"
  },
];

type Booking = typeof bookings[0];

const channels = [
  "Airbnb",
  "Booking.com",
  "Agoda",
  "Expedia",
  "Google Vacation Rentals",
]

const statuses = ["Confirmed", "Pending", "Cancelled"]

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

const getChannelColor = (channel: string) => {
  switch (channel) {
    case 'Airbnb':
      return 'bg-red-500/20 border-red-500 text-red-800 dark:text-red-300';
    case 'Booking.com':
      return 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300';
    case 'Agoda':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-800 dark:text-yellow-300';
    case 'Expedia':
      return 'bg-green-500/20 border-green-500 text-green-800 dark:text-green-300';
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-800 dark:text-gray-300';
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>(channels)
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(statuses)
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null)
  
  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(lastDayOfMonth),
  })
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const filteredBookings = bookings.filter(booking => 
    (selectedChannels.length === 0 || selectedChannels.includes(booking.channel)) &&
    (selectedStatuses.length === 0 || selectedStatuses.includes(booking.status))
  )

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter(booking => 
      isWithinInterval(day, { start: booking.checkIn, end: booking.checkOut }) || isSameDay(day, booking.checkIn)
    )
  }

  const handleChannelChange = (channel: string) => (checked: CheckedState) => {
    setSelectedChannels(prev => 
      checked ? [...prev, channel] : prev.filter(c => c !== channel)
    );
  };
  
  const handleStatusChange = (status: string) => (checked: CheckedState) => {
    setSelectedStatuses(prev => 
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold tracking-tight">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Channels ({selectedChannels.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Channel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {channels.map((channel) => (
                <DropdownMenuCheckboxItem
                  key={channel}
                  checked={selectedChannels.includes(channel)}
                  onCheckedChange={handleChannelChange(channel)}
                >
                  {channel}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Statuses ({selectedStatuses.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={handleStatusChange(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card className="flex-grow">
        <CardContent className="p-0 h-full">
           <div className="grid grid-cols-7 h-full">
            {weekdays.map(day => (
              <div key={day} className="text-center font-medium p-2 border-b border-r text-muted-foreground">{day}</div>
            ))}

            {daysInMonth.map((day, index) => (
              <div
                key={index}
                className={`border-b border-r p-2 flex flex-col gap-1 relative h-[120px] overflow-y-auto
                  ${!isSameMonth(day, currentDate) ? "bg-muted/50 text-muted-foreground" : ""}
                  ${isSameDay(day, new Date()) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
              >
                <div className={`font-medium ${isSameDay(day, new Date()) ? 'text-primary font-bold' : ''}`}>
                  {format(day, "d")}
                </div>
                <div className="flex flex-col gap-1">
                  {getBookingsForDay(day).map(booking => {
                    if (isSameDay(day, booking.checkIn) || (getDay(day) === 0 && isWithinInterval(day, { start: booking.checkIn, end: booking.checkOut }))) {
                      const duration = (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 3600 * 24);
                      const dayOfWeek = getDay(day);
                      const widthSpan = Math.min(duration + 1, 7 - dayOfWeek);
                      
                      return (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={`text-left text-xs rounded-sm px-1 py-0.5 border truncate cursor-pointer ${getChannelColor(booking.channel)}`}
                          style={{ width: `calc(${widthSpan} * 100% + ${widthSpan - 1} * 1px)` }}
                        >
                          <Badge variant={getBadgeVariant(booking.status) as any} className="mr-1 text-xs px-1 py-0">{booking.status.slice(0,1)}</Badge>
                          {booking.guestName}
                        </button>
                      )
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Details for booking ID: {selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground">Guest:</span>
                <span>{selectedBooking.guestName}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground">Check-in:</span>
                <span>{format(selectedBooking.checkIn, 'PPP')}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground">Check-out:</span>
                <span>{format(selectedBooking.checkOut, 'PPP')}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center">
                <span className="font-medium text-muted-foreground">Status:</span>
                <span><Badge variant={getBadgeVariant(selectedBooking.status) as any}>{selectedBooking.status}</Badge></span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center">
                <span className="font-medium text-muted-foreground">Channel:</span>
                 <span className={`text-xs rounded-sm px-2 py-1 border w-fit ${getChannelColor(selectedBooking.channel)}`}>
                  {selectedBooking.channel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground">Room Type:</span>
                <span>{selectedBooking.roomType}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedBooking.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
