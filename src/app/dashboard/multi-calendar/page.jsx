'use client'

import { useState, useMemo, useEffect } from 'react'
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  addDays,
  startOfMonth
} from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"


// Mock Data
const mockHosts = [{ id: '1', name: 'Host Home' }]
const mockProperties = [{ id: '1', name: 'All Properties' }]
const mockChannels = [
    { id: '1', name: "Agoda" }, { id: '2', name: "Agoda Homes" }, { id: '3', name: "Airbnb" }, 
    { id: '4', name: "Booking.com" }, { id: '5', name: "Ctrip" }, { id: '6', name: "Expedia" }, 
    { id: '7', name: "Traveloka" }, { id: '8', name: "Tiket.com" }
]
const bookingStatuses = ["Confirm Booking", "Booking Inquiry", "Awaiting Payment", "Checked-in", "Checked-out", "Vacant Dirty (VD)", "Vacant Clean (VC)", "Maintenance", "Blocked"]

const statusColors = {
    "Confirm Booking": "bg-green-200",
    "Booking Inquiry": "bg-yellow-200",
    "Awaiting Payment": "bg-blue-200",
    "Checked-in": "bg-yellow-400",
    "Checked-out": "bg-red-400",
    "Vacant Dirty (VD)": "bg-green-500",
    "Vacant Clean (VC)": "bg-green-300",
    "Maintenance": "bg-gray-400",
    "Blocked": "bg-gray-400",
};

const generateMockCalendarData = (daysInRange) => {
    const roomTypes = [
        { id: "agile-b-18-13-b", name: "Agile B-18-13 B", rates: [{id: 1, name: "Web Rate"}, {id: 2, name: "Booking.com Rate"}, {id: 3, name: "Ctrip Rate"}] },
        { id: "agile-c-13-09-b", name: "Agile C-13-09 B", rates: [{id: 1, name: "Web Rate"}, {id: 2, name: "Booking.com Rate"}, {id: 3, name: "Ctrip Rate"}] },
        { id: "agile-c-13a-08-lr", name: "Agile C-13A-08 LR", rates: [{id: 1, name: "Web Rate"}, {id: 2, name: "Booking.com Rate"}] },
        { id: "std-room-1", name: "Standard Room 1", rates: [{id: 1, name: "Web Rate"}] },
        { id: "suite-2", name: "Suite 2", rates: [{id: 1, name: "Web Rate"}, {id: 2, name: "Booking.com Rate"}, {id: 3, name: "Ctrip Rate"}] },
    ];

    return roomTypes.map((rt, index) => {
        const dates = {};
        const units = Array.from({ length: (index % 3) + 1 }, (_, i) => ({
            id: `${rt.id}-unit-${i + 1}`,
            name: `Unit ${i + 1}`,
            dates: {},
        }));

        daysInRange.forEach(day => {
            const dayOfMonth = parseInt(format(day, 'd'));
            let inventory = '0|1';
            let price = 'MYR 300.00';
            if (dayOfMonth % 7 < 2) { inventory = "0|1"; price = "MYR 300.00" }
            else if (dayOfMonth % 7 < 4) { inventory = "1|1"; price = "MYR 380.00" }
            else { inventory = "1|1"; price = "MYR 345.00" };

            const ratesData = {};
            rt.rates.forEach(rate => { ratesData[rate.id] = price; })

            dates[format(day, 'yyyy-MM-dd')] = {
                inventory,
                rates: ratesData
            };

            units.forEach(unit => {
                const bookingStatusKeys = Object.keys(statusColors);
                const status = bookingStatusKeys[Math.floor(Math.random() * bookingStatusKeys.length)];
                unit.dates[format(day, 'yyyy-MM-dd')] = { status };
            });
        });
        return { ...rt, dates, units };
    });
}

