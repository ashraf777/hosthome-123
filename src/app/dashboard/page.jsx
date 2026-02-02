"use client"

import * as React from "react"
import {
  format, isToday, isTomorrow, addDays, isWithinInterval, startOfDay, parseISO
} from "date-fns"
import { Download, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 1. YOUR PROJECT STATUSES
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
  { id: 12, name: 'Walk In' }
];

// 2. DYNAMIC MAP DATA GENERATION
const generateMockBookings = () => {
  const today = new Date();
  const fmt = (d) => format(d, 'yyyy-MM-dd');

  return [
    {
      id: "5690914668",
      platform: "Booking.com",
      property: "The Pano",
      roomType: "The Pano A-13-03",
      unitName: "The Pano A-13-03",
      cleaningStatus: "No Task Available",
      statusId: 1,
      guest: "Steven Na",
      checkIn: fmt(today),
      checkOut: fmt(addDays(today, 1)),
      contact: "+60 2035640799",
    },
    {
      id: "86DC5AN39",
      platform: "Airbnb",
      property: "MAU A-18-04",
      roomType: "MAU A-18-04",
      unitName: "MAU A-18-04",
      cleaningStatus: "No Task Available",
      statusId: 6,
      guest: "Ahmad Noor Ikmal",
      checkIn: fmt(today),
      checkOut: fmt(addDays(today, 2)),
      contact: "60176058432",
    },
    {
      id: "ZQBE2RZWY",
      platform: "Airbnb",
      property: "Majestic Residence",
      roomType: "Majestic 13-01 L",
      unitName: "Majestic 13-01 L",
      cleaningStatus: "No Task Available",
      statusId: 1,
      guest: "Mohd Zulhafizie Bin",
      checkIn: fmt(addDays(today, 1)), // Tomorrow
      checkOut: fmt(addDays(today, 3)),
      contact: "60145086365",
    },
    {
      id: "HM-29384",
      platform: "Agoda",
      property: "Opus Residences",
      roomType: "Opus 2-Bedroom",
      unitName: "Opus 12-05",
      cleaningStatus: "Clean",
      statusId: 5, // Inquiry
      guest: "Sarah Johnson",
      checkIn: fmt(addDays(today, 3)),
      checkOut: fmt(addDays(today, 5)),
      contact: "+1 555 0123",
    },
    {
      id: "HM-99221",
      platform: "Direct",
      property: "Pavilion Suites",
      roomType: "King Suite",
      unitName: "Pavilion 08-01",
      cleaningStatus: "Dirty",
      statusId: 1,
      guest: "David Chen",
      checkIn: fmt(addDays(today, 5)),
      checkOut: fmt(addDays(today, 8)),
      contact: "+65 9123 4567",
    },
    {
      id: "HM-OLD-01",
      platform: "Airbnb",
      property: "CitizenM Tower",
      roomType: "City View",
      unitName: "CM-101",
      cleaningStatus: "Dirty",
      statusId: 4, // Checking out
      guest: "Robert Fox",
      checkIn: fmt(addDays(today, -3)),
      checkOut: fmt(today),
      contact: "+1 202 555 0199",
    },
    {
      id: "HM-STAY-02",
      platform: "Booking.com",
      property: "Vortex Suites",
      roomType: "Family Suite",
      unitName: "VX-88",
      cleaningStatus: "Clean",
      statusId: 3, // Checked In / Hosting
      guest: "Jenny Wilson",
      checkIn: fmt(addDays(today, -2)),
      checkOut: fmt(addDays(today, 2)), // Staying through today/tomorrow
      contact: "+44 1632 960888",
    }
  ];
};

const ALL_BOOKINGS = generateMockBookings();

