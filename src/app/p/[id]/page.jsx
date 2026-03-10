
"use client"

import * as React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { GuestLayout } from "@/components/guest/GuestLayout"
import { guestApi } from "@/services/guest-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Bed, Star, Share, Heart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useBooking } from "@/providers/booking-provider"
import { format } from "date-fns"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export default function PropertyDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { addToCart } = useBooking()
    const [property, setProperty] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [dateRange, setDateRange] = React.useState({ from: null, to: null })
    const [guests, setGuests] = React.useState(1)
    const [isChecking, setIsChecking] = React.useState(false)
    const [showDateError, setShowDateError] = React.useState(false)
    const [availabilityMap, setAvailabilityMap] = React.useState(null)
    const roomListRef = React.useRef(null)

    const [allPhotos, setAllPhotos] = React.useState([])

    React.useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            const data = await guestApi.getPropertyDetails(id)
            if (data) {
                setProperty(data)

                // Aggregate all photos from property, rooms, and units
                let aggregatedPhotos = [...(data.photos || [])];
                if (data.room_types) {
                    data.room_types.forEach(rt => {
                        aggregatedPhotos = [...aggregatedPhotos, ...(rt.photos || [])];
                        if (rt.units) {
                            rt.units.forEach(u => {
                                aggregatedPhotos = [...aggregatedPhotos, ...(u.photos || [])];
                            });
                        }
                    });
                }

                // Remove duplicates by ID if same photo added multiple times, or just keep all
                setAllPhotos(aggregatedPhotos);
            }
            setLoading(false)
        }
        fetch()
    }, [id])

    if (loading) {
        return (
            <GuestLayout>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-10 w-2/3 mb-4" />
                    <div className="grid grid-cols-4 gap-4 h-[400px]">
                        <Skeleton className="col-span-2 h-full rounded-l-xl" />
                        <div className="grid grid-rows-2 gap-4 col-span-1">
                            <Skeleton className="h-full" />
                            <Skeleton className="h-full" />
                        </div>
                        <div className="grid grid-rows-2 gap-4 col-span-1">
                            <Skeleton className="h-full rounded-tr-xl" />
                            <Skeleton className="h-full rounded-br-xl" />
                        </div>
                    </div>
                </div>
            </GuestLayout>
        )
    }

    if (!property) {
        return (
            <GuestLayout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold">Property not found</h1>
                    <Button onClick={() => router.push('/')} className="mt-4">Go Back Home</Button>
                </div>
            </GuestLayout>
        )
    }

    return (
        <GuestLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Title and Actions */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{property.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm font-semibold underline">
                            {/* <span className="flex items-center gap-1"><Star size={16} /> 5.0 · 24 reviews</span> */}
                            <span className="flex items-center gap-1"><MapPin size={16} /> {property.city}, Malaysia</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {/* <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 underline">
                            <Share size={16} /> Share
                        </Button>
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 underline">
                            <Heart size={16} /> Save
                        </Button> */}
                    </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] overflow-hidden rounded-xl mb-8">
                    <div className="relative col-span-1 md:col-span-2 h-full bg-muted flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                        {allPhotos[0] ? <Image src={allPhotos[0].photo_path} fill className="object-cover" alt={property.name} /> : (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <span className="text-4xl md:text-6xl font-black text-primary/20 tracking-widest uppercase rotate-[-20deg] select-none">
                                    HostHome
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:grid grid-rows-2 gap-2 col-span-1 h-full">
                        <div className="relative h-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {allPhotos[1] && <Image src={allPhotos[1].photo_path} fill className="object-cover" alt="Property Image 2" />}
                        </div>
                        <div className="relative h-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {allPhotos[2] && <Image src={allPhotos[2].photo_path} fill className="object-cover" alt="Property Image 3" />}
                        </div>
                    </div>
                    <div className="hidden md:grid grid-rows-2 gap-2 col-span-1 h-full">
                        <div className="relative h-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {allPhotos[3] && <Image src={allPhotos[3].photo_path} fill className="object-cover" alt="Property Image 4" />}
                        </div>
                        <div className="relative h-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {allPhotos[4] && <Image src={allPhotos[4].photo_path} fill className="object-cover" alt="Property Image 5" />}
                        </div>
                    </div>
                </div>

                {/* Content Tabs (Room List) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <div className="border-b pb-8 mb-8">
                            <h2 className="text-xl font-bold mb-4">About this place</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Experience the best of {property.city} in this beautiful accommodation.
                                Whether you're here for business or leisure, our property offers
                                everything you need for a comfortable stay.
                            </p>
                        </div>

                        <div ref={roomListRef}>
                            <h2 className="text-xl font-bold mb-6">Choose your rooms</h2>
                            <div className="flex flex-col gap-6">
                                {property.room_types?.map((room) => (
                                    <RoomCard key={room.id} room={room} property={property} dateRange={dateRange} availabilityMap={availabilityMap} />
                                ))}
                                {(!property.room_types || property.room_types.length === 0) && (
                                    <p className="text-muted-foreground italic">No specific room types listed for this property.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Sidebar Reservation (Simplified) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-28 border rounded-xl p-6 shadow-xl space-y-4">
                            <div className="flex justify-between items-baseline">
                                {/* <span className="text-2xl font-bold">${property.price_per_night || 200} <span className="text-base font-normal text-muted-foreground">night</span></span> */}
                                {/* <span className="text-sm font-semibold underline hover:text-primary cursor-pointer">24 reviews</span> */}
                            </div>
                            <div className="border rounded-lg overflow-hidden grid grid-cols-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="border-r border-b p-3 flex flex-col cursor-pointer hover:bg-muted/30">
                                            <span className="text-[10px] font-bold uppercase">Check-in</span>
                                            <span className="text-sm truncate">
                                                {dateRange.from ? format(dateRange.from, "MM/dd/yyyy") : "Add date"}
                                            </span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <CalendarComponent
                                            initialFocus
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                            disabled={{ before: new Date() }}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="border-b p-3 flex flex-col cursor-pointer hover:bg-muted/30">
                                            <span className="text-[10px] font-bold uppercase">Check-out</span>
                                            <span className="text-sm truncate">
                                                {dateRange.to ? format(dateRange.to, "MM/dd/yyyy") : "Add date"}
                                            </span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <CalendarComponent
                                            initialFocus
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                            disabled={{ before: new Date() }}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className="col-span-2 p-3 flex flex-col cursor-pointer hover:bg-muted/30">
                                            <span className="text-[10px] font-bold uppercase">Guests</span>
                                            <span className="text-sm">
                                                {guests} guest{guests > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-4" align="end">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">Guests</span>
                                                <span className="text-xs text-muted-foreground">Total number of guests</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                                <span className="w-4 text-center font-medium">{guests}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => setGuests(guests + 1)}
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button
                                className="w-full py-6 text-lg font-bold"
                                disabled={isChecking}
                                onClick={async () => {
                                    if (!dateRange.from || !dateRange.to) {
                                        setShowDateError(true)
                                        return
                                    }
                                    setShowDateError(false)
                                    setIsChecking(true)
                                    try {
                                        const res = await guestApi.checkAvailability({
                                            property_id: id,
                                            check_in: format(dateRange.from, 'yyyy-MM-dd'),
                                            check_out: format(dateRange.to, 'yyyy-MM-dd'),
                                            guests: guests
                                        })

                                        // create a map of room_type_id -> available_units
                                        const mapping = {}
                                        if (res.room_types) {
                                            res.room_types.forEach(rt => {
                                                mapping[rt.room_type_id] = rt.available_units
                                            })
                                        }
                                        setAvailabilityMap(mapping)

                                        // scroll to rooms after a short delay for UX
                                        setTimeout(() => {
                                            roomListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }, 100)
                                    } catch (err) {
                                        console.error(err)
                                        // Optional: show a toast error
                                    } finally {
                                        setIsChecking(false)
                                    }
                                }}
                            >
                                {isChecking ? "Checking..." : "Check Availability"}
                            </Button>
                            {showDateError && (
                                <p className="text-center text-xs text-destructive font-semibold animate-bounce">
                                    Please select check-in and check-out dates
                                </p>
                            )}
                            {isChecking && (
                                <p className="text-center text-xs text-primary animate-pulse font-medium">
                                    Searching for available rooms...
                                </p>
                            )}
                            {availabilityMap !== null && (
                                <p className="text-center text-xs text-green-600 font-semibold mt-2">
                                    Availability updated! Scroll down to select your room.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    )
}

function RoomCard({ room, property, dateRange, availabilityMap }) {
    const { cart, addToCart } = useBooking()
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    // Status Logic
    const hasChecked = availabilityMap !== null
    const availableUnits = hasChecked ? (availabilityMap[room.id] || 0) : 0
    const isAvailable = hasChecked && availableUnits > 0

    // Aggregate photos for the slider
    const sliderPhotos = React.useMemo(() => {
        let photos = [...(room.photos || [])];
        if (room.units && Array.isArray(room.units)) {
            room.units.forEach(u => {
                photos = [...photos, ...(u.photos || [])];
            });
        }
        return photos.slice(0, 5); // Limit to 5
    }, [room]);

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % sliderPhotos.length);
    }

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + sliderPhotos.length) % sliderPhotos.length);
    }

    // Merge amenities
    const allAmenities = React.useMemo(() => {
        const propAmenities = property?.amenities || [];
        const roomAmenities = room?.amenities || [];
        // deduplicate by name
        const combined = [...propAmenities, ...roomAmenities];
        const unique = [];
        const seen = new Set();
        for (const a of combined) {
            const name = a.amenity_reference?.name || a.specific_name;
            if (name && !seen.has(name)) {
                seen.add(name);
                unique.push({ ...a, display_name: name });
            }
        }
        return unique;
    }, [property, room]);

    const sampleUnit = room.units && room.units.length > 0 ? room.units[0] : null;

    return (
        <div className="border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition bg-background">
            <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-1/3 aspect-[4/3] sm:aspect-square bg-muted flex items-center justify-center font-bold text-muted-foreground rounded-l-xl sm:rounded-l-xl sm:rounded-r-none overflow-hidden group">
                    {sliderPhotos.length > 0 ? (
                        <>
                            <Image src={sliderPhotos[currentImageIndex].photo_path} fill className="object-cover" alt={`${room.name} image ${currentImageIndex + 1}`} />

                            {/* Slider Controls */}
                            {sliderPhotos.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={20} />
                                    </button>

                                    {/* Dots */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                        {sliderPhotos.map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center overflow-hidden">
                            <span className="text-2xl md:text-3xl font-black text-primary/20 tracking-widest uppercase rotate-[-20deg] select-none">
                                HostHome
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{room.name}</h3>
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-bold text-primary text-right">
                                    ${room.weekday_price} <span className="text-[10px] md:text-xs font-normal text-muted-foreground whitespace-nowrap">/ night (Sun-Thu)</span>
                                </span>
                                {room.weekend_price && room.weekend_price !== room.weekday_price && (
                                    <span className="text-sm font-semibold text-primary/80 text-right mt-[-4px]">
                                        ${room.weekend_price} <span className="text-[10px] md:text-xs font-normal text-muted-foreground whitespace-nowrap">/ night (Fri-Sat)</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1 border-r pr-4"><Users size={16} /> Up to {room.max_adults + room.max_children} guests</span>
                            <span className="flex items-center gap-1"><Bed size={16} /> 1 Bed</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {room.description || sampleUnit?.description || "Enjoy a comfortable and modern stay in our curated rooms designed for your satisfaction."}
                        </p>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm font-bold underline mt-2 self-start"
                        >
                            {isExpanded ? "Hide details" : "Show room details"}
                        </button>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        {hasChecked ? (
                            isAvailable ? (
                                <Button className="w-full" onClick={() => addToCart(room, property, dateRange)}>
                                    Book
                                    {/* ({availableUnits} left) */}
                                </Button>
                            ) : (
                                <Button className="w-full" disabled variant="secondary">
                                    Sold Out
                                </Button>
                            )
                        ) : (
                            <Button className="w-full" disabled variant="outline">
                                Check Availability First
                            </Button>
                        )}

                        {cart.find(c => c.id === room.id) && (
                            <p className="text-xs text-center text-primary font-bold fade-in animate-in">Added to selection</p>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-sm mb-3 underline">Room Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {room.description || sampleUnit?.description || "This room type offers a perfect blend of comfort and style. Equipped with modern amenities and high-quality furnishings, it ensures a relaxing stay for all types of travelers."}
                                </p>
                            </div>

                            {room.room_setup && room.room_setup.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3 underline">Room Setup</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {room.room_setup.map((setup, idx) => (
                                            <li key={idx} className="capitalize">
                                                {setup.bed_type?.replace(/_/g, ' ')} {setup.count ? `x ${setup.count}` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {sampleUnit && sampleUnit.about && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3 underline">About this unit</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {sampleUnit.about}
                                    </p>
                                </div>
                            )}

                            {sampleUnit && sampleUnit.guest_access && (
                                <div>
                                    <h4 className="font-bold text-sm mb-3 underline">Guest Access</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {sampleUnit.guest_access}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-3 underline">Amenities</h4>
                            {allAmenities.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    {allAmenities.map((amenity, idx) => (
                                        <span key={idx} className="flex items-center gap-1">
                                            ✓ {amenity.display_name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No amenities listed.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
