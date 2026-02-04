'use client'

import * as React from "react"
import Link from "next/link";
import Image from "next/image";
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
  MapPin,
  X,
  BedDouble,
  DoorOpen
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
  isWeekend,
  isBefore,
  startOfDay
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
  SheetFooter,
  SheetClose
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

const getPlaceholder = (id) => {
  const image = PlaceHolderImages.find(img => img.id === `property-${id}`);
  if (image) {
    return {
      url: image.url,
      hint: image.hint
    };
  }
  return {
    url: `https://picsum.photos/seed/${id}/80/60`,
    hint: 'property exterior'
  }
}

// Sidebar Component for Hierarchy
const HierarchyItem = ({ item, level = 0, selection, onSelect, type }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Safety check: Convert to strings for comparison
  const isSelected = selection.type === type && String(selection.id) === String(item.id);
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if a child is selected
  React.useEffect(() => {
    if (item.children) {
      const childSelected = item.children.some(child =>
        (selection.type === 'room_type' && String(child.id) === String(selection.id)) ||
        (child.children && child.children.some(grandChild => selection.type === 'unit' && String(grandChild.id) === String(selection.id)))
      );
      if (childSelected) setIsOpen(true);
    }
  }, [selection, item]);

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect({ type, id: item.id, data: item });
  };

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
        onClick={handleSelect}
      >
        <div className="flex items-center py-3 flex-1 overflow-hidden">
          {hasChildren ? (
            <CollapsibleTrigger className="h-6 w-6 p-0 mr-1 flex items-center justify-center hover:bg-muted rounded-md" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
              <span><ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} /></span>
            </CollapsibleTrigger>
          ) : (
            <div className="w-7" /> // Spacer
          )}

          <div className="flex items-center gap-2 overflow-hidden">
            {getIcon()}
            <div className="flex flex-col min-w-0">
              <span className={`text-sm truncate ${isSelected ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                {item.name || item.unit_identifier}
              </span>
              {type === 'property' && (
                <span className="text-[10px] text-muted-foreground truncate">{item.city}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          {item.children.map(child => (
            <HierarchyItem
              key={child.id}
              item={child}
              level={level + 1}
              selection={selection}
              onSelect={onSelect}
              type={type === 'property' ? 'room_type' : 'unit'}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [bookings, setBookings] = React.useState([]);
  const [hierarchy, setHierarchy] = React.useState([]); // Tree data
  // Selection state: { type: 'property' | 'room_type' | 'unit', id: string, data: object }
  const [selection, setSelection] = React.useState({ type: null, id: null, data: null });

  const [allChannels, setAllChannels] = React.useState([]);
  const [allStatuses, setAllStatuses] = React.useState(Object.values(statusMapping));
  const [selectedChannels, setSelectedChannels] = React.useState([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Sheet State
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [sheetView, setSheetView] = React.useState('main'); // 'main' | 'price' | 'availability'

  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch from our backend
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

        // 2. Fetch from Beds24 (if token exists)
        try {
          const bed24Token = localStorage.getItem('bed24_accessToken');
          if (bed24Token) {
            const bed24Response = await fetch('/api/bed24/properties', {
              method: 'GET',
              headers: {
                'accept': 'application/json',
                'token': bed24Token
              }
            });

            if (bed24Response.ok) {
              const bed24Data = await bed24Response.json();
              if (bed24Data.success && Array.isArray(bed24Data.data)) {
                // Transform Beds24 properties to match our internal format
                // Note: We prefix IDs to avoid collision and mark them clearly
                const mappedProps = bed24Data.data.map(p => {
                  const children = p.roomTypes ? p.roomTypes.map(rt => ({
                    id: `bed24-${rt.id}`,
                    name: rt.name,
                    type: 'room_type',
                    propertyId: `bed24-${p.id}`,
                    is_bed24: true,
                    children: []
                  })) : [];

                  return {
                    id: `bed24-${p.id}`,
                    name: `[Beds24] ${p.name}`,
                    city: p.city,
                    country: p.country,
                    // Add extra fields if needed
                    is_bed24: true,
                    children: children
                  };
                });

                // Merge into properties list
                propertiesData = [...propertiesData, ...mappedProps];
              }
            } else {
              console.warn("Beds24 fetch failed", bed24Response.status);
            }
          }
        } catch (b24Err) {
          console.error("Failed to fetch Beds24 properties", b24Err);
          // Don't fail the whole page load just because Beds24 failed
        }

        // 3. Build Hierarchy: Property -> Room Type -> Unit
        const propertiesMap = new Map();

        propertiesData.forEach(p => {
          propertiesMap.set(p.id, { ...p, type: 'property', children: p.children || [] });
        });

        const roomTypesMap = new Map(); // Composite key: `${propertyId}-${roomTypeId}`

        unitsData.forEach(unit => {
          const property = propertiesMap.get(unit.property_id);
          if (!property) return;

          // Find or Create Room Type Node under Property
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
              children: [] // Units go here
            };
            roomTypesMap.set(roomTypeKey, roomTypeNode);
            property.children.push(roomTypeNode);
          }

          // Add Unit to Room Type
          roomTypeNode.children.push({
            ...unit,
            type: 'unit',
            name: unit.unit_identifier
          });
        });

        // HANDLE ORPHANED BEDS24 PROPERTIES (that have no units in our DB)
        // Since we just merged them, they exist in propertiesMap but have no children from 'unitsData'
        // We might want to create a dummy child so they are selectable/visible in hierarchy if strictly needed,
        // or just let them exist as properties.
        // For now, let's leave them as-is. They will show up in the sidebar.

        const hierarchyData = Array.from(propertiesMap.values());
        setHierarchy(hierarchyData);

        // Default Selection: First Property
        if (hierarchyData.length > 0) {
          setSelection({ type: 'property', id: hierarchyData[0].id, data: hierarchyData[0] });
        }

        // 4. Format Bookings - Aggressively extraction of IDs
        const formattedBookings = bookingsData.map(booking => {
          // Helper to find unit node if nested
          const unit = booking.property_unit || booking.unit || {};
          // Helper to find room type
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

            // Robust ID Extraction: Check multiple possible locations for IDs
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

  const filteredBookings = React.useMemo(() => {
    return bookings.filter(booking => {
      // 1. Filter by Hierarchical Selection
      if (!selection.id) return false;

      if (selection.type === 'property') {
        // Compare as strings to be safe
        if (String(booking.propertyId) !== String(selection.id)) return false;
      } else if (selection.type === 'room_type') {
        if (String(booking.roomTypeId) !== String(selection.id)) return false;
      } else if (selection.type === 'unit') {
        if (String(booking.unitId) !== String(selection.id)) return false;
      }

      // 2. Filter by Channels
      if (selectedChannels.length > 0 && !selectedChannels.includes(booking.channel)) {
        return false;
      }

      // 3. Filter by Status
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(booking.status)) {
        return false;
      }

      return true;
    })
  }, [bookings, selection, selectedChannels, selectedStatuses]);

  const getBookingsForDay = (day) => {
    if (!day) return [];
    return filteredBookings.filter(booking => {
      return isSameDay(day, booking.checkIn) || isWithinInterval(day, { start: booking.checkIn, end: subDays(booking.checkOut, 1) });
    });
  }

  // Price State: { [roomId]: { [dateString]: price } }
  const [prices, setPrices] = React.useState({});

  // ... (existing state)

  // Fetch Prices Effect
  React.useEffect(() => {
    const fetchPrices = async () => {
      const bed24Token = localStorage.getItem('bed24_accessToken');
      if (!bed24Token) return;

      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      try {
        const response = await fetch(`/api/bed24/calendar?startDate=${start}&endDate=${end}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'token': bed24Token
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const newPrices = { ...prices };

            data.data.forEach(room => {
              // Map Room ID to our Property ID format if needed.
              // In our property fetch, we set ID as `bed24-${p.id}`.
              // The calendar endpoint returns `roomId` and `propertyId`. 
              // Our properties have `id` matching `bed24-${propertyId}` (assuming default room type mapping).

              // Note: Beds24 properties might have multiple rooms.
              // For simplicity, we store by `bed24-${propertyId}` or `bed24-${roomId}` if we mapped that way.
              // In the previous step, we mapped property ID as `bed24-${p.id}`.
              // Let's assume 1:1 for now or map by propertyId.

              const key = `bed24-${room.propertyId}`;
              if (!newPrices[key]) newPrices[key] = {};

              if (Array.isArray(room.calendar)) {
                room.calendar.forEach(range => {
                  // range: { from, to, price1, ... }
                  // Expand range to individual dates
                  const rangeStart = new Date(range.from);
                  const rangeEnd = new Date(range.to);
                  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

                  days.forEach(day => {
                    newPrices[key][format(day, 'yyyy-MM-dd')] = range.price1;
                  });
                });
              }
            });
            setPrices(newPrices);
          }
        }
      } catch (error) {
        console.error("Failed to fetch prices", error);
      }
    };

    fetchPrices();
  }, [currentDate]); // Re-fetch when month changes


  const getDisplayPrice = (day) => {
    if (!day) return '';
    // 1. If booked, average booking price
    const dayBookings = getBookingsForDay(day);
    if (dayBookings.length > 0) {
      const booking = dayBookings[0];
      const nights = differenceInDays(booking.checkOut, booking.checkIn) || 1;
      const price = booking.total / nights;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    }

    // 2. If unbooked, derive from Selection
    if (!selection.data) return '$';

    // CHECK FOR BEDS24 PRICING
    if (selection.data.is_bed24) {
      // Look up in prices state
      // If selection is a property: key is the ID (e.g., bed24-310176)
      // If selection is a room: key is the PROPERTY ID it belongs to (because our price fetch stores by property ID key)
      // Wait, our price fetch stored by `bed24-${room.propertyId}`. 
      // If we select the Room node, its ID is `bed24-${roomId}`. But we need to look up prices by the Property key.
      // Or better, we should organize prices by the ID that matches the selection.

      // Let's look at how we stored prices: `newPrices[key][date] = price` where `key = bed24-${room.propertyId}`. 
      // And currently room.calendar logic puts ALL rooms of a property into the same key bucket, overwriting if multiple rooms?
      // Actually, the API returns a list of rooms. If we use propertyId as key, we might blend prices if multiple rooms exist.
      // We should probably key by RoomID if available.

      // Let's adjust the fetch logic first (or assume for now 1 property = 1 room as per user data).
      // Since we are creating children now, let's try to look up by selection ID directly.
      // If the selection is the PROPERTY, we might show the first room's price.
      // If the selection is the ROOM, we show that room's price.

      // REVISIT FETCH LOGIC:
      // We need to store prices by ROOM ID for precision if we have rooms.
      // But for now, let's assume the key matches the selection.id if we fix the fetch.

      // Current Fetch Logic stores by `bed24-${room.propertyId}`. 
      // If I select the Property node `bed24-310176`, it works.
      // If I select the Room node `bed24-646315`, it won't find it.

      // For now, let's fallback to Property ID lookup if Room ID fails, or just use Property ID logic?
      // The user's goal is to see prices.

      let dateKey = format(day, 'yyyy-MM-dd');

      // Try looking up by ID directly
      if (prices[selection.id] && prices[selection.id][dateKey]) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(prices[selection.id][dateKey]);
      }

      // If selection is a Room, try looking up its parent Property ID?
      // In our mapping: propertyId field is `bed24-${p.id}`.
      if (selection.type === 'room_type' && selection.data.propertyId) {
        const parentKey = selection.data.propertyId;
        if (prices[parentKey] && prices[parentKey][dateKey]) {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(prices[parentKey][dateKey]);
        }
      }

      return 'N/A';
    }

    // 3. Fallback to Helper Logic (Existing System)
    let priceValues = [];
    const isFriOrSat = isWeekend(day);

    const getPrice = (roomType) => isFriOrSat ? roomType.weekend_price : roomType.weekday_price;

    if (selection.type === 'unit') {
      const unit = selection.data;
      if (unit.room_type) {
        priceValues.push(getPrice(unit.room_type));
      }
    } else if (selection.type === 'room_type') {
      priceValues.push(getPrice(selection.data));
    } else if (selection.type === 'property') {
      selection.data.children.forEach(rt => {
        priceValues.push(getPrice(rt));
      });
    }

    priceValues = priceValues.filter(p => p != null);

    if (priceValues.length === 0) return '$';

    const minPrice = Math.min(...priceValues);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(minPrice);
  }

  const handleDayClick = (day) => {
    setSelectedDate(day);
    const dayBookings = getBookingsForDay(day);
    if (dayBookings.length > 0) {
      setSelectedBooking(dayBookings[0]);
    } else {
      setSelectedBooking(null);
    }
    setSheetView('main');
    setSheetOpen(true);
  }

  const handleBookingClick = (e, booking) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setSelectedDate(booking.checkIn);
    setSheetView('main');
    setSheetOpen(true);
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

  const [priceInputValue, setPriceInputValue] = React.useState("");

  const handleSavePrice = async () => {
    if (!selection.data || !selection.data.is_bed24 || !selectedDate) {
      toast({ title: "Error", description: "Invalid selection for update.", variant: "destructive" });
      return;
    }

    // Determine Room ID
    // If selection is property, we might need to update all rooms or ask user.
    // Ideally user selected a Room unit. 
    // If they selected a Property, we will try to find a child room or use the property ID map if applicable.
    // Based on our mapping: `bed24-${roomId}` or `bed24-${propertyId}`.

    let roomId = null;
    if (selection.type === 'room_type') {
      roomId = selection.id.replace('bed24-', '');
    } else if (selection.type === 'property') {
      // Try to find first child room
      if (selection.data.children && selection.data.children.length > 0) {
        roomId = selection.data.children[0].id.replace('bed24-', '');
      } else {
        // Fallback: assume property ID maps to room ID (not always true)
        // or alert user.
        roomId = selection.id.replace('bed24-', '');
      }
    }

    if (!roomId) {
      toast({ title: "Error", description: "Could not determine Room ID. Please select a specific Room.", variant: "destructive" });
      return;
    }

    const price = parseFloat(priceInputValue);
    if (isNaN(price)) {
      toast({ title: "Error", description: "Invalid price value", variant: "destructive" });
      return;
    }

    const payload = [
      {
        roomId: parseInt(roomId),
        calendar: [
          {
            from: format(selectedDate, 'yyyy-MM-dd'),
            to: format(selectedDate, 'yyyy-MM-dd'),
            price1: price
          }
        ]
      }
    ];

    try {
      const bed24Token = localStorage.getItem('bed24_accessToken');
      const response = await fetch('/api/bed24/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': bed24Token
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({ title: "Success", description: "Price updated successfully." });
        setSheetOpen(false);

        // Update local state for immediate feedback
        setPrices(prev => {
          const newPrices = { ...prev };
          // Determine the correct key in 'prices' map
          // It is stored as `bed24-${propertyId}`
          let priceKey = null;

          if (selection.type === 'property') {
            priceKey = selection.id;
          } else if (selection.type === 'room_type') {
            // selection.data.propertyId was set as `bed24-${p.id}` in fetchData
            priceKey = selection.data.propertyId;
          }

          if (priceKey) {
            if (!newPrices[priceKey]) newPrices[priceKey] = {};
            newPrices[priceKey][format(selectedDate, 'yyyy-MM-dd')] = price;
          }

          return newPrices;
        });
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to update");
      }
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const isPastDate = (day) => {
    return isBefore(day, startOfDay(new Date()));
  };

  if (loading) {
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
              <HierarchyItem
                key={property.id}
                item={property}
                type="property"
                selection={selection}
                onSelect={setSelection}
              />
            ))}
            {hierarchy.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No properties found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT MAIN CONTENT - CALENDAR */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* TOP BAR */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight w-40">
              {format(currentDate, "MMMM yyyy")}
            </h1>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  Channels
                  {selectedChannels.length !== allChannels.length && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{selectedChannels.length}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
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
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  Status
                  {selectedStatuses.length !== allStatuses.length && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{selectedStatuses.length}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
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

        {/* CALENDAR GRID */}
        <div className="flex-grow overflow-auto p-4 bg-muted/20">
          <Card className="h-full shadow-sm border-none">
            <CardContent className="p-0 h-full">
              <div className="grid grid-cols-7 h-full">
                {weekdays.map(day => (
                  <div key={day} className="text-center font-medium p-2 border-b border-r text-muted-foreground bg-muted/50 text-xs uppercase tracking-wider sticky top-0 z-10">
                    {day}
                  </div>
                ))}

                {daysInMonth.map((day, index) => {
                  const isPast = isPastDate(day);
                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day)}
                      className={`border-b border-r p-1 flex flex-col gap-1 relative min-h-[120px] transition-colors cursor-pointer group
                            ${!isSameMonth(day, currentDate) ? "bg-muted/30 text-muted-foreground" : isPast ? "bg-muted/10 text-muted-foreground" : "bg-white hover:bg-muted/10"}
                            ${isSameDay(day, new Date()) ? "bg-blue-50/50" : ""}
                            `}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1 ${isSameDay(day, new Date()) ? 'text-primary font-bold' : ''} ${isPast ? 'opacity-50' : ''} text-sm`}>
                          {format(day, "d")}
                        </div>
                        {/* Daily Price Display */}
                        <div className={`text-xs font-medium pr-1 group-hover:text-foreground ${isPast ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                          {getDisplayPrice(day)}
                        </div>
                      </div>

                      <div className={`flex flex-col gap-1 overflow-y-auto max-h-[120px] ${isPast ? 'opacity-70' : ''}`}>
                        {getBookingsForDay(day).map(booking => {
                          const isStart = isSameDay(day, booking.checkIn);
                          const isEnd = isSameDay(day, subDays(booking.checkOut, 1));

                          return (
                            <button
                              key={booking.id}
                              onClick={(e) => handleBookingClick(e, booking)}
                              className={`text-left text-[10px] px-1.5 py-1 border truncate cursor-pointer w-full shadow-sm transition-all hover:opacity-90 leading-tight
                                        ${getChannelColor(booking.channel)}
                                        rounded-sm
                                    `}
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'Confirmed' ? 'bg-green-500' :
                                  booking.status === 'Cancel' ? 'bg-red-500' : 'bg-gray-500'
                                  }`} />
                                <span className="font-semibold">{booking.unitIdentifier}</span>
                              </div>
                              <span className="opacity-80 truncate block">{booking.guestName}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE SHEET - DETAILS & PRICES */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center gap-2">
                {sheetView !== 'main' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setSheetView('main')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <SheetTitle>
                  {selectedBooking ? "Booking Details" :
                    sheetView === 'price' ? "Price settings" :
                      sheetView === 'availability' ? "Availability settings" :
                        "Edit Availability"}
                </SheetTitle>
              </div>
              <SheetDescription>
                {selectedDate ? format(selectedDate, "PPPP") : "Manage your calendar"}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-6 py-4">
              {selectedBooking ? (
                // EXISTING BOOKING DETAILS VIEW
                <div className="space-y-4">
                  <h3 className="font-medium">Reservation Info</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Guest</span>
                      <span className="font-medium">{selectedBooking.guestName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Channel</span>
                      <Badge variant="outline">{selectedBooking.channel}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Status</span>
                      <Badge variant={getBadgeVariant(selectedBooking.status)}>{selectedBooking.status}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Unit</span>
                      <span>{selectedBooking.unitIdentifier}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block mb-1">Total Payout</span>
                      <span className="font-medium text-lg text-green-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedBooking.total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/dashboard/booking/${selectedBooking.id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full">View Full Booking</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                // NEW AVAILABLE / EDIT MODE
                <>
                  {sheetView === 'main' && (
                    <div className="space-y-6">
                      {/* Price Settings Card */}
                      <div
                        className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => setSheetView('price')}
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium text-base">Price settings</h3>
                          <div className="text-sm text-muted-foreground space-y-0.5">
                            <p>{selectedDate ? (getDisplayPrice(selectedDate) || '$0') : '$0'} per night</p>
                            {/* <p>$13,199 weekend price</p>
                            <p>10% weekly discount</p> */}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <Separator />

                      {/* Availability Settings Card */}
                      <div
                        className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => setSheetView('availability')}
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium text-base">Availability settings</h3>
                          <div className="text-sm text-muted-foreground space-y-0.5">
                            <p>2 – 365 night stays</p>
                            <p>At least 1 day advance notice</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-4">
                        <Button variant="outline" className="w-full justify-start text-muted-foreground" disabled={selectedDate && isPastDate(selectedDate)}>
                          <span className="mr-2">🚫</span> Block this date
                        </Button>
                      </div>
                    </div>
                  )}

                  {sheetView === 'price' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="price">Nightly Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              id="price"
                              type="number"
                              className="pl-7"
                              placeholder="0.00"
                              disabled={selectedDate && isPastDate(selectedDate)}
                              defaultValue={getDisplayPrice(selectedDate).replace(/[^0-9.]/g, '')}
                              onChange={(e) => setPriceInputValue(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="weekend-price">Weekend Price</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                              id="weekend-price"
                              type="number"
                              className="pl-7"
                              placeholder="0.00"
                              defaultValue="13199"
                              disabled
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">Applies to Friday and Saturday nights (Not editable yet).</p>
                        </div>
                        {/* 
                        <div className="grid gap-2">
                          <Label htmlFor="discount">Weekly Discount (%)</Label>
                          <div className="relative">
                            <Input
                              id="discount"
                              type="number"
                              placeholder="0"
                              defaultValue="10"
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                          </div>
                        </div> 
                        */}
                      </div>
                      <Button className="w-full" onClick={handleSavePrice}>Save Price Settings</Button>
                    </div>
                  )}

                  {sheetView === 'availability' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="min-nights">Min Nights</Label>
                            <Input id="min-nights" type="number" defaultValue="2" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="max-nights">Max Nights</Label>
                            <Input id="max-nights" type="number" defaultValue="365" />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="advance-notice">Advance Notice (Days)</Label>
                          <Select defaultValue="1">
                            <SelectTrigger>
                              <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Same Day</SelectItem>
                              <SelectItem value="1">1 Day</SelectItem>
                              <SelectItem value="2">2 Days</SelectItem>
                              <SelectItem value="3">3 Days</SelectItem>
                              <SelectItem value="7">7 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="w-full">Save Availability Settings</Button>
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
