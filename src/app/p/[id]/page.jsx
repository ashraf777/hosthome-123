
"use client"

import * as React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { GuestLayout } from "@/components/guest/GuestLayout"
import { guestApi } from "@/services/guest-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Bed, Star, Share, Heart } from "lucide-react"
import { useBooking } from "@/providers/booking-provider"

export default function PropertyDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [property, setProperty] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

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
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 underline">
                            <Share size={16} /> Share
                        </Button>
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 underline">
                            <Heart size={16} /> Save
                        </Button>
                    </div>
                </div>

                {/* Image Grid (Simplified for demo) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] overflow-hidden rounded-xl mb-8">
                    <div className="relative col-span-1 md:col-span-2 h-full">
                        <Image src={property.image} fill className="object-cover" alt={property.name} />
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

                        <div>
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
                                <span className="text-2xl font-bold">${property.price_per_night || 200} <span className="text-base font-normal text-muted-foreground">night</span></span>
                                {/* <span className="text-sm font-semibold underline hover:text-primary cursor-pointer">24 reviews</span> */}
                            </div>
                            <div className="border rounded-lg overflow-hidden grid grid-cols-2">
                                <div className="border-r border-b p-3 flex flex-col cursor-pointer hover:bg-muted/30">
                                    <span className="text-[10px] font-bold uppercase">Check-in</span>
                                    <span className="text-sm">Add date</span>
                                </div>
                                <div className="border-b p-3 flex flex-col cursor-pointer hover:bg-muted/30">
                                    <span className="text-[10px] font-bold uppercase">Check-out</span>
                                    <span className="text-sm">Add date</span>
                                </div>
                                <div className="col-span-2 p-3 flex flex-col cursor-pointer hover:bg-muted/30">
                                    <span className="text-[10px] font-bold uppercase">Guests</span>
                                    <span className="text-sm">1 guest</span>
                                </div>
                            </div>
                            <Button className="w-full py-6 text-lg font-bold" onClick={() => {
                                if (property.room_types?.[0]) {
                                    addToCart(property.room_types[0], property)
                                } else {
                                    alert("Please select a room below.")
                                }
                            }}>Check Availability</Button>
                            <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    )
}

function RoomCard({ room, property }) {
    const { addToCart } = useBooking()

    return (
        <div className="border rounded-xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition">
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
                </div>
                <div className="mt-6 flex justify-end">
                    <Button className="px-8" onClick={() => addToCart(room, property)}>
                        Book now
                    </Button>
                </div>
            </div>
        </div>
    )
}
