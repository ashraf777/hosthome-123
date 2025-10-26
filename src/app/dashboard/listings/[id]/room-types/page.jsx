
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
import { ArrowLeft, PlusCircle, Bed } from "lucide-react"
import { RoomTypeList } from "./room-type-list"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function RoomTypesPage({ params }) {
  const propertyId = params.id;
  const [property, setProperty] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProperty = async () => {
        try {
            const res = await api.get(`properties/${propertyId}`);
            setProperty(res.data);
        } catch (error) {
            console.error("Failed to fetch property details", error);
        } finally {
            setLoading(false);
        }
    }
    fetchProperty();
  }, [propertyId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        {loading ? (
             <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
             </div>
        ) : (
             <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Room Types for: {property?.name}
                </h1>
                <p className="text-muted-foreground">Manage room types for this property.</p>
            </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bed />
                Room Types
              </CardTitle>
              <CardDescription>
                Define the different types of rooms available at this property.
              </CardDescription>
            </div>
            <Link href={`/dashboard/listings/${propertyId}/room-types/new`}>
                <Button>
                <PlusCircle className="mr-2" />
                Create Room Type
                </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
            <RoomTypeList propertyId={propertyId} />
        </CardContent>
      </Card>
    </div>
  )
}
