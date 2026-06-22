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
  ChevronDown,
  Filter,
  Building,
  BedDouble,
  DoorOpen,
  Loader2,
  CalendarIcon,
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
  differenceInDays,
  isBefore,
  startOfDay,
  isAfter,
  parseISO,
} from "date-fns"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ─── Availability Status Definitions ───────────────────────────────────────
export const AVAILABILITY_STATUSES = [
  {
    key: 'open',
    label: 'Open',
    description: 'Room is available for booking',
    color: 'bg-emerald-500',
    cellStyle: '',
    icon: '✅',
  },
  {
    key: 'closed',
    label: 'Closed',
    description: 'Temporarily closed — no new bookings',
    color: 'bg-slate-500',
    cellStyle: 'bg-slate-100 dark:bg-slate-800',
    icon: '🔒',
  },
  {
    key: 'blackout',
    label: 'Blackout',
    description: 'Hard block — invisible to channels',
    color: 'bg-gray-900',
    cellStyle: 'bg-gray-900/20 dark:bg-gray-900/60',
    icon: '⛔',
  },
  {
    key: 'stop_sell',
    label: 'Stop Sell',
    description: 'Stop selling — existing stays OK',
    color: 'bg-red-500',
    cellStyle: 'bg-red-100 dark:bg-red-950',
    icon: '🛑',
  },
  {
    key: 'on_request',
    label: 'On Request',
    description: 'Manual approval required',
    color: 'bg-amber-500',
    cellStyle: 'bg-amber-50 dark:bg-amber-950',
    icon: '📋',
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    description: 'Unit under maintenance',
    color: 'bg-orange-500',
    cellStyle: 'bg-orange-100 dark:bg-orange-950',
    icon: '🔧',
  },
  {
    key: 'owner_use',
    label: 'Owner Use',
    description: 'Reserved for owner',
    color: 'bg-purple-500',
    cellStyle: 'bg-purple-100 dark:bg-purple-950',
    icon: '👤',
  },
]

const getStatusDef = (key) => AVAILABILITY_STATUSES.find(s => s.key === key) || AVAILABILITY_STATUSES[0]

// ─── Booking Status ─────────────────────────────────────────────────────────
const getBadgeVariant = (status) => {
  switch (status) {
    case 'Confirmed': case 'Checked In': case 'Checked Out': case 'Vacant Clean(VC)':
      return 'default';
    case 'Pending': case 'Awaiting Payment': case 'Booking Inquery':
      return 'secondary';
    case 'Cancel': case 'No Show': case 'Vacant Dirty(VD)':
      return 'destructive';
    default: return 'outline';
  }
}

const getChannelColor = (channel) => {
  switch (channel) {
    case 'Airbnb': return 'bg-red-500/20 border-red-500 text-red-800 dark:text-red-300';
    case 'Booking.com': return 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300';
    case 'Agoda': return 'bg-yellow-500/20 border-yellow-500 text-yellow-800 dark:text-yellow-300';
    case 'Expedia': return 'bg-green-500/20 border-green-500 text-green-800 dark:text-green-300';
    default: return 'bg-gray-500/20 border-gray-500 text-gray-800 dark:text-gray-300';
  }
}

const statusMapping = {
  1: 'Confirmed', 2: 'Cancel', 3: 'Checked In', 4: 'Checked Out',
  5: 'Booking Inquery', 6: 'Awaiting Payment', 7: 'No Show',
  8: 'Vacant Dirty(VD)', 9: 'Vacant Clean(VC)',
};

