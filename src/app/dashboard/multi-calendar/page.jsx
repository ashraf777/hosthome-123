'use client'

import React, { useState, useMemo, useEffect, memo } from 'react'
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
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from "@/components/ui/dialog"
import Link from "next/link";
import { Badge } from "@/components/ui/badge"
import {
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
    ChevronDown,
    ChevronUp,
    X,
    Loader2
} from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    eachDayOfInterval,
    isSameDay,
    addDays,
    startOfMonth,
    endOfMonth,
    isBefore,
    isAfter,
} from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Static Booking Statuses
const bookingStatuses = [
    { id: 1, name: 'Confirmed' },
    { id: 2, name: 'Cancel' },
    { id: 3, name: 'Checked In' },
    { id: 4, name: 'Checked Out' },
    { id: 5, name: 'Booking Inquiry' },
    { id: 6, name: 'Awaiting Payment' },
    { id: 7, name: 'No Show' },
    { id: 8, name: 'Vacant Dirty(VD)' },
    { id: 9, name: 'Vacant Clean(VC)' },
    { id: 10, name: 'Maintenance' },
    { id: 11, name: 'Blocked' },
    { id: 12, name: 'Walk In' } // Added 'Walk In' based on data
];

// ID-based color mapping
const statusColors = {
    1: { background: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200", border: "border-green-300 dark:border-green-700" }, // Confirmed
    2: { background: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", border: "border-gray-300 dark:border-gray-600" }, // Cancel
    3: { background: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200", border: "border-blue-300 dark:border-blue-700" }, // Checked In
    4: { background: "bg-purple-100 dark:bg-purple-900", text: "text-purple-800 dark:text-purple-200", border: "border-purple-300 dark:border-purple-700" }, // Checked Out
    5: { background: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200", border: "border-yellow-300 dark:border-yellow-700" }, // Booking Inquiry
    6: { background: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-800 dark:text-cyan-200", border: "border-cyan-300 dark:border-cyan-700" }, // Awaiting Payment
    7: { background: "bg-red-100 dark:bg-red-800", text: "text-red-800 dark:text-red-200", border: "border-red-300 dark:border-red-600" }, // No Show
    8: { background: "bg-orange-100 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-200", border: "border-orange-300 dark:border-orange-700" }, // Vacant Dirty
    9: { background: "bg-teal-100 dark:bg-teal-900", text: "text-teal-800 dark:text-teal-200", border: "border-teal-300 dark:border-teal-700" }, // Vacant Clean
    10: { background: "bg-gray-200 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-200", border: "border-gray-400 dark:border-gray-600" }, // Maintenance
    11: { background: "bg-black", text: "text-white", border: "border-black" }, // Blocked
    12: { background: "bg-pink-100 dark:bg-pink-900", text: "text-pink-800 dark:text-pink-200", border: "border-pink-300 dark:border-pink-700" }, // Walk In
};

/**
 * UnitRow Component (Memoized)
 * Renders a single unit's row in the calendar, calculating the span for multi-day bookings.
 */
const UnitRow = memo(({ unit, daysInRange, selectedStatuses, onBookingClick }) => {
    const cells = [];
    let i = 0;

    while (i < daysInRange.length) {
        const day = daysInRange[i];
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayData = unit.dates?.[dayStr];
        const booking = dayData?.booking;
        const statusText = dayData?.status || '';

        let statusName = null;
        let statusId = null;

        // 1. Determine the status/booking details
        if (booking) {
            statusId = booking.status;
            const statusObj = bookingStatuses.find(s => s.id === statusId);
            statusName = statusObj ? statusObj.name : statusText || 'Confirm Booking';
        } else if (statusText.trim()) {
            statusName = statusText;
            const statusObj = bookingStatuses.find(s => s.name === statusName);
            statusId = statusObj ? statusObj.id : null;
        }

        const isVisible = statusName && selectedStatuses.includes(statusName);

        if (booking && isVisible) {
            let colSpan = 1;
            const bookingId = booking.id;

            // 2. Calculate colSpan for the booking
            for (let j = i + 1; j < daysInRange.length; j++) {
                const nextDayStr = format(daysInRange[j], 'yyyy-MM-dd');
                const nextDayData = unit.dates?.[nextDayStr];
                
                // Crucial check: must have a booking AND the ID must match the starting booking ID
                if (nextDayData?.booking && nextDayData.booking.id === bookingId) {
                    colSpan++;
                } else {
                    break; // End of this booking span
                }
            }

            const color = statusColors[statusId] || statusColors[1]; // Fallback to Confirmed
            const guestName = booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Guest';
            const totalAmount = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(booking.total_amount);

            cells.push(
                <td 
                    key={`${dayStr}-${unit.id}`} 
                    colSpan={colSpan} 
                    className={`p-0 border-r border-t border-b`}
                >
                    <div 
                        onClick={() => onBookingClick(booking)}
                        className={cn(
                            "h-full w-full flex items-center justify-center text-xs p-1 rounded-md cursor-pointer m-[1px] overflow-hidden whitespace-nowrap text-ellipsis border", 
                            color.background, 
                            color.text,
                            color.border,
                        )}
                        title={`${unit.name} - ${statusName} (${booking.confirmation_code})`}
                    >
                        {/* Display booking code or status name (only on the first cell) */}
                        <div className="flex justify-between items-center w-full gap-2">
                            <span className="font-bold truncate text-[10px] uppercase">
                                {statusName}
                            </span>
                            <span className="font-semibold text-[11px] truncate">
                                {guestName}
                            </span>
                            <span className="text-[10px] opacity-80 whitespace-nowrap">
                                {totalAmount}
                            </span>
                        </div>
                    </div>
                </td>
            );

            // 3. Advance the loop index past the days just covered by colSpan
            i += colSpan;
        } else {
            // Render a single empty cell (or non-booking status cell)
            const isVacantClean = statusId === 9; 
            const isVacantDirty = statusId === 8;
            const cellText = isVacantClean ? 'VC' : (isVacantDirty ? 'VD' : '\u00A0'); // Non-breaking space

            cells.push(
                <td 
                    key={`${dayStr}-${unit.id}`} 
                    className={`p-0 border-r w-[120px] min-w-[120px] h-full ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                >
                    <div className="h-full w-full p-1 text-center text-xs text-gray-400 dark:text-gray-600">
                        {cellText}
                    </div>
                </td>
            );
            i++;
        }
    }

    return (
        <tr key={unit.id} className="border-b bg-gray-50 dark:bg-gray-900 h-10">
            <td className="p-2 border-r font-medium sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 w-[200px] min-w-[200px] pl-10 h-full">{unit.name}</td>
            {cells}
        </tr>
    );
});
UnitRow.displayName = 'UnitRow';


export default function MultiCalendarPage() {
    const { toast } = useToast();
    
    // Adjusted initial date range to capture a full month cleanly
    const now = new Date();
    const [date, setDate] = useState({
        from: startOfMonth(now),
        // Calculate the end date as the last day of the next month (e.g., Nov 1 - Dec 31)
        to: endOfMonth(addMonths(now, 1)), 
    });
    
    const [hosts, setHosts] = useState([]);
    const [properties, setProperties] = useState([]);
    const [channels, setChannels] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [allBookingStatuses, setAllBookingStatuses] = useState([]);
    const [selectedHost, setSelectedHost] = useState(null)
    const [selectedProperty, setSelectedProperty] = useState(null)
    const [selectedChannels, setSelectedChannels] = useState([])
    const [selectedStatuses, setSelectedStatuses] = useState([])
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [expandedRoomTypes, setExpandedRoomTypes] = useState([]);

    const [selectedBooking, setSelectedBooking] = useState(null);

    const daysInRange = useMemo(() => {
        // Ensure to include the 'to' date in the interval
        return date.from && date.to && isAfter(date.to, date.from) ? eachDayOfInterval({ start: date.from, end: date.to }) : [];
    }, [date])

    // --- Initial Data Fetch ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [userResponse, propertiesResponse, channelsResponse] = await Promise.all([
                    api.get('user'),
                    api.get('properties'),
                    api.get('channels'),
                ]);

                const hostingCompany = userResponse?.data?.hosting_company;
                if (hostingCompany && hostingCompany.id && hostingCompany.name) {
                    const hostData = [{ id: hostingCompany.id, name: hostingCompany.name }];
                    setHosts(hostData);
                    setSelectedHost(hostData[0].id);
                } else {
                    toast({ title: "Error", description: "Could not find hosting company for your account." });
                    setHosts([]);
                }

                const propertiesData = propertiesResponse?.data?.data ?? propertiesResponse?.data ?? [];
                const channelsData = channelsResponse?.data?.data ?? channelsResponse?.data ?? [];
                const statusNames = bookingStatuses.map(s => s.name);

                setProperties(propertiesData);
                setChannels(channelsData);
                setAllBookingStatuses(statusNames);
                setSelectedStatuses(statusNames);

                if (propertiesData.length > 0) setSelectedProperty(propertiesData[0].id);
                // Note: The original code sets selected channels to all channel names. Keeping this behavior.
                if (channelsData.length > 0) setSelectedChannels(channelsData.map(ch => ch.name));

            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Error fetching initial data", description: "Could not load required data from the server." });
                setProperties([]);
                setChannels([]);
                setAllBookingStatuses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [toast]);

    // --- Calendar Data Fetch ---
    useEffect(() => {
        const fetchCalendarData = async () => {
            if (!selectedProperty || !date.from || !date.to || isBefore(date.to, date.from)) return;

            setCalendarLoading(true);
            try {
                const startDate = format(date.from, 'yyyy-MM-dd');
                const endDate = format(date.to, 'yyyy-MM-dd');

                // Map selected status names back to IDs for the API request
                const statusIds = selectedStatuses.map(name => {
                    const statusObj = bookingStatuses.find(s => s.name === name);
                    return statusObj ? statusObj.id : null;
                }).filter(id => id !== null);

                const url = `multi-calendar?property_id=${selectedProperty}&start_date=${startDate}&end_date=${endDate}&statuses=${statusIds.join(',')}`;
                
                const response = await api.get(url);
                console.log("Calendar Data Response:", response);
                const fetchedRoomTypes = response ?? [];
                setRoomTypes(fetchedRoomTypes);

                // Expand all room types by default
                const roomTypeIds = fetchedRoomTypes.map(rt => rt.id);
                setExpandedRoomTypes(roomTypeIds);

            } catch (error) {
                console.error("Error fetching calendar data:", error);
                toast({
                    variant: "destructive",
                    title: "Failed to load calendar",
                    description: error.message || "Could not fetch calendar data from the server."
                });
                setRoomTypes([]);
            } finally {
                setCalendarLoading(false);
            }
        }
        fetchCalendarData();
    }, [selectedProperty, date, selectedStatuses, toast]);


    const handleChannelToggle = (channelName) => {
        setSelectedChannels(prev =>
            prev.includes(channelName) ? prev.filter(c => c !== channelName) : [...prev, channelName]
        )
    }

    const handleStatusRemove = (statusName) => {
        setSelectedStatuses(prev => prev.filter(s => s !== statusName));
    }

    const handleResetStatuses = () => {
        setSelectedStatuses(allBookingStatuses);
    }

    const handleToggleExpand = (roomTypeId) => {
        setExpandedRoomTypes(prev =>
            prev.includes(roomTypeId) ? prev.filter(id => id !== roomTypeId) : [...prev, roomTypeId]
        );
    }

    // Navigation functions adjusted for better month handling
    const goToPreviousMonth = () => {
        const newFrom = subMonths(date.from, 1);
        const newTo = endOfMonth(addMonths(newFrom, 1)); // Adjust to end of the following month
        setDate({ from: newFrom, to: newTo });
    }

    const goToNextMonth = () => {
        const newFrom = addMonths(date.from, 1);
        const newTo = endOfMonth(addMonths(newFrom, 1)); // Adjust to end of the following month
        setDate({ from: newFrom, to: newTo });
    }

    const goToToday = () => {
        const newFrom = startOfMonth(new Date());
        const newTo = endOfMonth(addMonths(newFrom, 1)); // Show next 2 months of data
        setDate({ from: newFrom, to: newTo });
    }

    if (loading) {
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
                    <Select value={selectedHost} onValueChange={setSelectedHost} disabled={hosts.length <= 1}>
                        <SelectTrigger><SelectValue placeholder="Select Host" /></SelectTrigger>
                        <SelectContent>{hosts.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger><SelectValue placeholder="Select Property" /></SelectTrigger>
                        <SelectContent>{(properties || []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {(channels || []).map(channel => (
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
                        {selectedStatuses.map(statusName => {
                            const statusObj = bookingStatuses.find(s => s.name === statusName);
                            const color = statusObj ? statusColors[statusObj.id] : { background: "bg-gray-200", text: "text-gray-800", border: "border-gray-400" };
                            return (
                                <div key={statusName} className={cn("flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium border", color.background, color.text, color.border)}>
                                    <span className={cn("w-2 h-2 rounded-full", color.background)}></span>
                                    <span>{statusName}</span>
                                    <button onClick={() => handleStatusRemove(statusName)} className="opacity-75 hover:opacity-100">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                    <Button variant="outline" onClick={handleResetStatuses}>Reset</Button>
                </div>
            </div>

            {/* Action Buttons & Date Navigation */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline">Rate Update</Button>
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
                {calendarLoading &&
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-40">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    </div>
                }
                <div className="absolute inset-0 overflow-auto">
                    <table className="min-w-full border-collapse border-spacing-0">
                        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-20">
                            <tr>
                                <th className="p-2 border-r border-b font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700 z-30 w-[200px] min-w-[200px]">Room Type / Unit</th>
                                {daysInRange.map(day => (
                                    <th key={day.toString()} className={`p-2 border-r border-b text-center font-semibold w-[120px] min-w-[120px] ${isSameDay(day, new Date()) ? 'bg-blue-200 dark:bg-blue-800' : ''}`}>
                                        <div>{format(day, 'E')}</div>
                                        <div>{format(day, 'd')}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(roomTypes || []).map(roomType => (
                                <React.Fragment key={roomType.id}>
                                    <tr className="border-b">
                                        <td className="p-2 border-r font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10 w-[200px] min-w-[200px]">
                                            <div className='flex items-center pl-4'>
                                                <Button variant="ghost" size="sm" onClick={() => handleToggleExpand(roomType.id)}>
                                                    {expandedRoomTypes.includes(roomType.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                                {roomType.name}
                                            </div>
                                        </td>
                                        {daysInRange.map(day => {
                                            const dayStr = format(day, 'yyyy-MM-dd');
                                            const dayData = roomType.dates ? roomType.dates[dayStr] : null;
                                            return (
                                                <td key={dayStr} className="p-2 border-r text-sm align-top w-[120px] min-w-[120px] h-full">
                                                    <div className="font-bold text-center">{dayData?.inventory || 'N/A'}</div>
                                                    {/* Display up to 2 rates (default + first dynamic rate) to keep cells manageable */}
                                                    {dayData?.rates && Object.entries(dayData.rates).slice(0, 2).map(([key, value]) => (
                                                        <div key={key} className="text-center text-xs text-gray-700 dark:text-gray-300">
                                                            {value}
                                                        </div>
                                                    ))}
                                                    {dayData?.rates && Object.keys(dayData.rates).length > 2 && (
                                                         <div key="more" className="text-center text-xs text-red-500">+{Object.keys(dayData.rates).length - 2} more</div>
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                    {expandedRoomTypes.includes(roomType.id) && (roomType.units || []).map(unit => (
                                        <UnitRow
                                            key={unit.id}
                                            unit={unit}
                                            daysInRange={daysInRange}
                                            selectedStatuses={selectedStatuses}
                                            onBookingClick={setSelectedBooking}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Confirmation Code: {selectedBooking?.confirmation_code}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="grid gap-4 py-4 text-sm">
                            <div className="grid grid-cols-2">
                                <span className="text-muted-foreground">Guest Name:</span>
                                <span className="font-medium">
                                    {selectedBooking.guest?.first_name} {selectedBooking.guest?.last_name}
                                </span>
                            </div>
                            <div className="grid grid-cols-2">
                                <span className="text-muted-foreground">Stay Dates:</span>
                                <span className="font-medium">
                                    {selectedBooking.check_in_date} to {selectedBooking.check_out_date}
                                </span>
                            </div>
                            <div className="grid grid-cols-2">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="font-semibold text-green-600">
                                    MYR {Number(selectedBooking.total_amount).toFixed(2)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2">
                                <span className="text-muted-foreground">Status:</span>
                                <div>
                                    <Badge variant="outline">
                                        {bookingStatuses.find(s => s.id === selectedBooking.status)?.name || 'N/A'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
                        {selectedBooking && (
                            <Link href={`/dashboard/booking/${selectedBooking.id}/edit`} passHref>
                                <Button>Edit Booking</Button>
                            </Link>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}