export default function DashboardPage() {
  const [activeRange, setActiveRange] = React.useState("Today")
  const [date, setDate] = React.useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  })

  // Helper to find status name for CSV
  const getStatusName = (id) => bookingStatuses.find(s => s.id === id)?.name || "Unknown";

  // --- FULL CSV DOWNLOAD ---
  const downloadCSV = (data) => {
    const headers = [
      "Confirmation Code", "Property Name", "Room Type", "Unit Name",
      "Cleaning Status", "Booking Status", "Guest Name",
      "Check-in Date", "Check-out Date", "Contact Number"
    ];

    const rows = data.map(b => [
      b.id, b.property, b.roomType, b.unitName, b.cleaningStatus,
      getStatusName(b.statusId), b.guest, b.checkIn, b.checkOut, b.contact
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(value => `"${value}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hosthome_report_${activeRange.toLowerCase()}.csv`;
    link.click();
  };

  // --- FILTERING HELPERS ---
  const isDateInActiveRange = (targetDate, range, dateState) => {
    const today = startOfDay(new Date());
    const t = parseISO(targetDate);
    if (range === "Today") return isToday(t);
    if (range === "Tomorrow") return isTomorrow(t);
    if (range === "7 Days") return isWithinInterval(t, { start: today, end: addDays(today, 7) });
    if (range === "30 Days") return isWithinInterval(t, { start: today, end: addDays(today, 30) });
    if (range === "Custom" && dateState?.from && dateState?.to) {
      return isWithinInterval(t, { start: startOfDay(dateState.from), end: startOfDay(dateState.to) });
    }
    return false;
  };

  const isOverlapActiveRange = (checkIn, checkOut, range, dateState) => {
    const today = startOfDay(new Date());
    let rangeStart, rangeEnd;

    if (range === "Today") { rangeStart = today; rangeEnd = today; }
    else if (range === "Tomorrow") { rangeStart = addDays(today, 1); rangeEnd = addDays(today, 1); }
    else if (range === "7 Days") { rangeStart = today; rangeEnd = addDays(today, 7); }
    else if (range === "30 Days") { rangeStart = today; rangeEnd = addDays(today, 30); }
    else if (range === "Custom" && dateState?.from && dateState?.to) { rangeStart = startOfDay(dateState.from); rangeEnd = startOfDay(dateState.to); }
    else return false;

    const cIn = parseISO(checkIn);
    const cOut = parseISO(checkOut);

    // Check overlap
    return (cIn <= rangeEnd && cOut >= rangeStart);
  };


  // --- FILTERING LOGIC ---
  const filteredCheckIns = React.useMemo(() => {
    return ALL_BOOKINGS.filter(b => isDateInActiveRange(b.checkIn, activeRange, date));
  }, [activeRange, date]);

  const filteredCheckOuts = React.useMemo(() => {
    return ALL_BOOKINGS.filter(b => isDateInActiveRange(b.checkOut, activeRange, date));
  }, [activeRange, date]);

  const filteredHosting = React.useMemo(() => {
    // Hosting = Guests staying during the period (Overlap)
    return ALL_BOOKINGS.filter(b => isOverlapActiveRange(b.checkIn, b.checkOut, activeRange, date));
  }, [activeRange, date]);

  // Reusable Table Component
  const BookingTable = ({ data, title }) => (
    <div className="mt-6 border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b">
        <h2 className="text-slate-700 font-medium">{title} for {activeRange}</h2>
        <Button onClick={() => downloadCSV(data)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium">
          <Download className="mr-2 h-4 w-4" /> Download CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="py-4 font-bold text-slate-800">Confirmation Code</TableHead>
              <TableHead className="font-bold text-slate-800">Property Name</TableHead>
              <TableHead className="font-bold text-slate-800">Room Type</TableHead>
              <TableHead className="font-bold text-slate-800">Unit Name</TableHead>
              <TableHead className="font-bold text-slate-800">Cleaning Status</TableHead>
              <TableHead className="font-bold text-slate-800">Booking Status</TableHead>
              <TableHead className="font-bold text-slate-800">Guest Name</TableHead>
              <TableHead className="font-bold text-slate-800">Check-in Date</TableHead>
              <TableHead className="font-bold text-slate-800">Check-out Date</TableHead>
              <TableHead className="font-bold text-slate-800">Contact Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium pl-4">
                    <div className="flex flex-col">
                      <span className="text-cyan-600">{booking.id}</span>
                      <span className="text-[10px] text-slate-400">({booking.platform})</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.property}</TableCell>
                  <TableCell>{booking.roomType}</TableCell>
                  <TableCell>{booking.unitName}</TableCell>
                  <TableCell>
                    <span className="text-[11px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200">
                      {booking.cleaningStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={booking.statusId.toString()}>
                      <SelectTrigger className="w-[170px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingStatuses.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="font-medium">{booking.guest}</TableCell>
                  <TableCell className="whitespace-nowrap">{booking.checkIn}</TableCell>
                  <TableCell className="whitespace-nowrap">{booking.checkOut}</TableCell>
                  <TableCell className="text-cyan-600 font-medium whitespace-nowrap">{booking.contact}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-slate-400">
                  No matching records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f8fafc] min-h-screen">

      {/* 1. DATE SELECTORS */}
      <div className="flex flex-wrap items-center gap-2">
        {["Today", "Tomorrow", "7 Days", "30 Days"].map((range) => (
          <Button
            key={range}
            variant={activeRange === range ? "default" : "outline"}
            className={cn("h-9 px-4 bg-white", activeRange === range && "bg-cyan-500 hover:bg-cyan-600 text-white")}
            onClick={() => setActiveRange(range)}
          >
            {range}
          </Button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={activeRange === "Custom" ? "default" : "outline"} className={cn("h-9 px-4 bg-white", activeRange === "Custom" && "bg-cyan-500 text-white")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {activeRange === "Custom" && date?.from ? `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd")}` : "Custom"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={date} onSelect={(r) => { setDate(r); if (r?.to) setActiveRange("Custom") }} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>

      {/* 2. TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Check-in", val: filteredCheckIns.length },
          { label: "Check-out", val: filteredCheckOuts.length },
          { label: "Hosting", val: filteredHosting.length },
          { label: "All", val: ALL_BOOKINGS.length }
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <span className="text-slate-500 font-medium text-lg mb-1">{stat.label}</span>
              <span className="text-4xl font-bold text-slate-800">{stat.val}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. TABS & FULL TABLES */}
      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 gap-10">
          <TabsTrigger value="check-in" className="border-b-2 border-transparent data-[state=active]:border-cyan-500 py-4 px-1 text-cyan-600 font-medium">Check-in</TabsTrigger>
          <TabsTrigger value="check-out" className="border-b-2 border-transparent data-[state=active]:border-cyan-500 py-4 px-1 text-slate-500 data-[state=active]:text-cyan-600 font-medium">Check-out</TabsTrigger>
          <TabsTrigger value="hosting" className="border-b-2 border-transparent data-[state=active]:border-cyan-500 py-4 px-1 text-slate-500 data-[state=active]:text-cyan-600 font-medium">Hosting</TabsTrigger>
          <TabsTrigger value="all" className="border-b-2 border-transparent data-[state=active]:border-cyan-500 py-4 px-1 text-slate-500 data-[state=active]:text-cyan-600 font-medium">All</TabsTrigger>
        </TabsList>

        <TabsContent value="check-in">
          <BookingTable data={filteredCheckIns} title="Guest Check-in" />
        </TabsContent>

        <TabsContent value="check-out">
          <BookingTable data={filteredCheckOuts} title="Guest Check-out" />
        </TabsContent>

        <TabsContent value="hosting">
          <BookingTable data={filteredHosting} title="Currently Hosting" />
        </TabsContent>

        <TabsContent value="all">
          <BookingTable data={ALL_BOOKINGS} title="All Bookings" />
        </TabsContent>
      </Tabs>
    </div>
  )
}