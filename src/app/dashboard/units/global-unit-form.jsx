
"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { PhotoGallery } from "@/components/photo-gallery"


const unitFormSchema = z.object({
  property_id: z.coerce.number({ required_error: "Please select a property." }),
  room_type_id: z.coerce.number({ required_error: "Please select a room type." }),
  unit_identifier: z.string().min(1, "Unit identifier is required."),
  status: z.enum(['available', 'maintenance', 'owner_use']),
  description: z.string().optional(),
  about: z.string().optional(),
  guest_access: z.string().optional(),
  max_free_stay_days: z.coerce.number().optional(),
})

export function GlobalUnitForm({ isEditMode = false, unitId }) {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isRoomTypeLoading, setIsRoomTypeLoading] = useState(false);
  const [createdUnit, setCreatedUnit] = useState(null);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      property_id: undefined,
      room_type_id: undefined,
      unit_identifier: "",
      status: "available",
      description: "",
      about: "",
      guest_access: "",
      max_free_stay_days: 0,
    },
  })

  const selectedPropertyId = form.watch("property_id");
  const selectedRoomTypeId = form.watch("room_type_id");
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const fetchProperties = useCallback(async () => {
    try {
        const response = await api.get('properties');
        setProperties(response.data);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch properties." });
    }
  }, [toast]);

  const fetchRoomTypes = useCallback(async (propertyId) => {
    if (!propertyId) {
      setRoomTypes([]);
      return;
    }
    setIsRoomTypeLoading(true);
    try {
      const response = await api.get(`properties/${propertyId}/room-types`);
      setRoomTypes(response.data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch room types for the selected property." });
      setRoomTypes([]);
    } finally {
      setIsRoomTypeLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    async function initialFetch() {
        setLoading(true);
        await fetchProperties();
        if (isEditMode && unitId) {
            try {
                const unitRes = await api.get(`units/${unitId}`);
                const unitData = unitRes.data;
                setCreatedUnit(unitData); // Used for photo gallery
                await fetchRoomTypes(unitData.property?.id);
                form.reset({
                  ...unitData,
                  property_id: unitData.property?.id,
                  room_type_id: unitData.room_type?.id,
                });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: `Could not fetch unit data. ${error.message}` });
            }
        }
        setLoading(false);
    }
    initialFetch();
  }, [isEditMode, unitId, fetchProperties, fetchRoomTypes, form, toast]);

  useEffect(() => {
    if (selectedPropertyId) {
        if (!isEditMode) {
            form.setValue("room_type_id", undefined);
        }
        fetchRoomTypes(selectedPropertyId);
    }
  }, [selectedPropertyId, fetchRoomTypes, form, isEditMode]);

  async function onSubmit(values) {
    setSubmitting(true)
    const { property_id, ...submissionValues } = values;

    try {
      if (isEditMode) {
         await api.put(`units/${unitId}`, submissionValues);
         toast({ title: "Unit Updated", description: `The unit "${values.unit_identifier}" has been successfully updated.` });
         router.push('/dashboard/units');
         router.refresh();
      } else {
        const response = await api.post('units', submissionValues);
        toast({ title: "Unit Created", description: `The unit "${values.unit_identifier}" has been successfully created.`});
        setCreatedUnit(response.data);
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "An error occurred",
        description: error.message || "Something went wrong.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
  }
  
  if (!isEditMode && createdUnit) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Unit Created: {createdUnit.unit_identifier}</CardTitle>
                <CardDescription>
                    You can now manage photos for this unit.
                </CardDescription>
            </CardHeader>
            <CardContent>
               <PhotoGallery 
                    photoType="unit" 
                    photoTypeId={createdUnit.id} 
                    hostingCompanyId={createdUnit.hosting_company_id}
                />
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.push(`/dashboard/units`)}>
                    Done
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Edit Unit' : 'Create New Unit'}</CardTitle>
                <CardDescription>
                {isEditMode ? 'Update the details for this unit.' : 'First select a property, then a room type to create a new unit.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="property_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()} disabled={isEditMode}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a property" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {properties.map(prop => (
                                <SelectItem key={prop.id} value={prop.id.toString()}>{prop.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="room_type_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Room Type</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()} disabled={!selectedPropertyId || isRoomTypeLoading || isEditMode}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder={isRoomTypeLoading ? "Loading..." : "Select a room type"} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {roomTypes.map(rt => (
                                <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="unit_identifier"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit Identifier</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Room 101, Apartment 3B" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="owner_use">Owner Use</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <FormField
                    control={form.control}
                    name="max_free_stay_days"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Free Stay Days (Optional)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Describe the unit..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>About Your Place (Optional)</FormLabel>
                        <FormControl>
                        <Textarea placeholder="What makes this unit unique?" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="guest_access"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Guest Access (Optional)</FormLabel>
                        <FormControl>
                        <Textarea placeholder="What can guests access?" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
            </Card>

             {isEditMode && createdUnit && (
                <Card>
                    <CardHeader>
                        <CardTitle>Unit Specific Photos</CardTitle>
                        <CardDescription>
                           Upload photos that are unique to this specific unit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PhotoGallery 
                            photoType="unit" 
                            photoTypeId={createdUnit.id} 
                            hostingCompanyId={createdUnit.property?.hosting_company_id}
                        />
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between">
                 <Button type="button" variant="outline" onClick={() => router.push('/dashboard/units')}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                )}
                {isEditMode ? 'Update Unit' : 'Create Unit'}
                </Button>
            </div>
        </form>
    </Form>
    </>
  )
}
