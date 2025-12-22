'use client'

import * as React from "react"
import Link from "next/link";
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
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
  isWithinInterval,
  subDays,
} from "date-fns"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

const getBadgeVariant = (status) => {
  switch (status) {
    case 'Confirmed':
    case 'Checked In':
    case 'Checked Out':
    case 'Vacant Clean(VC)':
        return 'default';
    case 'Pending':
    case 'Awaiting Payment':
    case 'Booking Inquery':
        return 'secondary';
    case 'Cancel':
    case 'No Show':
    case 'Vacant Dirty(VD)':
        return 'destructive';
    default:
        return 'outline';
  }
}

const getChannelColor = (channel) => {
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

const statusMapping = {
    1: 'Confirmed',
    2: 'Cancel',
    3: 'Checked In',
    4: 'Checked Out',
    5: 'Booking Inquery',
    6: 'Awaiting Payment',
    7: 'No Show',
    8: 'Vacant Dirty(VD)',
    9: 'Vacant Clean(VC)',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [bookings, setBookings] = React.useState([]);
  const [allChannels, setAllChannels] = React.useState([]);
  const [allStatuses, setAllStatuses] = React.useState(Object.values(statusMapping));
  const [selectedChannels, setSelectedChannels] = React.useState([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedBooking, setSelectedBooking] = React.useState(null)
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsResponse, channelsResponse] = await Promise.all([
          api.get('bookings'),
          api.get('channels'),
        ]);

        console.log("Bookings response:", bookingsResponse);

        const bookingsData = bookingsResponse.data.data || bookingsResponse.data;
        const channelsData = channelsResponse.data.data || channelsResponse.data;

        const formattedBookings = bookingsData.map(booking => ({
          id: booking.id,
          guestName: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
          checkIn: new Date(booking.check_in_date),
          checkOut: new Date(booking.check_out_date),
          status: statusMapping[booking.status] || 'Unknown',
          channel: booking.channel?.name || 'N/A',
          total: booking.total_amount,
          roomType: booking.room_type?.name || 'N/A',
          unitIdentifier: booking.property_unit?.unit_identifier || 'N/A',
        }));

        setBookings(formattedBookings);
        
        const channelNames = channelsData.map(c => c.name);
        setAllChannels(channelNames);
        setSelectedChannels(channelNames);
        setSelectedStatuses(Object.values(statusMapping));

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message || "Could not fetch data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
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

  const getBookingsForDay = (day) => {
    return filteredBookings.filter(booking => {
        return isSameDay(day, booking.checkIn) || isWithinInterval(day, { start: booking.checkIn, end: subDays(booking.checkOut, 1) });
    });
  }

  const handleChannelChange = (channel) => (checked) => {
    setSelectedChannels(prev => 
      checked ? [...prev, channel] : prev.filter(c => c !== channel)
    );
  };
  
  const handleStatusChange = (status) => (checked) => {
    setSelectedStatuses(prev => 
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  if (loading) {
      return (
          <div className="flex flex-col gap-6 h-full">
              <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-48" />
                      <div className="flex items-center gap-2">
                          <Skeleton className="h-10 w-10" />
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-10" />
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-36" />
                      <Skeleton className="h-10 w-36" />
                  </div>
              </div>
              <Skeleton className="flex-grow h-96" />
          </div>
      )
  }

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
              {allChannels.map((channel) => (
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
              {allStatuses.map((status) => (
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
                    const isStart = isSameDay(day, booking.checkIn);
                    const isEnd = isSameDay(day, subDays(booking.checkOut, 1));
                    
                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`text-left text-xs px-1 py-0.5 border truncate cursor-pointer w-full
                            ${getChannelColor(booking.channel)}
                            ${isStart ? 'rounded-l-md' : ''}
                            ${isEnd ? 'rounded-r-md' : ''}
                            ${!isStart && !isEnd ? 'rounded-none' : ''}
                        `}
                      >
                        <>
                          <Badge variant={getBadgeVariant(booking.status)} className="mr-1 text-xs px-1 py-0">{booking.status.slice(0,1)}</Badge>
                          {booking.unitIdentifier} ({booking.guestName})
                        </>
                      </button>
                    )
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
            <>
              <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="font-medium text-muted-foreground">Guest:</span>
                  <span>{selectedBooking.guestName}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <span className="font-medium text-muted-foreground">Unit:</span>
                    <span>{selectedBooking.unitIdentifier}</span>
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
                  <span><Badge variant={getBadgeVariant(selectedBooking.status)}>{selectedBooking.status}</Badge></span>
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
              <DialogFooter>
                <Link href={`/dashboard/booking/${selectedBooking.id}/edit`} passHref>
                  <Button>Edit Booking</Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
