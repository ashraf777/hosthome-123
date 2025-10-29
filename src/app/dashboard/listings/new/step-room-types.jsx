
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusCircle, Trash2, Loader2, Bed } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { api } from "@/services/api"
import { PhotoGallery } from "@/app/dashboard/room-types/[roomTypeId]/photo-gallery"
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

export function StepRoomTypes({ onNext, onBack, propertyId, propertyDetails, setWizardData }) {
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [allAmenities, setAllAmenities] = React.useState({});
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState([]); // For the dropdown
  const [assignedRoomTypes, setAssignedRoomTypes] = React.useState([]); // From property object
  const [isSubmittingNew, setIsSubmittingNew] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [createdRoomType, setCreatedRoomType] = React.useState(null)
  const [selectedExistingRoomTypeId, setSelectedExistingRoomTypeId] = React.useState(null);
  
  const { toast } = useToast()

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
        const roomTypesData = response.data || response;
        if (Array.isArray(roomTypesData)) {
            setAvailableRoomTypes(roomTypesData);
        }
     } catch (error) {
        toast({ variant: "destructive", title: "Dropdown Error", description: `Could not fetch available room types. ${error.message}` });
     }
  }, [propertyId, toast]);

  const fetchCurrentPropertyDetails = React.useCallback(async () => {
    if (!propertyId) return;
    try {
        const propertyRes = await api.get(`properties/${propertyId}`);
        const currentPropertyDetails = propertyRes.data || propertyRes;
        setAssignedRoomTypes(currentPropertyDetails.room_types || []);
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: `Could not fetch assigned room types. ${error.message}` });
    }
  }, [propertyId, toast]);


  React.useEffect(() => {
    async function initialFetch() {
      if (!propertyId) return;
      setLoading(true);

      // Initialize assigned room types from the propertyDetails passed down from Step 2
      if (propertyDetails?.room_types) {
          setAssignedRoomTypes(propertyDetails.room_types);
      } else {
        // If not available, fetch them
        await fetchCurrentPropertyDetails();
      }

      // Fetch other necessary data
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
  }, [propertyId, fetchAvailableRoomTypesForDropdown, fetchCurrentPropertyDetails, propertyDetails]);


  const handleCreateAndAssignNew = React.useCallback(async (values) => {
    setIsSubmittingNew(true);
    const creationPayload = {
        ...values,
        status: values.status ? 1 : 0,
        property_id: Number(propertyId),
        amenity_ids: values.amenities,
    };
    delete creationPayload.amenities;

    try {
      // Step 1: Create the new room type
      const response = await api.post('room-types', creationPayload);
      const newRoomType = response.data?.data || response.data || response;
      
      toast({ title: "Room Type Created", description: `"${newRoomType.name}" created. Now assigning...` });
      
      // Step 2: Assign the newly created room type to the property (pivot table)
      await api.post(`properties/${propertyId}/room-types/${newRoomType.id}`);

      toast({ title: "Room Type Assigned", description: `"${newRoomType.name}" has been assigned to the property.` });

      // Step 3: Refresh UI state
      await fetchCurrentPropertyDetails();
      await fetchAvailableRoomTypesForDropdown();

      setCreatedRoomType(newRoomType); 
      newRoomTypeForm.reset();
      setShowCreateForm(false);
      
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create or assign room type." });
    } finally {
      setIsSubmittingNew(false);
    }
  }, [propertyId, toast, newRoomTypeForm, fetchCurrentPropertyDetails, fetchAvailableRoomTypesForDropdown]);


  const handleRemoveFromProperty = async (roomTypeIdToRemove) => {
    try {
      await api.delete(`properties/${propertyId}/room-types/${roomTypeIdToRemove}`);
      toast({ title: "Room Type Unassigned", description: "The room type has been removed from this property." });
      await fetchCurrentPropertyDetails();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not unassign room type." });
    }
  }

  const handleFinishPhotoStep = async () => {
      if (!createdRoomType) return;
      setCreatedRoomType(null);
  }
  
  const handleAssignExisting = async () => {
    if (!selectedExistingRoomTypeId) {
        toast({ variant: "destructive", title: "No Selection", description: "Please select a room type to add." });
        return;
    }
    try {
        await api.post(`properties/${propertyId}/room-types/${selectedExistingRoomTypeId}`);
        toast({ title: "Room Type Assigned", description: "Successfully assigned to the property." });
        
        await fetchCurrentPropertyDetails();

        setSelectedExistingRoomTypeId(null);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not assign room type." });
    }
  };
  
  const assignedIds = new Set(assignedRoomTypes.map(rt => rt.id));
  const dropdownOptions = availableRoomTypes.filter(rt => !assignedIds.has(rt.id));


  const handleSubmit = (data) => {
    if (assignedRoomTypes.length === 0) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'You must have at least one room type assigned to proceed.' });
        return;
    }
    const finalRoomTypesForNextStep = assignedRoomTypes.map(rt => ({ roomTypeId: rt.id, name: rt.name }));
    setWizardData(prev => ({ ...prev, roomTypes: finalRoomTypesForNextStep }));
    onNext({ roomTypes: finalRoomTypesForNextStep });
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
                <PhotoGallery roomTypeId={createdRoomType.id} />
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
            <CardTitle>Step 3: Define Room Types</CardTitle>
            <CardDescription>Create or assign existing room types for this property.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
        <h3 className="text-lg font-medium">Assign an Existing Room Type</h3>
        <p className="text-sm text-muted-foreground">Select from available room types to assign to this property.</p>
        <div className="flex items-center gap-2">
            <Select onValueChange={(value) => setSelectedExistingRoomTypeId(value)} value={selectedExistingRoomTypeId || ''}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a room type to assign..." />
                </SelectTrigger>
                <SelectContent>
                    {dropdownOptions.length > 0 ? (
                        dropdownOptions.map(rt => (
                            <SelectItem key={rt.id} value={rt.id.toString()}>
                            {rt.name}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No unassigned room types for this property.
                        </div>
                    )}
                </SelectContent>
            </Select>
            <Button type="button" onClick={handleAssignExisting} disabled={!selectedExistingRoomTypeId}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

       <div className="p-4 border rounded-lg bg-muted/20 space-y-6">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-medium">Create a New Room Type</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateForm(prev => !prev)}>
                {showCreateForm ? 'Cancel Creation' : 'Create New'}
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
      
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 border rounded-lg p-4">
        <h3 className="font-medium text-foreground">Room Types Assigned to This Property</h3>
        {assignedRoomTypes.length > 0 ? (
            <div className="space-y-2">
                {assignedRoomTypes.map((roomType, index) => (
                    <div key={roomType.id} className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">{roomType.name}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFromProperty(roomType.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No room types assigned to this property yet.</p>
        )}
        </div>

        <div className="flex justify-end">
        {/* <Button type="button" variant="outline" onClick={onBack}>Back</Button> */}
        <Button type="button" onClick={handleSubmit}>Next</Button>
        </div>
    </div>
  )
}

    