export default function MultiCalendarPage() {
  const { toast } = useToast();
  const [date, setDate] = useState({
    from: startOfMonth(new Date()),
    to: addDays(startOfMonth(new Date()), 30),
  });
  const [hosts, setHosts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [selectedChannels, setSelectedChannels] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState(bookingStatuses)
  const [loading, setLoading] = useState(true);
  const [expandedRoomTypes, setExpandedRoomTypes] = useState([]);

  const daysInRange = useMemo(() => {
    return date.from && date.to ? eachDayOfInterval({ start: date.from, end: date.to }) : [];
  }, [date])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [h, p, c] = await Promise.all([
            Promise.resolve({data: mockHosts}),
            Promise.resolve({data: mockProperties}),
            Promise.resolve({data: mockChannels})
        ]);

        setHosts(h.data);
        setProperties(p.data);
        setChannels(c.data);

        if (h.data.length > 0) setSelectedHost(h.data[0].id);
        if (p.data.length > 0) setSelectedProperty(p.data[0].id);
        if (c.data.length > 0) setSelectedChannels(c.data.map(ch => ch.name));

      } catch (error) {
        toast({ title: "Error fetching initial data", description: "Displaying mock data instead." });
      } 
    };
    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    const fetchCalendarData = async () => {
        if (!selectedProperty || !daysInRange.length) return;
      try {
        setLoading(true);
        setRoomTypes(generateMockCalendarData(daysInRange));
      } catch (error) {
         toast({ title: "Error fetching calendar data", description: "Displaying mock data instead." });
         setRoomTypes(generateMockCalendarData(daysInRange));
      } finally {
        setLoading(false);
      }
    }
    fetchCalendarData();
  }, [selectedProperty, daysInRange, toast]);

  const handleChannelToggle = (channelName) => {
    setSelectedChannels(prev =>
      prev.includes(channelName) ? prev.filter(c => c !== channelName) : [...prev, channelName]
    )
  }

  const handleStatusRemove = (status) => {
      setSelectedStatuses(prev => prev.filter(s => s !== status));
  }

  const handleResetStatuses = () => {
      setSelectedStatuses(bookingStatuses);
  }

  const handleToggleExpand = (roomTypeId) => {
    setExpandedRoomTypes(prev => 
        prev.includes(roomTypeId) ? prev.filter(id => id !== roomTypeId) : [...prev, roomTypeId]
    );
  }

  const goToPreviousMonth = () => {
      const newFrom = subMonths(date.from, 1);
      const newTo = addDays(newFrom, 30);
      setDate({ from: newFrom, to: newTo });
  }

  const goToNextMonth = () => {
      const newFrom = addMonths(date.from, 1);
      const newTo = addDays(newFrom, 30);
      setDate({ from: newFrom, to: newTo });
  }

  const goToToday = () => {
      const newFrom = startOfMonth(new Date());
      const newTo = addDays(newFrom, 30);
      setDate({ from: newFrom, to: newTo });
  }


  if (loading && hosts.length === 0) {
      return (
          <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 h-screen">
              <Skeleton className="h-40 w-full flex-shrink-0" />
              <Skeleton className="h-20 w-full flex-shrink-0" />
              <Skeleton className="flex-grow h-96 w-full" />
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 h-screen">
      {/* Filters */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Select value={selectedHost} onValueChange={setSelectedHost}>
                  <SelectTrigger><SelectValue placeholder="Select Host" /></SelectTrigger>
                  <SelectContent>{hosts.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger><SelectValue placeholder="Select Property" /></SelectTrigger>
                  <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
          </div>
          <div className="mb-4">
              <div className="flex flex-wrap items-center gap-4">
                  {channels.map(channel => (
                      <div key={channel.id} className="flex items-center gap-2">
                          <Checkbox id={`channel-${channel.id}`} checked={selectedChannels.includes(channel.name)} onCheckedChange={() => handleChannelToggle(channel.name)} />
                          <label htmlFor={`channel-${channel.id}`} className="text-sm font-medium">{channel.name}</label>
                      </div>
                  ))}
              </div>
          </div>
           <div className="flex items-start gap-4">
                <p className="font-semibold text-sm pt-2">Booking Status:</p>
                <div className="flex-grow border rounded-lg p-2 flex flex-wrap items-center gap-2">
                    {selectedStatuses.map(status => (
                        <div key={status} className={cn("flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium border", statusColors[status])}>
                            <span className={cn("w-2 h-2 rounded-full", statusColors[status])}></span>
                            <span>{status}</span>
                            <button onClick={() => handleStatusRemove(status)} className="opacity-75 hover:opacity-100">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" onClick={handleResetStatuses}>Reset</Button>
            </div>
      </div>

      {/* Action Buttons & Date Navigation */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline">Expand All</Button>
                <Button variant="outline">Rate Update</Button>
                <Button variant="outline">Bulk Rate Update</Button>
                <Button variant="destructive" className="bg-red-500 text-white">Block</Button>
                <Button variant="outline">Refresh</Button>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <Popover>
                  <PopoverTrigger asChild>
                  <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                      )}
                  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                      date.to ? (
                          <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
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
              <Button variant="outline" size="icon" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" onClick={goToToday}>Today</Button>
          </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-grow min-h-0 relative">
          <div className="absolute inset-0 overflow-auto">
              <table className="min-w-full border-collapse border-spacing-0">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-20">
                      <tr>
                          <th className="p-2 border-r border-b font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700 z-30 w-[200px] min-w-[200px]">Room Type</th>
                          {daysInRange.map(day => (
                              <th key={day.toString()} className={`p-2 border-r border-b text-center font-semibold w-[120px] min-w-[120px] ${isSameDay(day, new Date()) ? 'bg-blue-200 dark:bg-blue-800' : ''}`}>
                                  <div>{format(day, 'E')}</div>
                                  <div>{format(day, 'd')}</div>
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                      {loading ? (
                          <tr><td colSpan={daysInRange.length + 1} className="text-center p-4">Loading calendar...</td></tr>
                      ) : roomTypes.map(roomType => (
                        <>
                            <tr key={roomType.id} className="border-b">
                                <td className="p-2 border-r font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10 w-[200px] min-w-[200px]">
                                    <div className='flex items-center'>
                                    <Button variant="ghost" size="sm" onClick={() => handleToggleExpand(roomType.id)}>
                                        {expandedRoomTypes.includes(roomType.id) ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                    {roomType.name}
                                    </div>
                                </td>
                                {daysInRange.map(day => {
                                    const dayData = roomType.dates ? roomType.dates[format(day, 'yyyy-MM-dd')] : null;
                                    return (
                                        <td key={day.toString()} className="p-2 border-r text-sm align-top w-[120px] min-w-[120px]">
                                            <div className="font-bold text-center">{dayData?.inventory || 'N/A'}</div>
                                            {(roomType.rates || []).map(rate => (
                                                <div key={rate.id} className="text-center text-xs">{dayData?.rates[rate.id] || 'N/A'}</div>
                                            ))}
                                        </td>
                                    )
                                })}
                            </tr>
                            {expandedRoomTypes.includes(roomType.id) && roomType.units.map(unit => (
                                <tr key={unit.id} className="border-b bg-gray-50 dark:bg-gray-900">
                                    <td className="p-2 border-r font-medium sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 w-[200px] min-w-[200px] pl-10">{unit.name}</td>
                                    {daysInRange.map(day => {
                                        const dayData = unit.dates ? unit.dates[format(day, 'yyyy-MM-dd')] : null;
                                        const statusClass = dayData?.status && selectedStatuses.includes(dayData.status) ? statusColors[dayData.status] : 'bg-transparent';
                                        return (
                                            <td key={day.toString()} className={`p-0 border-r w-[120px] min-w-[120px]`}>
                                                <div className={cn("h-full w-full flex items-center justify-center text-xs p-1", statusClass)}>
                                                    {selectedStatuses.includes(dayData?.status) ? dayData?.status : ''}
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}
