
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { guestApi } from "@/services/guest-api"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PropertyGrid({ searchParams }) {
    const [properties, setProperties] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            const queryParams = {};
            if (searchParams.location) queryParams.location = searchParams.location;
            if (searchParams.from) queryParams.check_in = searchParams.from.toISOString().split('T')[0];
            if (searchParams.to) queryParams.check_out = searchParams.to.toISOString().split('T')[0];
            if (searchParams.guests) queryParams.guests = searchParams.guests;

            const data = await guestApi.getProperties(queryParams);

            setProperties(data || [])
            setLoading(false)
        }
        fetch()
    }, [searchParams.location, searchParams.from, searchParams.to, searchParams.guests])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                ))}
            </div>
        )
    }

    if (properties.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-semibold">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
            ))}
        </div>
    )
}

function PropertyCard({ property }) {
    return (
        <Link href={`/p/${property.id}`} className="group cursor-pointer">
            <div className="flex flex-col gap-2">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                    <Image
                        src={property.photos && property.photos.length > 0 ? property.photos[0].photo_path : "https://picsum.photos/seed/prop/600/450"}
                        alt={property.name}
                        fill
                        className="object-cover transition group-hover:scale-105"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base truncate pr-2">{property.name}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase">{property.city}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{property.address_line_1}</p>
                    <div className="mt-1 flex items-center gap-1">
                        <span className="font-bold">{property.room_types?.length || 0}</span>
                        <span className="text-sm text-muted-foreground">room types available</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
