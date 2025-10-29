
"use client"

import * as React from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { PhotoGallery } from "../../room-types/[roomTypeId]/photo-gallery"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { api } from "@/services/api"

const roomTypeSchemaForSubmit = z.object({
  id: z.any(),
  name: z.string(),
  max_guests: z.number(),
  units_count: z.number().default(0),
});

const formSchema = z.object({
  roomTypes: z.array(roomTypeSchemaForSubmit).min(1, "Please add at least one room type."),
});

const newRoomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_adults: z.coerce.number().min(1, "Must have at least 1 adult."),
  max_children: z.coerce.number().min(0).default(0),
  room_size: z.coerce.number().optional(),
  weekday_price: z.coerce.number().optional(),
  weekend_price: z.coerce.number().optional(),
  property_id: z.coerce.number(),
  amenities: z.array(z.number()).optional(),
})

export function StepRoomTypes({ onNext, onBack, initialData, propertyId }) {
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [amenities, setAmenities] = React.useState({});
  const { toast } = useToast()

  const mainForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomTypes: initialData || [],
    },
  });

  const { control, handleSubmit, formState: { errors } } = mainForm;

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "roomTypes",
  });
  
  const newRoomTypeForm = useForm({
    resolver: zodResolver(newRoomTypeSchema),
    defaultValues: {
      name: "",
      max_adults: 2,
      max_children: 0,
      property_id: Number(propertyId),
      amenities: [],
    }
  })
  
  const [editingRoomType, setEditingRoomType] = React.useState(null);

  React.useEffect(() => {
    async function fetchAmenities() {
        try {
            const amenitiesRes = await api.get('amenities');
            const allAmenities = amenitiesRes.data || amenitiesRes;
            if (Array.isArray(allAmenities)) {
                const groupedAmenities = allAmenities.reduce((acc, amenity) => {
                const category = amenity.amenity_reference?.name || 'General';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push({ id: amenity.id, name: amenity.specific_name });
                return acc;
                }, {});
                setAmenities(groupedAmenities);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch amenities." });
        }
    }
    fetchAmenities();
  }, [toast]);

  React.useEffect(() => {
    if (fields.length === 0 && !showCreateForm) {
      setShowCreateForm(true);
    }
  }, [fields.length, showCreateForm]);

  const handleCreateNewRoomType = () => {
    newRoomTypeForm.trigger().then(isValid => {
      if (isValid) {
        const values = newRoomTypeForm.getValues();
        const newRoomType = { ...values, id: `new-${Date.now()}`, max_guests: values.max_adults + values.max_children };
        
        setEditingRoomType(newRoomType);
        
        toast({
          title: "Room Type Details Saved",
          description: `Now you can add photos to ${newRoomType.name}.`,
        });
      }
    });
  }
  
  const handleFinishEditingRoomType = () => {
    if (editingRoomType) {
        append(editingRoomType);
        setEditingRoomType(null);
        setShowCreateForm(false);
        newRoomTypeForm.reset({
            name: "",
            max_adults: 2,
            max_children: 0,
            property_id: Number(propertyId),
            amenities: [],
        });
    }
  }

  const handleCancelCreate = () => {
      setEditingRoomType(null);
      setShowCreateForm(false);
      newRoomTypeForm.reset();
  }

  const onSubmit = (data) => {
    onNext({ roomTypes: data.roomTypes });
  };

  return (
    <>
      <Form {...mainForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="p-0 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Step 3: Define Room Types</CardTitle>
                <CardDescription>Add the room types available for this property.</CardDescription>
              </div>
              {!showCreateForm && (
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Room Type
                </Button>
              )}
            </div>
          </CardHeader>

          {showCreateForm && (
            <div className="p-4 border rounded-lg bg-muted/20 space-y-6">
              <h3 className="text-lg font-medium">New Room Type Details</h3>
              <Form {...newRoomTypeForm}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={newRoomTypeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Deluxe King Suite" {...field} disabled={!!editingRoomType} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newRoomTypeForm.control}
                      name="room_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (sqft)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 400" {...field} disabled={!!editingRoomType} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={newRoomTypeForm.control}
                      name="weekday_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekday Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 150" {...field} disabled={!!editingRoomType} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newRoomTypeForm.control}
                      name="weekend_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekend Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 200" {...field} disabled={!!editingRoomType}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator />
                  <h4 className="font-medium">Max Occupancy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={newRoomTypeForm.control}
                      name="max_adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adults</FormLabel>
                          <FormControl><Input type="number" {...field} disabled={!!editingRoomType} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newRoomTypeForm.control}
                      name="max_children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children</FormLabel>
                          <FormControl><Input type="number" {...field} disabled={!!editingRoomType} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />
                   <FormField
                    control={newRoomTypeForm.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="amenities">
                            <AccordionTrigger>
                              <FormLabel className="text-lg font-medium text-foreground">Amenities</FormLabel>
                            </AccordionTrigger>
                            <AccordionContent>
                                <FormMessage className="mb-4" />
                                <div className="space-y-6">
                                {Object.entries(amenities).map(([category, items]) => (
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
                                                    disabled={!!editingRoomType}
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

                  {editingRoomType && (
                     <>
                        <Separator />
                        <div className="space-y-2">
                             <h4 className="font-medium">Photos for {editingRoomType.name}</h4>
                             <PhotoGallery roomTypeId={editingRoomType.id} />
                        </div>
                     </>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={handleCancelCreate}>Cancel</Button>
                     {editingRoomType ? (
                        <Button type="button" onClick={handleFinishEditingRoomType}>Done Adding Photos</Button>
                     ) : (
                        <Button type="button" onClick={handleCreateNewRoomType}>Save & Add Photos</Button>
                     )}
                  </div>
                </div>
              </Form>
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 border rounded-lg p-4">
            <h3 className="font-medium text-foreground">Added Room Types</h3>
            {fields.length > 0 ? (
                 <Accordion type="multiple" className="w-full">
                    {fields.map((field, index) => (
                    <AccordionItem value={field.id} key={field.id} className="border-b-0">
                         <div className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/30">
                            <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                                 <div>
                                    <p className="font-semibold">{field.name}</p>
                                    <p className="text-sm text-muted-foreground">Max Guests: {field.max_guests}</p>
                                </div>
                            </AccordionTrigger>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove Room Type</span>
                            </Button>
                         </div>
                        <AccordionContent className="p-4 border border-t-0 rounded-b-lg">
                           <PhotoGallery roomTypeId={field.id} />
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No room types added yet. Click "Create New Room Type" to add one.</p>
            )}
          </div>
          {errors.roomTypes && (
            <p className="text-sm font-medium text-destructive">{errors.roomTypes.message}</p>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
    </>
  )
}

    