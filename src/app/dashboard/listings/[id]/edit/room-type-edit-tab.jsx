
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RoomTypeForm } from "@/app/dashboard/listings/[id]/room-types/room-type-form";
import { PhotoGallery } from "@/app/dashboard/room-types/[roomTypeId]/photo-gallery";
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"

// Schema needs to be here to be used by the form hook in this component
const roomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_adults: z.coerce.number().min(1, "Max adults must be at least 1."),
  max_children: z.coerce.number().min(0).optional().nullable(),
  size: z.string().optional().nullable(),
  weekday_price: z.coerce.number().min(0).optional().nullable(),
  weekend_price: z.coerce.number().min(0).optional().nullable(),
  status: z.boolean().default(true),
  amenity_ids: z.array(z.number()).optional(),
});


export function RoomTypeEditTab({ roomTypeId, propertyId, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // The form hook is now in the parent tab component
    const form = useForm({
        resolver: zodResolver(roomTypeSchema),
        defaultValues: {
            name: "",
            max_adults: 2,
            max_children: 0,
            size: '',
            weekday_price: 100,
            weekend_price: 120,
            status: true,
            amenity_ids: [],
        },
    });

    async function onSubmit(values) {
        setIsSubmitting(true);
        const payload = {
            ...values,
            status: values.status ? 1 : 0,
        };
        
        try {
            await api.put(`room-types/${roomTypeId}`, payload);
            toast({
                title: "Room Type Updated",
                description: `The room type has been successfully updated.`,
            });
            if (onUpdate) onUpdate();
        } catch (error) {
           toast({
            variant: "destructive",
            title: "An error occurred",
            description: error.message || "Something went wrong.",
          });
        } finally {
          setIsSubmitting(false);
        }
    }


    if (!roomTypeId) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">This unit is not associated with a room type.</p>
                </CardContent>
            </Card>
        )
    }

    return (
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    {/* Pass the form down to the details component */}
                    <RoomTypeForm 
                        form={form} // Pass the form instance
                        isEditMode
                        roomTypeId={roomTypeId}
                        propertyId={propertyId}
                        onSuccess={onUpdate}
                    />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <PhotoGallery roomTypeId={roomTypeId} />
                </CardContent>
            </Card>
             <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/listings')}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update
                </Button>
            </div>
        </form>
    )
}
