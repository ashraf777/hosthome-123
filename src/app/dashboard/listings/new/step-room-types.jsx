
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusCircle, Trash2, Loader2, ChevronsUpDown, Check, Bed } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { api } from "@/services/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { PhotoGallery } from "@/app/dashboard/room-types/[roomTypeId]/photo-gallery"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

const assignedRoomTypeSchema = z.object({
  roomTypeId: z.any(),
  name: z.string(),
});

const formSchema = z.object({
  roomTypes: z.array(assignedRoomTypeSchema).min(1, "You must add at least one room type to proceed."),
});

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

export function StepRoomTypes({ onNext, onBack, propertyId, setWizardData, initialData }) {
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState([]);
  const [allAmenities, setAllAmenities] = React.useState({});
  const [isSubmittingNew, setIsSubmittingNew] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = React.useState("")
  const [createdRoomType, setCreatedRoomType] = React.useState(null) 
  const { toast } = useToast()

  const mainForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { roomTypes: initialData || [] },
  });

  const { control, handleSubmit: handleMainSubmit, formState: { errors }, reset: resetMainForm } = mainForm;
  const { fields, append, remove, replace } = useFieldArray({ control, name: "roomTypes" });

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

  const handleCreateAndAssignNew = React.useCallback(async (values) => {
    if (!propertyId) {
      toast({ variant: "destructive", title: "Error", description: "Property ID is missing." });
      return;
    }
    setIsSubmittingNew(true);
    const payload = {
        ...values,
        property_id: propertyId,
        status: values.status ? 1 : 0
    };
    const amenityIds = payload.amenities;
    delete payload.amenities;

    try {
      const response = await api.post('room-types', payload);
      const newRoomType = response.data?.data || response.data || response;
      toast({ title: "Room Type Created", description: `"${newRoomType.name}" created.` });
      
      if (amenityIds && amenityIds.length > 0) {
        await api.post(`room-types/${newRoomType.id}/amenities`, { amenity_ids: amenityIds });
      }
      
      setCreatedRoomType(newRoomType); 
      newRoomTypeForm.reset();
      setShowCreateForm(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create room type." });
    } finally {
      setIsSubmittingNew(false);
    }
  }, [propertyId, toast, newRoomTypeForm]);
  
  const fetchRoomTypesAndAmenities = React.useCallback(async () => {
        setLoading(true);
        try {
            const [allRoomTypesRes, allAmenitiesRes] = await Promise.all([
              api.get('room-types'),
              api.get('amenities'),
            ]);
            
            const allTypes = allRoomTypesRes.data?.data || allRoomTypesRes.data || allRoomTypesRes || [];
            if(Array.isArray(allTypes)) {
               setAvailableRoomTypes(allTypes);
            }

            const amenitiesList = allAmenitiesRes.data || allAmenitiesRes;
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
            toast({ variant: "destructive", title: "Error", description: `Could not fetch required room type data. ${error.message}` });
        } finally {
            setLoading(false);
        }
  }, [toast]);


  React.useEffect(() => {
    fetchRoomTypesAndAmenities();
  }, [fetchRoomTypesAndAmenities]);


  const handleAssignExisting = async () => {
    if (!selectedRoomTypeId) {
        toast({ variant: "destructive", title: "No Selection", description: "Please select a room type to assign." });
        return;
    }
    const roomTypeToAssign = availableRoomTypes.find(rt => rt.id.toString() === selectedRoomTypeId);
    if (!roomTypeToAssign) return;

    if (fields.some(field => field.roomTypeId === roomTypeToAssign.id)) {
        toast({ title: "Already Added", description: "This room type is already in the list for this session." });
        return;
    }

    // We don't make an API call here. We just add it to the local state.
    // The assignment to the property will happen when the wizard is completed.
    append({ roomTypeId: roomTypeToAssign.id, name: roomTypeToAssign.name });
    toast({ title: "Added to List", description: `"${roomTypeToAssign.name}" is ready to be assigned.` });
    setSelectedRoomTypeId("");
  };

  const handleRemove = async (index, roomTypeId) => {
    // Just remove it from the form state. No API call needed here.
    remove(index);
    toast({ title: "Removed", description: "Room type has been removed from the list." });
  }

  const handleFinishPhotoStep = async () => {
      if (!createdRoomType) return;
      // When photos are done, we just add the newly created room type to our list for this session.
      toast({ title: "Added to List", description: `"${createdRoomType.name}" is ready to be assigned.` });
      append({ roomTypeId: createdRoomType.id, name: createdRoomType.name });
      setCreatedRoomType(null);
  }

  const onSubmit = (data) => {
    onNext({ roomTypes: data.roomTypes });
  };

  if (createdRoomType) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 3b: Add Photos to "{createdRoomType.name}"</CardTitle>
                <CardDescription>Upload images for your new room type. You can do this later too.</CardDescription>
            </CardHeader>
            <CardContent>
                <PhotoGallery roomTypeId={createdRoomType.id} />
            </CardContent>
            <CardFooter>
                 <Button onClick={handleFinishPhotoStep}>Done & Add to Listing</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Step 3: Define Room Types</CardTitle>
            <CardDescription>Assign existing room types or create a new one for this property.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Assign an Existing Room Type</h3>
          <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                  <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[300px] justify-between"
                  disabled={loading}
                  >
                  {selectedRoomTypeId
                      ? availableRoomTypes.find((rt) => rt.id.toString() === selectedRoomTypeId)?.name
                      : "Select room type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                  <Command>
                  <CommandInput placeholder="Search room types..." />
                  <CommandList>
                      <CommandEmpty>No available room types found.</CommandEmpty>
                      <CommandGroup>
                      {availableRoomTypes.map((rt) => (
                          <CommandItem
                          key={rt.id}
                          value={rt.name}
                          onSelect={() => {
                              setSelectedRoomTypeId(rt.id.toString())
                              setOpen(false)
                          }}
                          >
                          <Check
                              className={cn(
                              "mr-2 h-4 w-4",
                              selectedRoomTypeId === rt.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                          />
                          {rt.name}
                          </CommandItem>
                      ))}
                      </CommandGroup>
                  </CommandList>
                  </Command>
              </PopoverContent>
              </Popover>

              <Button type="button" onClick={handleAssignExisting} disabled={!selectedRoomTypeId}>Assign</Button>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
            <Button type="button" variant="outline" className="w-full" onClick={() => setShowCreateForm(prev => !prev)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {showCreateForm ? 'Cancel Creation' : 'Create a New Room Type'}
          </Button>
      </div>

      {showCreateForm && (
        <div className="p-4 border rounded-lg bg-muted/20 space-y-6">
           <Form {...newRoomTypeForm}>
            <form onSubmit={newRoomTypeForm.handleSubmit(handleCreateAndAssignNew)} className="space-y-4">
              <h3 className="text-lg font-medium">New Room Type Details</h3>
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
                <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)} disabled={isSubmittingNew}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingNew}>
                    {isSubmittingNew && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save & Add Photos
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      
      <Form {...mainForm}>
        <form onSubmit={handleMainSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 border rounded-lg p-4">
            <h3 className="font-medium text-foreground">Added Room Types</h3>
            {loading ? <p>Loading...</p> : fields.length > 0 ? (
                <div className="space-y-2">
                  {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold">{field.name}</p>
                            </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(index, field.roomTypeId)} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No room types assigned to this property yet.</p>
            )}
          </div>
          {errors.roomTypes && (<p className="text-sm font-medium text-destructive">{errors.roomTypes.message}</p>)}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
