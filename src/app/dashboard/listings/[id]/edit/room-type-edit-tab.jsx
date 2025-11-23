
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RoomTypeForm } from "@/app/dashboard/listings/[id]/room-types/room-type-form";
import { PhotoGallery } from "@/components/photo-gallery";
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import RoomSetupForm from "../../../room-types/room-setup-form";
import { FormField, Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton"

const roomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_adults: z.coerce.number().min(1, "Max adults must be at least 1."),
  max_children: z.coerce.number().min(0).optional().nullable(),
  size: z.string().optional().nullable(),
  weekday_price: z.coerce.number().min(0).optional().nullable(),
  weekend_price: z.coerce.number().min(0).optional().nullable(),
  status: z.boolean().default(true),
  amenity_ids: z.array(z.number()).optional(),
  room_setup: z.object({
    livingRooms: z.number().min(0),
    bathrooms: z.number().min(1),
    rooms: z.array(z.object({
      name: z.string(),
      beds: z.record(z.string(), z.number())
    }))
  }).optional(),
});


export function RoomTypeEditTab({ roomTypeId, propertyId, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [roomTypeData, setRoomTypeData] = React.useState(null);
    const [allAmenities, setAllAmenities] = React.useState({});
    const { toast } = useToast();
    const router = useRouter();

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
            room_setup: {
                livingRooms: 1,
                bathrooms: 1,
                rooms: [{ name: 'Room 1', beds: { 'Queen Bed': 1 } }]
            }
        },
    });

    React.useEffect(() => {
        const fetchAllData = async () => {
            if (!roomTypeId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [amenitiesRes, roomTypeRes] = await Promise.all([
                    api.get('amenities'),
                    api.get(`room-types/${roomTypeId}`),
                ]);

                // Process amenities
                const amenitiesList = amenitiesRes.data || amenitiesRes;
                if (Array.isArray(amenitiesList)) {
                    const filteredAmenities = amenitiesList.filter(amenity => 
                        (amenity.type === 2 || amenity.type === 3) &&
                        (amenity.amenity_reference?.type === 2 || amenity.amenity_reference?.type === 3)
                    );
                    const groupedAmenities = filteredAmenities.reduce((acc, amenity) => {
                        const category = amenity.amenity_reference?.name || 'General';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push({ id: amenity.id, name: amenity.specific_name });
                        return acc;
                    }, {});
                    setAllAmenities(groupedAmenities);
                }

                // Process room type data and reset the form
                const data = roomTypeRes.data.data || roomTypeRes.data;
                setRoomTypeData(data); 

                if (data) {
                    const currentAmenities = data.amenities?.map(a => a.id) || [];
                    form.reset({
                        ...data,
                        status: data.status === 1 || data.status === true,
                        amenity_ids: currentAmenities,
                        room_setup: data.room_setup || { livingRooms: 1, bathrooms: 1, rooms: [{ name: 'Room 1', beds: {} }] }
                    });
                }
            } catch(error) {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch room type details." });
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [roomTypeId, form, toast]);

    async function onSubmit(values) {
        setIsSubmitting(true);
        const payload = {
            ...values,
            status: values.status ? 1 : 0,
        };
        
        try {
            await api.put(`room-types/${roomTypeId}`, payload);
            
            if (values.amenity_ids) {
                await api.post(`room-types/${roomTypeId}/amenities`, {
                    amenity_ids: values.amenity_ids,
                    hosting_company_id: roomTypeData?.hosting_company_id,
                });
            }

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

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <RoomTypeForm 
                            form={form}
                            allAmenities={allAmenities}
                        />
                    </CardContent>
                </Card>

                <FormField
                    control={form.control}
                    name="room_setup"
                    render={({ field }) => (
                    <RoomSetupForm
                        livingRooms={field.value?.livingRooms}
                        bathrooms={field.value?.bathrooms}
                        rooms={field.value?.rooms}
                        onChange={field.onChange}
                    />
                    )}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Room Type Photos</CardTitle>
                        <CardDescription>Manage photos for this room type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <PhotoGallery 
                            photoType="room_type" 
                            photoTypeId={roomTypeId} 
                            hostingCompanyId={roomTypeData?.hosting_company_id}
                        />
                    </CardContent>
                </Card>
                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/listings')}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Update Room Type
                    </Button>
                </div>
            </form>
        </Form>
    )
}
