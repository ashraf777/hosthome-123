"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, BedDouble, PlusCircle } from "lucide-react"
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
import { CreatePropertyDialog } from "./create-property-dialog"
import { PhotoGallery } from "./[roomTypeId]/photo-gallery"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

const roomTypeSchema = z.object({
  property_id: z.coerce.number({ required_error: "Please select a property." }).optional(),
  name: z.string().min(3, "Room type name is required."),
  max_adults: z.coerce.number().min(1, "Max adults must be at least 1."),
  max_children: z.coerce.number().min(0).optional().nullable(),
  size: z.string().optional().nullable(),
  weekday_price: z.coerce.number().min(0).optional().nullable(),
  weekend_price: z.coerce.number().min(0).optional().nullable(),
  status: z.boolean().default(true),
  amenity_ids: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
    if (!data.property_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A property must be selected or created.", path: ['property_id']});
    }
});

export function GlobalRoomTypeForm({ isEditMode = false, roomTypeId }) {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [allAmenities, setAllAmenities] = useState({});
  const [isCreatePropertyOpen, setCreatePropertyOpen] = useState(false);
  const [createdRoomType, setCreatedRoomType] = useState(null); 
  const { toast } = useToast()
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
    },
  })
  
  const fetchProperties = useCallback(async () => {
    try {
      const response = await api.get('properties');
      setProperties(response.data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch properties." });
    }
  }, [toast]);
  
  const fetchAmenities = useCallback(async () => {
     try {
       const amenitiesRes = await api.get('amenities');
       const amenitiesList = amenitiesRes.data || amenitiesRes;
        if (Array.isArray(amenitiesList)) {
            const groupedAmenities = amenitiesList.reduce((acc, amenity) => {
            const category = amenity.amenity_reference?.name || 'General';
            if (!acc[category]) acc[category] = [];
            acc[category].push({ id: amenity.id, name: amenity.specific_name });
            return acc;
            }, {});
            setAllAmenities(groupedAmenities);
        }
     } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch amenities." });
     }
  }, [toast])

  useEffect(() => {
    async function initialFetch() {
        setLoading(true);
        await Promise.all([
          fetchProperties(), 
          fetchAmenities()
        ]);
        
        if (isEditMode && roomTypeId) {
            try {
                const roomTypeRes = await api.get(`room-types/${roomTypeId}`);
                const roomTypeData = roomTypeRes.data || roomTypeRes;
                const currentAmenities = roomTypeData.amenities?.map(a => a.id) || [];
                form.reset({
                    ...roomTypeData,
                    status: roomTypeData.status === 1,
                    amenity_ids: currentAmenities,
                });
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Could not fetch room type details." });
            }
        }
        
        setLoading(false);
    }
    initialFetch();
  }, [isEditMode, roomTypeId, fetchProperties, fetchAmenities, toast, form]);


  const handleNewPropertySuccess = (newPropertyResponse) => {
    const newProperty = newPropertyResponse.data || newPropertyResponse;
    fetchProperties().then(() => {
      form.setValue("property_id", newProperty.id, { shouldValidate: true });
    });
  };

  async function onSubmit(values) {
    setSubmitting(true)
    const payload = {
        ...values,
        status: values.status ? 1 : 0,
        property_ids: values.property_id ? [values.property_id] : []
    };

    try {
      let response;
      if (isEditMode) {
        response = await api.put(`room-types/${roomTypeId}`, payload);
         toast({ title: "Room Type Updated", description: "The room type has been successfully updated." });
         router.push('/dashboard/room-types');
         router.refresh();

      } else {
        response = await api.post('room-types', payload);
        toast({ title: "Room Type Created", description: `Now you can add photos to your new room type.` });
        setCreatedRoomType(response.data.data || response.data);
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
  
  if (!isEditMode && createdRoomType) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Add Photos</CardTitle>
                <CardDescription>
                    Upload photos for your newly created room type: <span className="font-bold">{createdRoomType.name}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PhotoGallery roomTypeId={createdRoomType.id} />
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.push(`/dashboard/room-types`)}>
                    Done
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <>
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardHeader>
                <CardTitle>{isEditMode ? "Edit Room Type" : "Step 1: Room Type Details"}</CardTitle>
                <CardDescription>
                {isEditMode ? "Update the details of this room type." : "Select a property, fill out the info, then you can add photos."}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="property_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property</FormLabel>
                        <div className="flex gap-2">
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
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Room Type Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Deluxe King Suite" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="max_adults" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Adults</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="max_children" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Children</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="size" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Room Size</FormLabel>
                        <FormControl><Input placeholder="e.g., 25 sqm" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="weekday_price" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weekday Price ($)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="weekend_price" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weekend Price ($)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                    <div className="flex items-center space-x-2">
                        <Switch id="status-switch" checked={field.value} onCheckedChange={field.onChange} />
                        <FormLabel htmlFor="status-switch">Active</FormLabel>
                    </div>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField
                control={form.control}
                name="amenity_ids"
                render={() => (
                    <FormItem>
                    <Accordion type="single" collapsible className="w-full bg-background rounded-lg">
                        <AccordionItem value="amenities" className="border">
                        <AccordionTrigger className="px-4">
                            <h3 className="text-md font-medium">Amenities</h3>
                        </AccordionTrigger>
                        <AccordionContent className="p-4">
                            <FormMessage className="mb-4" />
                            <div className="space-y-6">
                            {Object.entries(allAmenities).map(([category, items]) => (
                                <div key={category}>
                                <h4 className="font-medium text-md mb-2">{category}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {items.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="amenity_ids"
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), item.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.id
                                                        )
                                                    )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {item.name}
                                            </FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                    ))}
                                </div>
                                </div>
                            ))}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    </FormItem>
                )}
                />
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BedDouble className="mr-2 h-4 w-4" />}
                {isEditMode ? "Update Room Type" : "Save and Continue"}
                </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>

    {isEditMode && roomTypeId && (
        <Card>
            <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>Manage photos for this room type.</CardDescription>
            </CardHeader>
            <CardContent>
                <PhotoGallery roomTypeId={roomTypeId} />
            </CardContent>
        </Card>
    )}

    <div className="flex justify-between">
        {!isEditMode ? <div></div> : <Button type="button" variant="outline" onClick={() => router.push('/dashboard/room-types')}>Cancel</Button>}
            {isEditMode && <Button type="submit" disabled={submitting} onClick={form.handleSubmit(onSubmit)}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Room Type
        </Button>}
    </div>
    </>
  )
}
