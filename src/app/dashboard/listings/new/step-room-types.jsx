
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { api } from "@/services/api"
import { PhotoGallery } from "@/components/photo-gallery"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"


const newRoomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_adults: z.coerce.number().min(1, "Max adults must be at least 1."),
  max_children: z.coerce.number().min(0).optional().nullable(),
  size: z.string().optional().nullable(),
  weekday_price: z.coerce.number().min(0).optional().nullable(),
  weekend_price: z.coerce.number().min(0).optional().nullable(),
  status: z.boolean().default(true),
  amenities: z.array(z.number()).optional(),
})

const assignRoomTypeSchema = z.object({
    room_type_id: z.any().optional()
})

export function StepRoomTypes({ onNext, onBack, propertyId, propertyDetails, setWizardData, initialData }) {
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [allAmenities, setAllAmenities] = React.useState({});
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState([]); // For the dropdown
  const [isSubmittingNew, setIsSubmittingNew] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [createdRoomType, setCreatedRoomType] = React.useState(null)
  
  const { toast } = useToast()

  const assignForm = useForm({
    resolver: zodResolver(assignRoomTypeSchema),
    defaultValues: {
      room_type_id: initialData?.[0]?.roomTypeId || undefined
    },
  })

  const newRoomTypeForm = useForm({
    resolver: zodResolver(newRoomTypeSchema),
    defaultValues: {
      name: "",
      max_adults: 2,
      max_children: 0,
      size: '',
      weekday_price: 100,
      weekend_price: 120,
      status: true,
      amenities: [],
    }
  });

  const fetchAvailableRoomTypesForDropdown = React.useCallback(async () => {
     if (!propertyId) return;
     try {
        const response = await api.get(`properties/${propertyId}/room-types`);
        const roomTypesData = response.data?.data || response.data || [];
        if (Array.isArray(roomTypesData)) {
            setAvailableRoomTypes(roomTypesData);
        }
     } catch (error) {
        toast({ variant: "destructive", title: "Dropdown Error", description: `Could not fetch available room types. ${error.message}` });
     }
  }, [propertyId, toast]);


  React.useEffect(() => {
    async function initialFetch() {
      if (!propertyId) return;
      setLoading(true);
      
      await Promise.all([
        fetchAvailableRoomTypesForDropdown(),
        api.get('amenities').then(amenitiesRes => {
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
        })
      ]);
      setLoading(false);
    }
    initialFetch();
  }, [propertyId, fetchAvailableRoomTypesForDropdown]);


  const handleCreateAndAssignNew = React.useCallback(async (values) => {
    setIsSubmittingNew(true);
    const creationPayload = {
        ...values,
        property_id: Number(propertyId),
        status: values.status ? 1 : 0,
        property_ids: [Number(propertyId)],
        amenity_ids: values.amenities,
    };
    delete creationPayload.amenities;

    try {
      const response = await api.post('room-types', creationPayload);
      const newRoomType = response.data?.data || response.data || response;
      toast({ title: "Room Type Created", description: `"${newRoomType.name}" created. Now adding...` });
      
      await api.post(`properties/${propertyId}/room-types/${newRoomType.id}`);
      toast({ title: "Room Type Added", description: `"${newRoomType.name}" has been added to the property.` });

      await fetchAvailableRoomTypesForDropdown();
      assignForm.setValue('room_type_id', newRoomType.id);

      setCreatedRoomType(newRoomType); 
      newRoomTypeForm.reset();
      setShowCreateForm(false);
      
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create or add room type." });
    } finally {
      setIsSubmittingNew(false);
    }
  }, [propertyId, toast, newRoomTypeForm, fetchAvailableRoomTypesForDropdown, assignForm]);

  const handleFinishPhotoStep = async () => {
      if (!createdRoomType) return;
      setCreatedRoomType(null);
  }
  

  const handleSubmit = (data) => {
    const selectedRoomTypeId = assignForm.getValues("room_type_id");
    if (!selectedRoomTypeId) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'You must add a room type to proceed.' });
        return;
    }
    const selectedRoomType = availableRoomTypes.find(rt => rt.id === Number(selectedRoomTypeId));
    const roomTypeForNextStep = { roomTypeId: selectedRoomType.id, name: selectedRoomType.name };
    
    setWizardData(prev => ({ ...prev, roomTypes: [roomTypeForNextStep] }));
    onNext({ roomTypes: [roomTypeForNextStep] });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (createdRoomType) {
    return (
        <>
            <CardHeader>
                <CardTitle>Step 3b: Add Photos to "{createdRoomType.name}"</CardTitle>
                <CardDescription>Upload images for your new room type. You can do this later too.</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
                <PhotoGallery 
                    photoType="room_type" 
                    photoTypeId={createdRoomType.id} 
                    hostingCompanyId={propertyDetails?.hosting_company_id}
                />
            </div>
            <div className="p-6 pt-0 flex justify-end">
                 <Button onClick={handleFinishPhotoStep}>Done &amp; Continue</Button>
            </div>
        </>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Step 3: Define Room Type</CardTitle>
            <CardDescription>Add or create a room type for this property.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
        <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
            <h3 className="text-lg font-medium">Add a Room Type to the Property</h3>
            <p className="text-sm text-muted-foreground">Select from available room types to add to this property.</p>
            <Form {...assignForm}>
                <form className="flex items-start gap-2">
                    <FormField
                        control={assignForm.control}
                        name="room_type_id"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a room type to add..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoomTypes.length > 0 ? (
                                        availableRoomTypes.map(rt => (
                                            <SelectItem key={rt.id} value={rt.id.toString()}>
                                            {rt.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No available room types for this property.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

       <div className="p-4 border rounded-lg bg-muted/20 space-y-6">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-medium">Add a New Room Type</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateForm(prev => !prev)}>
                {showCreateForm ? 'Cancel' : 'Add New'}
            </Button>
           </div>

          {showCreateForm && (
            <Form {...newRoomTypeForm}>
                <form onSubmit={newRoomTypeForm.handleSubmit(handleCreateAndAssignNew)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={newRoomTypeForm.control} name="name" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Room Type Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Deluxe King Suite" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={newRoomTypeForm.control} name="status" render={({ field }) => (
                    <FormItem className="flex flex-col pt-7">
                        <div className="flex items-center space-x-2">
                            <Switch id="status-switch" checked={field.value} onCheckedChange={field.onChange} />
                            <FormLabel htmlFor="status-switch">Active</FormLabel>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={newRoomTypeForm.control} name="max_adults" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Adults</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={newRoomTypeForm.control} name="max_children" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Children</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={newRoomTypeForm.control} name="size" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Room Size</FormLabel>
                        <FormControl><Input placeholder="e.g., 25 sqm" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={newRoomTypeForm.control} name="weekday_price" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weekday Price ($)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={newRoomTypeForm.control} name="weekend_price" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weekend Price ($)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>

                <FormField
                    control={newRoomTypeForm.control}
                    name="amenities"
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
                                            control={newRoomTypeForm.control}
                                            name="amenities"
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

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={isSubmittingNew}>
                        {isSubmittingNew && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Add Photos
                    </Button>
                </div>
                </form>
            </Form>
          )}
      </div>

        <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" onClick={handleSubmit}>Next</Button>
        </div>
    </div>
  )
}

    