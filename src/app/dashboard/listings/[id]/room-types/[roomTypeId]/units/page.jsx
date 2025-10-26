
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
import { ArrowLeft, PlusCircle, KeyRound } from "lucide-react"
import { UnitList } from "./unit-list"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function UnitsPage({ params }) {
  const { id: propertyId, roomTypeId } = params;
  const [roomType, setRoomType] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRoomType = async () => {
        try {
            const res = await api.get(`room-types/${roomTypeId}`);
            setRoomType(res.data);
        } catch (error) {
            console.error("Failed to fetch room type details", error);
        } finally {
            setLoading(false);
        }
    }
    fetchRoomType();
  }, [roomTypeId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/listings/${propertyId}/room-types`} passHref>
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
                    Units for: {roomType?.name}
                </h1>
                <p className="text-muted-foreground">Manage individual units for this room type.</p>
            </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound />
                Property Units
              </CardTitle>
              <CardDescription>
                Define the individual, bookable units for this room type.
              </CardDescription>
            </div>
            <Link href={`/dashboard/listings/${propertyId}/room-types/${roomTypeId}/units/new`}>
                <Button>
                <PlusCircle className="mr-2" />
                Create Unit
                </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
            <UnitList roomTypeId={roomTypeId} />
        </CardContent>
      </Card>
    </div>
  )
}