// ─── Sidebar Hierarchy ───────────────────────────────────────────────────────
const HierarchyItem = ({ item, level = 0, selection, onSelect, type }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isSelected = selection.type === type && String(selection.id) === String(item.id);
  const hasChildren = item.children && item.children.length > 0;

  React.useEffect(() => {
    if (item.children) {
      const childSelected = item.children.some(child =>
        (selection.type === 'room_type' && String(child.id) === String(selection.id)) ||
        (child.children && child.children.some(gc => selection.type === 'unit' && String(gc.id) === String(selection.id)))
      );
      if (childSelected) setIsOpen(true);
    }
  }, [selection, item]);

  const getIcon = () => {
    if (type === 'property') return <Building className="h-4 w-4 text-primary" />;
    if (type === 'room_type') return <BedDouble className="h-4 w-4 text-muted-foreground" />;
    return <DoorOpen className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div
        className={`flex items-center w-full group cursor-pointer hover:bg-muted/50 transition-colors
          ${isSelected ? 'bg-muted border-l-4 border-l-primary' : type === 'property' ? 'border-b border-l-4 border-l-transparent' : 'border-l-4 border-l-transparent'}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={(e) => { e.stopPropagation(); onSelect({ type, id: item.id, data: item }); }}
      >
        <div className="flex items-center py-3 flex-1 overflow-hidden">
          {hasChildren ? (
            <CollapsibleTrigger className="h-6 w-6 p-0 mr-1 flex items-center justify-center hover:bg-muted rounded-md" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </CollapsibleTrigger>
          ) : <div className="w-7" />}
          <div className="flex items-center gap-2 overflow-hidden">
            {getIcon()}
            <div className="flex flex-col min-w-0">
              <span className={`text-sm truncate ${isSelected ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                {item.name || item.unit_identifier}
              </span>
              {type === 'property' && <span className="text-[10px] text-muted-foreground truncate">{item.city}</span>}
            </div>
          </div>
        </div>
      </div>
      {hasChildren && (
        <CollapsibleContent>
          {item.children.map(child => (
            <HierarchyItem
              key={child.id} item={child} level={level + 1}
              selection={selection} onSelect={onSelect}
              type={type === 'property' ? 'room_type' : 'unit'}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

// ─── Date Range Picker Helper ────────────────────────────────────────────────
const DateRangePicker = ({ from, to, onSelect }) => {
  const [open, setOpen] = React.useState(false);
  const selected = from && to ? { from, to } : from ? { from } : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !from && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from ? (to && !isSameDay(from, to) ? `${format(from, 'MMM d')} → ${format(to, 'MMM d, yyyy')}` : format(from, 'MMM d, yyyy')) : 'Pick date range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
          mode="range"
          selected={selected}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onSelect(range.from, range.to);
              setOpen(false);
            } else if (range?.from) {
              onSelect(range.from, range.from);
            }
          }}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [bookings, setBookings] = React.useState([]);
  const [hierarchy, setHierarchy] = React.useState([]);
  const [selection, setSelection] = React.useState({ type: null, id: null, data: null });

  // Per-day availability overrides from DB (keyed by "unitId_yyyy-mm-dd")
  const [availabilityMap, setAvailabilityMap] = React.useState({});
  const [dailyOverrides, setDailyOverrides] = React.useState([]);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const [allChannels, setAllChannels] = React.useState([]);
  const [allStatuses, setAllStatuses] = React.useState(Object.values(statusMapping));
  const [selectedChannels, setSelectedChannels] = React.useState([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Sheet state
  const [selectedDate, setSelectedDate] = React.useState(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedBooking, setSelectedBooking] = React.useState(null)
  const [sheetView, setSheetView] = React.useState('main') // 'main' | 'price' | 'availability'

  // Price form
  const [priceInputValue, setPriceInputValue] = React.useState("")
  const [priceFromDate, setPriceFromDate] = React.useState(null)
  const [priceToDate, setPriceToDate] = React.useState(null)
  const [priceSaving, setPriceSaving] = React.useState(false)

  // Availability form
  const [availFromDate, setAvailFromDate] = React.useState(null)
  const [availToDate, setAvailToDate] = React.useState(null)
  const [availStatus, setAvailStatus] = React.useState('closed')
  const [availSaving, setAvailSaving] = React.useState(false)

  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsResponse, channelsResponse, propertiesResponse, unitsResponse] = await Promise.all([
          api.get('bookings'),
          api.get('channels'),
          api.get('properties'),
          api.get('units')
        ]);

        const bookingsData = bookingsResponse.data.data || bookingsResponse.data;
        const channelsData = channelsResponse.data.data || channelsResponse.data;
        let propertiesData = propertiesResponse.data || propertiesResponse || [];
        const unitsData = unitsResponse.data || unitsResponse || [];

        // Build Hierarchy
        const propertiesMap = new Map();
        propertiesData.forEach(p => propertiesMap.set(p.id, { ...p, type: 'property', children: p.children || [] }));
        const roomTypesMap = new Map();

        unitsData.forEach(unit => {
          const property = propertiesMap.get(unit.property_id);
          if (!property) return;
          const roomTypeKey = `${unit.property_id}-${unit.room_type_id}`;
          let roomTypeNode = roomTypesMap.get(roomTypeKey);
          if (!roomTypeNode) {
            roomTypeNode = {
              id: unit.room_type_id,
              name: unit.room_type?.name || 'Unknown Room Type',
              type: 'room_type',
              propertyId: unit.property_id,
              weekday_price: unit.room_type?.weekday_price,
              weekend_price: unit.room_type?.weekend_price,
              children: []
            };
            roomTypesMap.set(roomTypeKey, roomTypeNode);
            property.children.push(roomTypeNode);
          }
          roomTypeNode.children.push({ ...unit, type: 'unit', name: unit.unit_identifier });
        });

        const hierarchyData = Array.from(propertiesMap.values());
        setHierarchy(hierarchyData);
        if (hierarchyData.length > 0) setSelection({ type: 'property', id: hierarchyData[0].id, data: hierarchyData[0] });

        // Format Bookings
        const formattedBookings = bookingsData.map(booking => {
          const unit = booking.property_unit || booking.unit || {};
          const roomType = booking.room_type || unit.room_type || {};
          return {
            id: booking.id,
            guestName: `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.trim(),
            checkIn: new Date(booking.check_in_date),
            checkOut: new Date(booking.check_out_date),
            status: statusMapping[booking.status] || 'Unknown',
            channel: booking.channel?.name || 'N/A',
            total: booking.total_amount,
            roomType: roomType.name || 'N/A',
            unitId: booking.property_unit_id || booking.unit_id || unit.id,
            unitIdentifier: unit.unit_identifier || 'N/A',
            propertyId: booking.property_id || unit.property_id,
            roomTypeId: booking.room_type_id || roomType.id || unit.room_type_id,
            _raw: booking
          };
        });

        setBookings(formattedBookings);
        const channelNames = channelsData.map(c => c.name);
        setAllChannels(channelNames);
        setSelectedChannels(channelNames);
        setSelectedStatuses(Object.values(statusMapping));

      } catch (error) {
        toast({ variant: "destructive", title: "Error fetching data", description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger, toast]);

  React.useEffect(() => {
    const fetchOverrides = async () => {
      try {
        const startStr = format(startOfWeek(startOfMonth(currentDate)), 'yyyy-MM-dd');
        const endStr = format(endOfWeek(endOfMonth(currentDate)), 'yyyy-MM-dd');
        const res = await api.get(`beds24/calendar/overrides?start_date=${startStr}&end_date=${endStr}`);
        if (res.success && res.data) {
          setDailyOverrides(res.data);
          
          // Pre-populate the local availabilityMap from the fetched overrides
          const newAvailMap = {};
          res.data.forEach(override => {
            if (override.room_type_id && override.availability_status) {
              newAvailMap[`${override.room_type_id}_${override.date}`] = override.availability_status;
            }
          });
          setAvailabilityMap(newAvailMap);
        }
      } catch (err) {
        console.error("Failed to fetch overrides:", err);
      }
    };
    fetchOverrides();
  }, [currentDate, refreshTrigger, toast]);

  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: startOfWeek(firstDayOfMonth), end: endOfWeek(lastDayOfMonth) })
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const filteredBookings = React.useMemo(() => {
    return bookings.filter(booking => {
      if (!selection.id) return false;
      if (selection.type === 'property' && String(booking.propertyId) !== String(selection.id)) return false;
      if (selection.type === 'room_type' && String(booking.roomTypeId) !== String(selection.id)) return false;
      if (selection.type === 'unit' && String(booking.unitId) !== String(selection.id)) return false;
      if (selectedChannels.length > 0 && !selectedChannels.includes(booking.channel)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(booking.status)) return false;
      return true;
    })
  }, [bookings, selection, selectedChannels, selectedStatuses]);

  const getBookingsForDay = (day) => {
    if (!day) return [];
    return filteredBookings.filter(booking =>
      isSameDay(day, booking.checkIn) || isWithinInterval(day, { start: booking.checkIn, end: subDays(booking.checkOut, 1) })
    );
  }

  const getDisplayPrice = (day) => {
    if (!day) return '';
    const dayBookings = getBookingsForDay(day);
    if (dayBookings.length > 0) {
      const booking = dayBookings[0];
      const nights = differenceInDays(booking.checkOut, booking.checkIn) || 1;
      return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(booking.total / nights);
    }
    if (!selection.data) return '$';

    const dateStr = format(day, 'yyyy-MM-dd');
    const getPrice = (rt) => {
      // Find override in dailyOverrides
      const override = dailyOverrides.find(o => String(o.room_type_id) === String(rt.id) && o.date === dateStr);
      if (override && override.base_rate > 0) {
        return override.base_rate;
      }
      const isFriOrSat = [5, 6].includes(day.getDay());
      return isFriOrSat ? rt.weekend_price : rt.weekday_price;
    };

    let priceValues = [];
    if (selection.type === 'unit') { if (selection.data.room_type) priceValues.push(getPrice(selection.data.room_type)); }
    else if (selection.type === 'room_type') priceValues.push(getPrice(selection.data));
    else if (selection.type === 'property') selection.data.children.forEach(rt => priceValues.push(getPrice(rt)));
    priceValues = priceValues.filter(p => p != null);
    if (priceValues.length === 0) return '$';
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(Math.min(...priceValues));
  }

  // Get availability status for a day (from local availabilityMap)
  const getDayAvailStatus = (day) => {
    if (!selection.data || !day) return null;
    const dateStr = format(day, 'yyyy-MM-dd');
    // Check by room type ID (availability is room-type level)
    const rtId = selection.type === 'room_type' ? selection.id :
      selection.type === 'unit' ? selection.data.room_type_id : null;
    if (!rtId) return null;
    return availabilityMap[`${rtId}_${dateStr}`] || null;
  }

  const handleDayClick = (day) => {
    setSelectedDate(day);
    const dayBookings = getBookingsForDay(day);
    setSelectedBooking(dayBookings.length > 0 ? dayBookings[0] : null);
    setSheetView('main');
    // Pre-fill date range for availability/price to the clicked day
    setPriceFromDate(day);
    setPriceToDate(day);
    setAvailFromDate(day);
    setAvailToDate(day);

    // Sync input values with clicked date's price and status
    const currentPriceStr = day ? getDisplayPrice(day).replace(/[^0-9.]/g, '') : '';
    setPriceInputValue(currentPriceStr);

    const currentStatus = getDayAvailStatus(day) || 'open';
    setAvailStatus(currentStatus);

    setSheetOpen(true);
  }

  const handleBookingClick = (e, booking) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setSelectedDate(booking.checkIn);
    setSheetView('main');
    setSheetOpen(true);
  }

  const getRoomTypeId = () => {
    if (selection.type === 'room_type') return selection.id;
    if (selection.type === 'unit') return selection.data?.room_type_id;
    return null;
  }

  const handleSavePrice = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const roomTypeId = getRoomTypeId();
    if (!roomTypeId) {
      toast({ title: "Error", description: "Please select a Room Type or Unit on the left.", variant: "destructive" });
      return;
    }
    const price = parseFloat(priceInputValue);
    if (isNaN(price) || price < 0) {
      toast({ title: "Error", description: "Please enter a valid price.", variant: "destructive" });
      return;
    }
    if (!priceFromDate || !priceToDate) {
      toast({ title: "Error", description: "Please select a date range.", variant: "destructive" });
      return;
    }
    setPriceSaving(true);
    try {
      const isSingleDay = isSameDay(priceFromDate, priceToDate);
      const payload = isSingleDay
        ? { room_type_id: roomTypeId, date: format(priceFromDate, 'yyyy-MM-dd'), price }
        : { room_type_id: roomTypeId, from_date: format(priceFromDate, 'yyyy-MM-dd'), to_date: format(priceToDate, 'yyyy-MM-dd'), price };

      const response = await api.post('beds24/calendar/price', payload);
      if (response.success) {
        toast({ title: "✅ Price Updated", description: "Price synced to HostHome and Beds24." });
        setRefreshTrigger(prev => prev + 1);
        setSheetOpen(false);
      } else throw new Error(response.error || "Failed to update price");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPriceSaving(false);
    }
  };

  const handleSaveAvailability = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const roomTypeId = getRoomTypeId();
    if (!roomTypeId) {
      toast({ title: "Error", description: "Please select a Room Type or Unit on the left.", variant: "destructive" });
      return;
    }
    if (!availFromDate || !availToDate) {
      toast({ title: "Error", description: "Please select a date range.", variant: "destructive" });
      return;
    }
    setAvailSaving(true);
    try {
      const response = await api.post('beds24/calendar/availability', {
        room_type_id: roomTypeId,
        from_date: format(availFromDate, 'yyyy-MM-dd'),
        to_date: format(availToDate, 'yyyy-MM-dd'),
        status: availStatus,
      });
      if (response.success) {
        const statusDef = getStatusDef(availStatus);
        toast({ title: `${statusDef.icon} Availability Updated`, description: response.message });

        // Update local availability map for immediate visual feedback
        const newMap = { ...availabilityMap };
        let d = availFromDate;
        while (!isAfter(d, availToDate)) {
          newMap[`${roomTypeId}_${format(d, 'yyyy-MM-dd')}`] = availStatus;
          d = new Date(d.getTime() + 86400000);
        }
        setAvailabilityMap(newMap);
        setRefreshTrigger(prev => prev + 1);
        setSheetOpen(false);
      } else throw new Error(response.error || "Failed to update availability");
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAvailSaving(false);
    }
  };

  const isPastDate = (day) => isBefore(day, startOfDay(new Date()));

  if (loading && hierarchy.length === 0) {
    return (
      <div className="flex flex-col gap-6 h-full p-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-6 h-full">
          <Skeleton className="h-full w-64 hidden md:block" />
          <Skeleton className="flex-grow h-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-0 bg-background">
      {/* LEFT SIDEBAR - HIERARCHY */}
      <div className="w-80 border-r flex flex-col bg-card hidden md:flex">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Properties
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Select Property, Room Type, or Unit</p>
        </div>
        <ScrollArea className="flex-grow">
          <div className="flex flex-col py-2">
            {hierarchy.map(property => (
              <HierarchyItem key={property.id} item={property} type="property" selection={selection} onSelect={setSelection} />
            ))}
            {hierarchy.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No properties found.</div>}
          </div>
        </ScrollArea>

        {/* Availability Status Legend */}
        <div className="p-3 border-t bg-muted/30">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Availability Legend</p>
          <div className="grid grid-cols-2 gap-1">
            {AVAILABILITY_STATUSES.filter(s => s.key !== 'open').map(s => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${s.color}`} />
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT - CALENDAR */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* TOP BAR */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight w-40">{format(currentDate, "MMMM yyyy")}</h1>
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setRefreshTrigger(prev => prev + 1)} disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Refresh
              </Button>
              <p className="text-[11px] text-muted-foreground hidden lg:block">💡 Click any empty cell to update price or availability</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-3.5 w-3.5" />Channels
                  {selectedChannels.length !== allChannels.length && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{selectedChannels.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Filter by Channel</DropdownMenuLabel><DropdownMenuSeparator />
                {allChannels.map(channel => (
                  <DropdownMenuCheckboxItem key={channel} checked={selectedChannels.includes(channel)} onCheckedChange={(c) => setSelectedChannels(prev => c ? [...prev, channel] : prev.filter(x => x !== channel))}>
                    {channel}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-3.5 w-3.5" />Status
                  {selectedStatuses.length !== allStatuses.length && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{selectedStatuses.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel><DropdownMenuSeparator />
                {allStatuses.map(status => (
                  <DropdownMenuCheckboxItem key={status} checked={selectedStatuses.includes(status)} onCheckedChange={(c) => setSelectedStatuses(prev => c ? [...prev, status] : prev.filter(x => x !== status))}>
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="flex-grow overflow-auto p-4 bg-muted/20">
          <Card className="h-full shadow-sm border-none">
            <CardContent className="p-0 h-full">
              <div className="grid grid-cols-7 h-full">
                {weekdays.map(day => (
                  <div key={day} className="text-center font-medium p-2 border-b border-r text-muted-foreground bg-muted/50 text-xs uppercase tracking-wider sticky top-0 z-10">{day}</div>
                ))}
                {daysInMonth.map((day, index) => {
                  const isPast = isPastDate(day);
                  const availStatus = getDayAvailStatus(day);
                  const statusDef = availStatus ? getStatusDef(availStatus) : null;
                  const hasBookings = getBookingsForDay(day).length > 0;

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        `border-b border-r p-1 flex flex-col gap-1 relative min-h-[120px] transition-colors cursor-pointer group`,
                        !isSameMonth(day, currentDate) ? "bg-muted/30 text-muted-foreground" : isPast ? "bg-muted/10 text-muted-foreground" : "bg-white hover:bg-muted/10",
                        isSameDay(day, new Date()) ? "bg-blue-50/50" : "",
                        // Availability overlay (only show if no booking on this day)
                        !hasBookings && statusDef && statusDef.key !== 'open' ? statusDef.cellStyle : ""
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1 ${isSameDay(day, new Date()) ? 'text-primary font-bold' : ''} ${isPast ? 'opacity-50' : ''} text-sm`}>
                          {format(day, "d")}
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Availability badge on empty days */}
                          {!hasBookings && statusDef && statusDef.key !== 'open' && (
                            <span className="text-[9px] font-semibold px-1 py-0.5 rounded" title={statusDef.description}>
                              {statusDef.icon}
                            </span>
                          )}
                          {/* Price */}
                          <div className={`text-xs font-medium pr-1 group-hover:text-foreground ${isPast ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                            {getDisplayPrice(day)}
                          </div>
                        </div>
                      </div>

                      <div className={`flex flex-col gap-1 overflow-y-auto max-h-[120px] ${isPast ? 'opacity-70' : ''}`}>
                        {getBookingsForDay(day).map(booking => (
                          <button
                            type="button"
                            key={booking.id}
                            onClick={(e) => handleBookingClick(e, booking)}
                            className={`text-left text-[10px] px-1.5 py-1 border truncate cursor-pointer w-full shadow-sm transition-all hover:opacity-90 leading-tight ${getChannelColor(booking.channel)} rounded-sm`}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'Confirmed' ? 'bg-green-500' : booking.status === 'Cancel' ? 'bg-red-500' : 'bg-gray-500'}`} />
                              <span className="font-semibold">{booking.unitIdentifier}</span>
                            </div>
                            <span className="opacity-80 truncate block">{booking.guestName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIDE SHEET */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center gap-2">
                {sheetView !== 'main' && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setSheetView('main')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <SheetTitle>
                  {selectedBooking ? "Booking Details" :
                    sheetView === 'price' ? "Price Settings" :
                      sheetView === 'availability' ? "Availability Settings" : "Manage Date"}
                </SheetTitle>
              </div>
              <SheetDescription>
                {selectedDate ? format(selectedDate, "PPPP") : "Manage your calendar"}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-6 py-4">
              {selectedBooking ? (
                // BOOKING DETAILS
                <div className="space-y-4">
                  <h3 className="font-medium">Reservation Info</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground block mb-1">Guest</span><span className="font-medium">{selectedBooking.guestName}</span></div>
                    <div><span className="text-muted-foreground block mb-1">Channel</span><Badge variant="outline">{selectedBooking.channel}</Badge></div>
                    <div><span className="text-muted-foreground block mb-1">Status</span><Badge variant={getBadgeVariant(selectedBooking.status)}>{selectedBooking.status}</Badge></div>
                    <div><span className="text-muted-foreground block mb-1">Unit</span><span>{selectedBooking.unitIdentifier}</span></div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block mb-1">Total Payout</span>
                      <span className="font-medium text-lg text-green-600">{new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(selectedBooking.total)}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/booking/${selectedBooking.id}/edit`} className="w-full">
                    <Button type="button" variant="outline" className="w-full">View Full Booking</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* MAIN VIEW - choose action */}
                  {sheetView === 'main' && (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setSheetView('price')}>
                        <div className="space-y-1">
                          <h3 className="font-medium text-base">💰 Price Settings</h3>
                          <p className="text-sm text-muted-foreground">{selectedDate ? (getDisplayPrice(selectedDate) || 'RM 0') : 'RM 0'} per night</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                      </div>
                      <Separator />
                      <div className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setSheetView('availability')}>
                        <div className="space-y-1">
                          <h3 className="font-medium text-base">📅 Availability Status</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedDate ? (() => {
                              const s = getDayAvailStatus(selectedDate);
                              return s ? `Current: ${getStatusDef(s).label}` : 'Current: Open';
                            })() : 'Set room availability & block dates'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                      </div>
                    </div>
                  )}

                  {/* PRICE VIEW */}
                  {sheetView === 'price' && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-200">
                      <div className="space-y-3">
                        <Label>Date Range</Label>
                        <DateRangePicker
                          from={priceFromDate}
                          to={priceToDate}
                          onSelect={(f, t) => { setPriceFromDate(f); setPriceToDate(t); }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Nightly Price (MYR)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">RM</span>
                          <Input
                            id="price" type="number" className="pl-10" placeholder="0.00"
                            disabled={selectedDate && isPastDate(selectedDate)}
                            value={priceInputValue}
                            onChange={(e) => setPriceInputValue(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button type="button" className="w-full" onClick={handleSavePrice} disabled={priceSaving || (selectedDate && isPastDate(selectedDate))}>
                        {priceSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : '💾 Save & Sync to Beds24'}
                      </Button>
                    </div>
                  )}

                  {/* AVAILABILITY VIEW */}
                  {sheetView === 'availability' && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 duration-200">
                      <div className="space-y-3">
                        <Label>Date Range</Label>
                        <DateRangePicker
                          from={availFromDate}
                          to={availToDate}
                          onSelect={(f, t) => { setAvailFromDate(f); setAvailToDate(t); }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Availability Status</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {AVAILABILITY_STATUSES.map(s => (
                            <label
                              key={s.key}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                availStatus === s.key ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground"
                              )}
                            >
                              <input type="radio" name="avail_status" value={s.key} className="sr-only" checked={availStatus === s.key} onChange={() => setAvailStatus(s.key)} />
                              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{s.icon} {s.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{s.description}</p>
                              </div>
                              {availStatus === s.key && <span className="text-primary text-sm">✓</span>}
                            </label>
                          ))}
                        </div>
                      </div>

                      {availStatus !== 'open' && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                          <strong>Beds24 push:</strong>{' '}
                          {availStatus === 'blackout' ? 'override: "blackout" — hard block, invisible to channels' : 'numAvail: 0 — room closed on all connected channels'}
                        </div>
                      )}
                      {availStatus === 'open' && (
                        <div className="text-[11px] text-emerald-600 bg-emerald-50 p-3 rounded border border-emerald-200">
                          <strong>Beds24 push:</strong> numAvail: N — reopens room on all connected channels
                        </div>
                      )}

                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleSaveAvailability}
                        disabled={availSaving || !availFromDate || !availToDate}
                      >
                        {availSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : '🔄 Apply & Sync to Beds24'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
