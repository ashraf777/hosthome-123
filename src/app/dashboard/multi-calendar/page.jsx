'use client'

import React, { useState, useMemo, useEffect, memo, useCallback } from 'react'
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import Link from "next/link";
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
    ChevronDown,
    ChevronUp,
    X,
    Loader2,
    DollarSign,
    Shield,
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
    parseISO,
} from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AVAILABILITY_STATUSES } from "@/app/dashboard/calendar/page"

// ─── Booking Status Definitions ──────────────────────────────────────────────
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
    { id: 12, name: 'Walk In' },
];

const statusColors = {
    1: { background: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200", border: "border-green-300 dark:border-green-700" },
    2: { background: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", border: "border-gray-300 dark:border-gray-600" },
    3: { background: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200", border: "border-blue-300 dark:border-blue-700" },
    4: { background: "bg-purple-100 dark:bg-purple-900", text: "text-purple-800 dark:text-purple-200", border: "border-purple-300 dark:border-purple-700" },
    5: { background: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200", border: "border-yellow-300 dark:border-yellow-700" },
    6: { background: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-800 dark:text-cyan-200", border: "border-cyan-300 dark:border-cyan-700" },
    7: { background: "bg-red-100 dark:bg-red-800", text: "text-red-800 dark:text-red-200", border: "border-red-300 dark:border-red-600" },
    8: { background: "bg-orange-100 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-200", border: "border-orange-300 dark:border-orange-700" },
    9: { background: "bg-teal-100 dark:bg-teal-900", text: "text-teal-800 dark:text-teal-200", border: "border-teal-300 dark:border-teal-700" },
    10: { background: "bg-gray-200 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-200", border: "border-gray-400 dark:border-gray-600" },
    11: { background: "bg-black", text: "text-white", border: "border-black" },
    12: { background: "bg-pink-100 dark:bg-pink-900", text: "text-pink-800 dark:text-pink-200", border: "border-pink-300 dark:border-pink-700" },
};

// Availability status cell styles for the multi-calendar
const availCellStyles = {
    open: '',
    closed: 'bg-slate-200/70 dark:bg-slate-700/60',
    blackout: 'bg-gray-800/25 dark:bg-gray-900/60',
    stop_sell: 'bg-red-100/70 dark:bg-red-950/60',
    on_request: 'bg-amber-100/70 dark:bg-amber-950/60',
    maintenance: 'bg-orange-100/70 dark:bg-orange-950/60',
    owner_use: 'bg-purple-100/70 dark:bg-purple-950/60',
};

// ─── UnitRow Component ────────────────────────────────────────────────────────
const UnitRow = memo(({ unit, daysInRange, selectedStatuses, onBookingClick, onCellClick, availabilityOverrides, roomTypeId }) => {
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
        const availKey = `${roomTypeId}_${dayStr}`;
        const availOverride = availabilityOverrides[availKey];

        if (booking && isVisible) {
            let colSpan = 1;
            const bookingId = booking.id;
            for (let j = i + 1; j < daysInRange.length; j++) {
                const nextDayStr = format(daysInRange[j], 'yyyy-MM-dd');
                const nextDayData = unit.dates?.[nextDayStr];
                if (nextDayData?.booking && nextDayData.booking.id === bookingId) colSpan++;
                else break;
            }
            const color = statusColors[statusId] || statusColors[1];
            const guestName = booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Guest';
            const totalAmount = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(booking.total_amount);
            cells.push(
                <td key={`${dayStr}-${unit.id}`} colSpan={colSpan} className="p-0 border-r border-t border-b">
                    <div
                        onClick={() => onBookingClick(booking)}
                        className={cn("h-full w-full flex items-center justify-center text-xs p-1 rounded-md cursor-pointer m-[1px] overflow-hidden whitespace-nowrap text-ellipsis border", color.background, color.text, color.border)}
                        title={`${unit.name} - ${statusName} (${booking.confirmation_code})`}
                    >
                        <div className="flex justify-between items-center w-full gap-2">
                            <span className="font-bold truncate text-[10px] uppercase">{statusName}</span>
                            <span className="font-semibold text-[11px] truncate">{guestName}</span>
                            <span className="text-[10px] opacity-80 whitespace-nowrap">{totalAmount}</span>
                        </div>
                    </div>
                </td>
            );
            i += colSpan;
        } else {
            // Empty cell — show availability status if any
            const availDef = availOverride ? AVAILABILITY_STATUSES.find(s => s.key === availOverride) : null;
            const cellBg = availDef && availDef.key !== 'open' ? availCellStyles[availDef.key] : '';

            cells.push(
                <td
                    key={`${dayStr}-${unit.id}`}
                    className={cn(`p-0 border-r w-[120px] min-w-[120px] h-full cursor-pointer group/cell`, isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-950' : '', cellBg)}
                    onClick={() => onCellClick({ day, dayStr, unit, roomTypeId })}
                    title={availDef ? `${availDef.label}: ${availDef.description}` : 'Click to manage'}
                >
                    <div className="h-full w-full p-1 text-center text-[10px] text-gray-500 dark:text-gray-500 group-hover/cell:bg-primary/5 transition-colors">
                        {availDef && availDef.key !== 'open' ? (
                            <span className="font-semibold">{availDef.icon} {availDef.label}</span>
                        ) : (
                            <span className="opacity-0 group-hover/cell:opacity-100 text-primary transition-opacity">+ Edit</span>
                        )}
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

// ─── Cell Action Sheet ────────────────────────────────────────────────────────
const CellActionSheet = ({ open, onClose, cellInfo, onSaved }) => {
    const { toast } = useToast();
    const [view, setView] = useState('main'); // 'main' | 'price' | 'availability'
    const [price, setPrice] = useState('');
    const [priceFrom, setPriceFrom] = useState(null);
    const [priceTo, setPriceTo] = useState(null);
    const [availFrom, setAvailFrom] = useState(null);
    const [availTo, setAvailTo] = useState(null);
    const [availStatus, setAvailStatus] = useState('closed');
    const [saving, setSaving] = useState(false);

    // Sync dates and inputs when cell info changes
    useEffect(() => {
        if (cellInfo) {
            if (cellInfo.day) {
                setPriceFrom(cellInfo.day);
                setPriceTo(cellInfo.day);
                setAvailFrom(cellInfo.day);
                setAvailTo(cellInfo.day);
            }
            // Reset state values to selected cell's actual price and status
            setPrice(cellInfo.currentPrice !== undefined && cellInfo.currentPrice !== null ? String(cellInfo.currentPrice) : '');
            setAvailStatus(cellInfo.currentStatus || 'open');
        }
        setView('main');
    }, [cellInfo]);

    const getRoomTypeId = () => cellInfo?.roomTypeId?.replace?.('room-type-', '') || cellInfo?.roomTypeId;

    const handleSavePrice = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const rtId = getRoomTypeId();
        const p = parseFloat(price);
        if (!rtId || isNaN(p) || !priceFrom || !priceTo) {
            toast({ title: "Error", description: "Fill in all fields.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const isSingle = isSameDay(priceFrom, priceTo);
            const payload = isSingle
                ? { room_type_id: parseInt(rtId), date: format(priceFrom, 'yyyy-MM-dd'), price: p }
                : { room_type_id: parseInt(rtId), from_date: format(priceFrom, 'yyyy-MM-dd'), to_date: format(priceTo, 'yyyy-MM-dd'), price: p };
            const resp = await api.post('beds24/calendar/price', payload);
            if (resp.success) {
                toast({ title: "✅ Price Updated", description: "Synced to HostHome and Beds24." });
                onSaved?.('price', { from: priceFrom, to: priceTo, price: p, roomTypeId: rtId });
                onClose();
            } else throw new Error(resp.error);
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally { setSaving(false); }
    };

    const handleSaveAvailability = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const rtId = getRoomTypeId();
        if (!rtId || !availFrom || !availTo) {
            toast({ title: "Error", description: "Fill in all fields.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const resp = await api.post('beds24/calendar/availability', {
                room_type_id: parseInt(rtId),
                from_date: format(availFrom, 'yyyy-MM-dd'),
                to_date: format(availTo, 'yyyy-MM-dd'),
                status: availStatus,
            });
            if (resp.success) {
                const def = AVAILABILITY_STATUSES.find(s => s.key === availStatus);
                toast({ title: `${def?.icon} Availability Updated`, description: resp.message });
                onSaved?.('availability', { from: availFrom, to: availTo, status: availStatus, roomTypeId: rtId });
                onClose();
            } else throw new Error(resp.error);
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally { setSaving(false); }
    };

    return (
        <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <SheetContent className="w-[420px] sm:w-[500px] overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        {view !== 'main' && (
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setView('main')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <SheetTitle>
                            {view === 'main' ? 'Manage Date' : view === 'price' ? '💰 Price Settings' : '📅 Availability Status'}
                        </SheetTitle>
                    </div>
                    <SheetDescription>
                        {cellInfo?.unit?.name} — {cellInfo?.dayStr ? format(parseISO(cellInfo.dayStr), 'MMMM d, yyyy') : ''}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-4 space-y-4">
                    {view === 'main' && (
                        <div className="space-y-3">
                            <button type="button" className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-primary/60 cursor-pointer transition-colors text-left" onClick={() => setView('price')}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><DollarSign className="h-5 w-5 text-blue-600" /></div>
                                    <div>
                                        <p className="font-medium text-sm">Update Price</p>
                                        <p className="text-xs text-muted-foreground">Set nightly rate for a date range</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button type="button" className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-primary/60 cursor-pointer transition-colors text-left" onClick={() => setView('availability')}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg"><Shield className="h-5 w-5 text-orange-600" /></div>
                                    <div>
                                        <p className="font-medium text-sm">Set Availability</p>
                                        <p className="text-xs text-muted-foreground">Block, close, or open dates on channels</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    )}

                    {view === 'price' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {priceFrom && priceTo && !isSameDay(priceFrom, priceTo)
                                                ? `${format(priceFrom, 'MMM d')} → ${format(priceTo, 'MMM d, yyyy')}`
                                                : priceFrom ? format(priceFrom, 'MMM d, yyyy') : 'Pick date range'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            selected={priceFrom && priceTo ? { from: priceFrom, to: priceTo } : undefined}
                                            onSelect={(r) => { if (r?.from) { setPriceFrom(r.from); setPriceTo(r.to || r.from); } }}
                                            numberOfMonths={2}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mc-price">Nightly Price (MYR)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">RM</span>
                                    <Input id="mc-price" type="number" className="pl-10" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                            </div>
                            <Button type="button" className="w-full" onClick={handleSavePrice} disabled={saving}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : '💾 Save & Sync to Beds24'}
                            </Button>
                        </div>
                    )}

                    {view === 'availability' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {availFrom && availTo && !isSameDay(availFrom, availTo)
                                                ? `${format(availFrom, 'MMM d')} → ${format(availTo, 'MMM d, yyyy')}`
                                                : availFrom ? format(availFrom, 'MMM d, yyyy') : 'Pick date range'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="range"
                                            selected={availFrom && availTo ? { from: availFrom, to: availTo } : undefined}
                                            onSelect={(r) => { if (r?.from) { setAvailFrom(r.from); setAvailTo(r.to || r.from); } }}
                                            numberOfMonths={2}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="space-y-2">
                                    {AVAILABILITY_STATUSES.map(s => (
                                        <label
                                            key={s.key}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                availStatus === s.key ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                                            )}
                                        >
                                            <input type="radio" name="mc_avail" value={s.key} className="sr-only" checked={availStatus === s.key} onChange={() => setAvailStatus(s.key)} />
                                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`} />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{s.icon} {s.label}</p>
                                                <p className="text-xs text-muted-foreground">{s.description}</p>
                                            </div>
                                            {availStatus === s.key && <span className="text-primary">✓</span>}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="text-[11px] p-3 rounded border bg-muted/30 text-muted-foreground">
                                <strong>Beds24:</strong>{' '}
                                {availStatus === 'blackout' ? 'override: "blackout"' : availStatus === 'open' ? 'numAvail: N (reopen)' : 'numAvail: 0 (close)'}
                            </div>

                            <Button type="button" className="w-full" onClick={handleSaveAvailability} disabled={saving}>
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : '🔄 Apply & Sync to Beds24'}
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

// ─── Main Multi-Calendar Page ─────────────────────────────────────────────────
export default function MultiCalendarPage() {
    const { toast } = useToast();

    const now = new Date();
    const [date, setDate] = useState({
        from: startOfMonth(now),
        to: endOfMonth(addMonths(now, 1)),
    });

    const [hosts, setHosts] = useState([]);
    const [properties, setProperties] = useState([]);
    const [channels, setChannels] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [allBookingStatuses, setAllBookingStatuses] = useState([]);
    const [selectedHost, setSelectedHost] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [expandedRoomTypes, setExpandedRoomTypes] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Booking detail dialog
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Cell action sheet (price / availability)
    const [cellSheetOpen, setCellSheetOpen] = useState(false);
    const [activeCellInfo, setActiveCellInfo] = useState(null);

    // Local availability overrides (keyed by `roomTypeId_dateStr`)
    const [availabilityOverrides, setAvailabilityOverrides] = useState({});

    const daysInRange = useMemo(() =>
        date.from && date.to && isAfter(date.to, date.from)
            ? eachDayOfInterval({ start: date.from, end: date.to })
            : [],
        [date]
    );

    // Initial data fetch
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
                if (hostingCompany?.id) {
                    const hostData = [{ id: hostingCompany.id, name: hostingCompany.name }];
                    setHosts(hostData);
                    setSelectedHost(hostData[0].id);
                }

                const propertiesData = propertiesResponse?.data?.data ?? propertiesResponse?.data ?? [];
                const channelsData = channelsResponse?.data?.data ?? channelsResponse?.data ?? [];
                const statusNames = bookingStatuses.map(s => s.name);

                setProperties(propertiesData);
                setChannels(channelsData);
                setAllBookingStatuses(statusNames);
                setSelectedStatuses(statusNames);

                if (propertiesData.length > 0) setSelectedProperty('all');
                if (channelsData.length > 0) setSelectedChannels(channelsData.map(ch => ch.name));
            } catch (error) {
                toast({ title: "Error fetching initial data", description: error.message });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [toast]);

    // Calendar data fetch
    useEffect(() => {
        const fetchCalendarData = async () => {
            if (!selectedProperty || !date.from || !date.to || isBefore(date.to, date.from)) return;
            setCalendarLoading(true);
            try {
                const startDate = format(date.from, 'yyyy-MM-dd');
                const endDate = format(date.to, 'yyyy-MM-dd');
                const statusIds = selectedStatuses.map(name => bookingStatuses.find(s => s.name === name)?.id).filter(Boolean);
                const channelIds = selectedChannels.map(name => channels.find(c => c.name === name)?.id).filter(Boolean);

                let url = `multi-calendar?start_date=${startDate}&end_date=${endDate}&statuses=${statusIds.join(',')}&channels=${channelIds.join(',')}`;
                if (selectedProperty === 'all') {
                    const allIds = properties.map(p => p.id).join(',');
                    if (allIds) url += `&property_id=${allIds}`;
                } else {
                    url += `&property_id=${selectedProperty}`;
                }

                const response = await api.get(url);
                const fetched = response ?? [];
                setRoomTypes(fetched);
                setExpandedRoomTypes(fetched.map(rt => rt.id));

                // Extract availability status overrides from the response
                const overrides = {};
                fetched.forEach(rt => {
                    const rtIdRaw = rt.id?.toString()?.replace('room-type-', '');
                    Object.entries(rt.dates || {}).forEach(([dateStr, dateData]) => {
                        if (dateData.availability_status && dateData.availability_status !== 'open') {
                            overrides[`${rtIdRaw}_${dateStr}`] = dateData.availability_status;
                        }
                    });
                });
                setAvailabilityOverrides(overrides);
            } catch (error) {
                toast({ variant: "destructive", title: "Failed to load calendar", description: error.message });
                setRoomTypes([]);
            } finally {
                setCalendarLoading(false);
            }
        };
        fetchCalendarData();
    }, [selectedProperty, date, selectedStatuses, selectedChannels, refreshTrigger, toast, properties, channels]);

    const handleCellClick = useCallback(({ day, dayStr, unit, roomTypeId }) => {
        // Resolve clean roomTypeId string
        const cleanRtId = roomTypeId?.toString()?.replace('room-type-', '');
        
        // Find the room type data in roomTypes state
        const rtData = roomTypes.find(rt => rt.id?.toString()?.replace('room-type-', '') === cleanRtId);
        
        // Get the rate for this date
        const dayData = rtData?.dates?.[dayStr];
        const defaultRate = dayData?.rates?.default;
        const currentPrice = defaultRate ? parseFloat(defaultRate.replace(/[^0-9.]/g, '')) : '';

        // Get the availability status override for this date
        const availKey = `${cleanRtId}_${dayStr}`;
        const currentStatus = availabilityOverrides[availKey] || 'open';

        setActiveCellInfo({
            day,
            dayStr,
            unit,
            roomTypeId: cleanRtId,
            currentPrice,
            currentStatus
        });
        setCellSheetOpen(true);
    }, [roomTypes, availabilityOverrides]);

    const handleCellSaved = useCallback((type, data) => {
        if (type === 'availability') {
            // Persist override locally for immediate visual
            setAvailabilityOverrides(prev => {
                const next = { ...prev };
                let d = data.from;
                while (!isAfter(d, data.to)) {
                    next[`${data.roomTypeId}_${format(d, 'yyyy-MM-dd')}`] = data.status;
                    d = new Date(d.getTime() + 86400000);
                }
                return next;
            });
        }
        // Sync calendar in background
        setRefreshTrigger(prev => !prev);
    }, []);

    const goToPreviousMonth = () => { const nf = subMonths(date.from, 1); setDate({ from: nf, to: endOfMonth(addMonths(nf, 1)) }); };
    const goToNextMonth = () => { const nf = addMonths(date.from, 1); setDate({ from: nf, to: endOfMonth(addMonths(nf, 1)) }); };
    const goToToday = () => { const nf = startOfMonth(new Date()); setDate({ from: nf, to: endOfMonth(addMonths(nf, 1)) }); };

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 h-screen">
                <Skeleton className="h-40 w-full flex-shrink-0" />
                <Skeleton className="h-20 w-full flex-shrink-0" />
                <Skeleton className="flex-grow h-96 w-full" />
            </div>
        );
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
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {(properties || []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {(channels || []).map(channel => (
                            <div key={channel.id} className="flex items-center gap-2">
                                <Checkbox id={`ch-${channel.id}`} checked={selectedChannels.includes(channel.name)} onCheckedChange={() => setSelectedChannels(prev => prev.includes(channel.name) ? prev.filter(c => c !== channel.name) : [...prev, channel.name])} />
                                <label htmlFor={`ch-${channel.id}`} className="text-sm font-medium">{channel.name}</label>
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
                                    <span>{statusName}</span>
                                    <button onClick={() => setSelectedStatuses(prev => prev.filter(s => s !== statusName))} className="opacity-75 hover:opacity-100"><X className="h-3 w-3" /></button>
                                </div>
                            );
                        })}
                    </div>
                    <Button type="button" variant="outline" onClick={() => setSelectedStatuses(allBookingStatuses)}>Reset</Button>
                </div>

                {/* Availability Legend */}
                <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Availability Colors</p>
                    <div className="flex flex-wrap gap-3">
                        {AVAILABILITY_STATUSES.map(s => (
                            <div key={s.key} className="flex items-center gap-1.5">
                                <span className={`inline-block w-3 h-3 rounded-sm ${s.color}`} />
                                <span className="text-xs text-muted-foreground">{s.icon} {s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons & Date Navigation */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button type="button" variant="outline" onClick={() => setRefreshTrigger(prev => !prev)} disabled={calendarLoading}>
                        {calendarLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Refresh
                    </Button>
                    <p className="text-xs text-muted-foreground hidden md:block">💡 Click any empty cell to update price or availability</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" id="date" variant="outline" className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                        </PopoverContent>
                    </Popover>
                    <Button type="button" variant="outline" size="icon" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></Button>
                    <Button type="button" variant="outline" onClick={goToToday}>Today</Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-grow min-h-0 relative">
                {calendarLoading && roomTypes.length === 0 && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-40">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    </div>
                )}
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
                                            <div className="flex items-center pl-4">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedRoomTypes(prev => prev.includes(roomType.id) ? prev.filter(id => id !== roomType.id) : [...prev, roomType.id])}>
                                                    {expandedRoomTypes.includes(roomType.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                                {roomType.name}
                                            </div>
                                        </td>
                                        {daysInRange.map(day => {
                                            const dayStr = format(day, 'yyyy-MM-dd');
                                            const dayData = roomType.dates ? roomType.dates[dayStr] : null;
                                            const rtIdRaw = roomType.id?.toString()?.replace('room-type-', '');
                                            const availKey = `${rtIdRaw}_${dayStr}`;
                                            const ov = availabilityOverrides[availKey];
                                            const ovDef = ov ? AVAILABILITY_STATUSES.find(s => s.key === ov) : null;
                                            return (
                                                <td
                                                    key={dayStr}
                                                    className={cn("p-2 border-r text-sm align-top w-[120px] min-w-[120px] h-full cursor-pointer group hover:bg-primary/5 transition-colors", ovDef && ovDef.key !== 'open' ? availCellStyles[ovDef.key] : '')}
                                                    onClick={() => handleCellClick({ day, dayStr, unit: { name: roomType.name, id: roomType.id }, roomTypeId: roomType.id })}
                                                    title={ovDef ? `${ovDef.label}: Click to change` : 'Click to set price or availability'}
                                                >
                                                    {ovDef && ovDef.key !== 'open' ? (
                                                        <div className="text-center text-[10px] font-semibold">{ovDef.icon}</div>
                                                    ) : (
                                                        <>
                                                            <div className="font-bold text-center">{dayData?.inventory || 'N/A'}</div>
                                                            {dayData?.rates && Object.entries(dayData.rates).slice(0, 2).map(([key, value]) => (
                                                                <div key={key} className="text-center text-xs text-gray-700 dark:text-gray-300">{value}</div>
                                                            ))}
                                                            {dayData?.rates && Object.keys(dayData.rates).length > 2 && (
                                                                <div className="text-center text-xs text-red-500">+{Object.keys(dayData.rates).length - 2} more</div>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {expandedRoomTypes.includes(roomType.id) && (roomType.units || []).map(unit => (
                                        <UnitRow
                                            key={unit.id}
                                            unit={unit}
                                            daysInRange={daysInRange}
                                            selectedStatuses={selectedStatuses}
                                            onBookingClick={setSelectedBooking}
                                            onCellClick={handleCellClick}
                                            availabilityOverrides={availabilityOverrides}
                                            roomTypeId={roomType.id?.toString()?.replace('room-type-', '')}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Detail Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>Confirmation Code: {selectedBooking?.confirmation_code}</DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="grid gap-4 py-4 text-sm">
                            <div className="grid grid-cols-2"><span className="text-muted-foreground">Guest Name:</span><span className="font-medium">{selectedBooking.guest?.first_name} {selectedBooking.guest?.last_name}</span></div>
                            <div className="grid grid-cols-2"><span className="text-muted-foreground">Stay Dates:</span><span className="font-medium">{selectedBooking.check_in_date} → {selectedBooking.check_out_date}</span></div>
                            <div className="grid grid-cols-2"><span className="text-muted-foreground">Total Amount:</span><span className="font-semibold text-green-600">MYR {Number(selectedBooking.total_amount).toFixed(2)}</span></div>
                            <div className="grid grid-cols-2"><span className="text-muted-foreground">Status:</span><Badge variant="outline">{bookingStatuses.find(s => s.id === selectedBooking.status)?.name || 'N/A'}</Badge></div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
                        {selectedBooking && <Link href={`/dashboard/booking/${selectedBooking.id}/edit`} passHref><Button>Edit Booking</Button></Link>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cell Action Sheet */}
            <CellActionSheet
                open={cellSheetOpen}
                onClose={() => { setCellSheetOpen(false); setActiveCellInfo(null); }}
                cellInfo={activeCellInfo}
                onSaved={handleCellSaved}
            />
        </div>
    );
}