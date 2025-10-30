
"use client"

import { useEffect, useState, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, BedDouble } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"

// The schema is now defined in the parent component `room-type-edit-tab.jsx`

export function RoomTypeForm({ isEditMode = false, propertyId, roomTypeId, onSuccess, form }) {
  const [formLoading, setFormLoading] = useState(true);
  const [allAmenities, setAllAmenities] = useState({});
  const { toast } = useToast()
  
   const fetchFormData = useCallback(async () => {
    setFormLoading(true);
    try {
      const [amenitiesRes, roomTypeRes] = await Promise.all([
        api.get('amenities'),
        isEditMode && roomTypeId ? api.get(`room-types/${roomTypeId}`) : Promise.resolve(null),
      ]);

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

      if (roomTypeRes) {
        const roomTypeData = roomTypeRes.data || roomTypeRes;
        const currentAmenities = roomTypeData.amenities?.map(a => a.id) || [];
        form.reset({
          name: roomTypeData.name || "",
          max_adults: roomTypeData.max_adults || 2,
          max_children: roomTypeData.max_children || 0,
          size: roomTypeData.size || '',
          weekday_price: roomTypeData.weekday_price || 100,
          weekend_price: roomTypeData.weekend_price || 120,
          status: roomTypeData.status === 1,
          amenity_ids: currentAmenities,
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Could not fetch form data. ${error.message}` });
    } finally {
      setFormLoading(false);
    }
  }, [isEditMode, roomTypeId, form, toast]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);


  if (formLoading) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="grid gap-6 px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <Form {...form}>
        {/* The form tag is now in the parent component */}
          <CardHeader className="px-0">
            <CardTitle>Room Type Details</CardTitle>
            <CardDescription>
              {isEditMode ? "Manage the details for this room type." : "Fill out the details for the room type. You can add photos after creation."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
               <FormField control={form.control} name="status" render={({ field }) => (
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
          {/* Footer with buttons has been removed and moved to the parent tab component */}
      </Form>
    </Card>
  )
}
