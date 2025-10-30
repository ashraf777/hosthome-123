
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
import { ArrowLeft, PlusCircle, Bed, Link as LinkIcon } from "lucide-react"
import { RoomTypeList } from "./room-type-list"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { AssignRoomTypeDialog } from "./assign-room-type-dialog"

export default function RoomTypesPage({ params }) {
  const propertyId = params.id;
  const [property, setProperty] = React.useState(null);
  const [assignedRoomTypes, setAssignedRoomTypes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAssignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchPropertyWithRoomTypes = React.useCallback(async () => {
    // setLoading(true); // Don't show loading skeleton on re-fetch
    try {
        const res = await api.get(`properties/${propertyId}`);
        setProperty(res.data);
        setAssignedRoomTypes(res.data.room_types || []);
    } catch (error) {
        console.error("Failed to fetch property details", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch property and room type data.",
        })
    } finally {
        setLoading(false);
    }
  }, [propertyId, toast]);

  React.useEffect(() => {
    fetchPropertyWithRoomTypes();
  }, [fetchPropertyWithRoomTypes]);

  const assignedRoomTypeIds = React.useMemo(() => {
    return assignedRoomTypes.map(rt => rt.id);
  }, [assignedRoomTypes]);

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/properties" passHref>
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
                <p className="text-muted-foreground">Manage room types associated with this property.</p>
            </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bed />
                Assigned Room Types
              </CardTitle>
              <CardDescription>
                Create, assign, and manage room types for this property.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={() => setAssignDialogOpen(true)}>
                    <LinkIcon className="mr-2" />
                    Assign Existing
                </Button>
                <Link href={`/dashboard/listings/${propertyId}/room-types/new`}>
                    <Button>
                        <PlusCircle className="mr-2" />
                        Create New Room Type
                    </Button>
                </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <RoomTypeList 
                propertyId={propertyId} 
                assignedRoomTypes={assignedRoomTypes}
                loading={loading}
                onUpdate={fetchPropertyWithRoomTypes}
            />
        </CardContent>
      </Card>
    </div>
    <AssignRoomTypeDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        propertyId={propertyId}
        assignedRoomTypeIds={assignedRoomTypeIds}
        onAssignSuccess={fetchPropertyWithRoomTypes}
      />
    </>
  )
}
