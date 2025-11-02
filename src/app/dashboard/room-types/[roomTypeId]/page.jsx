
"use client"

import * as React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bed, Building, KeyRound, Pencil, Tag, Edit } from "lucide-react"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { PhotoGallery } from "@/components/photo-gallery"
import { Badge } from "@/components/ui/badge"

export default function RoomTypeDetailsPage({ params }) {
  const { roomTypeId } = params;
  const [roomType, setRoomType] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchRoomType = async () => {
      if (!roomTypeId) return;
      setLoading(true);
      try {
        const res = await api.get(`room-types/${roomTypeId}`);
        setRoomType(res.data);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch room type details." });
      } finally {
        setLoading(false);
      }
    };
    fetchRoomType();
  }, [roomTypeId, toast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {loading ? (
           <Skeleton className="h-10 w-10" />
        ) : (
          <Link href={roomType?.property?.id ? `/dashboard/listings/${roomType?.property.id}/room-types` : '/dashboard/room-types'} passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
        )}
        
        {loading ? (
             <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
             </div>
        ) : (
             <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Bed />
                    {roomType?.name}
                </h1>
                <p className="text-muted-foreground">Manage details for this room type.</p>
            </div>
        )}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Photo Gallery</CardTitle>
                        <CardDescription>Manage photos for this room type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PhotoGallery 
                            photoType="room_type" 
                            photoTypeId={roomTypeId}
                            hostingCompanyId={roomType?.hosting_company_id}
                        />
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Room Type Details</CardTitle>
                        <CardDescription>Key information about this room type.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {loading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-2/4" />
                                <Skeleton className="h-5 w-3/5" />
                                <Skeleton className="h-10 w-24 mt-2" />
                             </div>
                        ) : (
                            <>
                                {roomType.property && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4" /> Property</span>
                                        <Link href={`/dashboard/properties/${roomType.property.id}/edit`} className="font-medium hover:underline">
                                            {roomType.property.name}
                                        </Link>
                                    </div>
                                )}
                                 <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground flex items-center gap-2"><Tag className="h-4 w-4" /> Max Guests</span>
                                    <Badge variant="secondary">{(roomType.max_adults || 0) + (roomType.max_children || 0)}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground flex items-center gap-2"><KeyRound className="h-4 w-4" /> Units</span>
                                    <Badge variant="outline">{roomType.units_count}</Badge>
                                </div>
                                <div className="flex pt-4 gap-2">
                                     <Link href={`/dashboard/room-types/${roomTypeId}/edit`} passHref>
                                        <Button>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Details
                                        </Button>
                                    </Link>
                                    {roomType.property && (
                                        <Link href={`/dashboard/listings/${roomType.property.id}/room-types/${roomTypeId}/units`} passHref>
                                            <Button variant="outline">
                                                Manage Units
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
       </div>

    </div>
  )
}
