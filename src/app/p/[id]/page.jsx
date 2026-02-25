
"use client"

import * as React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { GuestLayout } from "@/components/guest/GuestLayout"
import { guestApi } from "@/services/guest-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Bed, Star, Share, Heart, Minus, Plus } from "lucide-react"
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
    const roomListRef = React.useRef(null)

    React.useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            const data = await guestApi.getPropertyDetails(id)
            setProperty(data)
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

                {/* Image Grid (Simplified for demo) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] overflow-hidden rounded-xl mb-8">
                    <div className="relative col-span-1 md:col-span-2 h-full">
                        <Image src={property.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"} fill className="object-cover" alt={property.name} />
                    </div>
                    <div className="hidden md:grid grid-rows-2 gap-2 col-span-1 h-full">
                        <div className="relative h-full"><Image src="https://picsum.photos/seed/1/400/300" fill className="object-cover" alt="room" /></div>
                        <div className="relative h-full"><Image src="https://picsum.photos/seed/2/400/300" fill className="object-cover" alt="room" /></div>
                    </div>
                    <div className="hidden md:grid grid-rows-2 gap-2 col-span-1 h-full">
                        <div className="relative h-full"><Image src="https://picsum.photos/seed/3/400/300" fill className="object-cover" alt="room" /></div>
                        <div className="relative h-full"><Image src="https://picsum.photos/seed/4/400/300" fill className="object-cover" alt="room" /></div>
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
                                    <RoomCard key={room.id} room={room} property={property} />
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
                                onClick={() => {
                                    if (!dateRange.from || !dateRange.to) {
                                        setShowDateError(true)
                                        return
                                    }
                                    setShowDateError(false)
                                    setIsChecking(true)
                                    // Simulate API check
                                    setTimeout(() => {
                                        setIsChecking(false)
                                        roomListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    }, 1500)
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
                            <p className="text-center text-[10px] text-muted-foreground">Demo: Checking mock availability for selected dates</p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    )
}

function RoomCard({ room, property }) {
    const { addToCart } = useBooking()
    const [isExpanded, setIsExpanded] = React.useState(false)

    return (
        <div className="border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition bg-background">
            <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-1/3 aspect-[4/3] sm:aspect-square">
                    <Image src={room.image || "https://picsum.photos/seed/room/400/300"} fill className="object-cover" alt={room.name} />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{room.name}</h3>
                            <span className="text-lg font-bold text-primary">${room.weekday_price} <span className="text-xs font-normal text-muted-foreground">night</span></span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1 border-r pr-4"><Users size={16} /> Up to {room.max_adults + room.max_children} guests</span>
                            <span className="flex items-center gap-1"><Bed size={16} /> 1 Bed</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {room.description || "Enjoy a comfortable and modern stay in our curated rooms designed for your satisfaction."}
                        </p>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm font-semibold underline mt-2 hover:text-primary transition-colors"
                        >
                            {isExpanded ? "Show less" : "Show room details"}
                        </button>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button className="px-8" onClick={() => addToCart(room, property)}>
                            Book now
                        </Button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t bg-muted/10 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm mb-3 underline">Room Description</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {room.description || "This room type offers a perfect blend of comfort and style. Equipped with modern amenities and high-quality furnishings, it ensures a relaxing stay for all types of travelers."}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-3 underline">Amenities</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">✓ High-speed WiFi</span>
                                <span className="flex items-center gap-1">✓ Air conditioning</span>
                                <span className="flex items-center gap-1">✓ Smart TV</span>
                                <span className="flex items-center gap-1">✓ Mini fridge</span>
                                <span className="flex items-center gap-1">✓ Coffee maker</span>
                                <span className="flex items-center gap-1">✓ Dedicated workspace</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
