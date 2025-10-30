
"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Home, PlusCircle } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PhotoGallery } from "../room-types/[roomTypeId]/photo-gallery"

const propertySchema = z.object({
  name: z.string().min(5, "Property name must be at least 5 characters."),
  property_owner_id: z.coerce.number({ required_error: "Please select a property owner." }),
  address_line_1: z.string().min(5, "Please enter a full address."),
  city: z.string().min(2, "City is required."),
  state: z.string().optional(),
  country: z.string().optional(),
  zip_code: z.string().min(4, "Zip code is required."),
  property_type_ref_id: z.coerce.number({ required_error: "Please select a property type." }),
  listing_status: z.enum(['draft', 'active', 'archived']).default('draft'),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  min_nights: z.coerce.number().optional(),
  max_nights: z.coerce.number().optional(),
  amenities: z.array(z.number()).optional(),
});

export function GlobalPropertyForm({ isEditMode = false, propertyId, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenities, setAmenities] = useState({});
  const [propertyData, setPropertyData] = useState(null)
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address_line_1: "",
      city: "",
      state: "",
      country: "",
      zip_code: "",
      listing_status: "draft",
      check_in_time: "12:00",
      check_out_time: "11:00",
      min_nights: 1,
      max_nights: 0,
      amenities: [],
    },
  });

  const fetchDropdownData = useCallback(async () => {
    try {
      const [ownersRes, propTypesRes, allAmenitiesRes] = await Promise.all([
        api.get('property-owners'),
        api.get('property-references'),
        api.get('amenities'),
      ]);
      setOwners(ownersRes.data || []);
      setPropertyTypes(propTypesRes.property_type || []);
      
      const amenitiesList = allAmenitiesRes.data || allAmenitiesRes;
      if (Array.isArray(amenitiesList)) {
        const groupedAmenities = amenitiesList.reduce((acc, amenity) => {
          const category = amenity.amenity_reference?.name || 'General';
          if (!acc[category]) acc[category] = [];
          acc[category].push({ id: amenity.id, name: amenity.specific_name });
          return acc;
        }, {});
        setAmenities(groupedAmenities);
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Could not fetch required data. ${error.message}` });
    }
  }, [toast]);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        await fetchDropdownData();

        if (isEditMode && propertyId) {
            try {
                const propertyDataRes = await api.get(`properties/${propertyId}`);
                const property = propertyDataRes.data || propertyDataRes;
                setPropertyData(property);
                 
                let currentAmenities = [];
                if (property?.amenities && Array.isArray(property.amenities)) {
                    currentAmenities = property.amenities.map(a => a.id);
                }

                 form.reset({
                    ...property,
                    property_type_ref_id: property.type_reference?.id,
                    property_owner_id: property.property_owner_id,
                    amenities: currentAmenities,
                    check_in_time: property.check_in_time || "12:00",
                    check_out_time: property.check_out_time || "11:00",
                    min_nights: property.min_nights || 1,
                    max_nights: property.max_nights || 0,
                });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: `Could not fetch property data. ${error.message}` });
            }
        }

        setLoading(false);
    }
    fetchData();
  }, [isEditMode, propertyId, fetchDropdownData, form, toast]);


  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const amenityIds = values.amenities;
      delete values.amenities;

      if (isEditMode) {
        await api.put(`properties/${propertyId}`, values);
         if (amenityIds) {
            await api.post(`properties/${propertyId}/amenities`, { amenity_ids: amenityIds });
        }
        toast({
            title: "Property Updated",
            description: `The property "${values.name}" has been updated.`,
        });
      } else {
        const response = await api.post("properties", values);
         if (amenityIds && response.data.id) {
            await api.post(`properties/${response.data.id}/amenities`, { amenity_ids: amenityIds });
        }
        toast({
            title: "Property Created",
            description: `The property "${values.name}" has been created.`,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/properties");
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save property.",
      });
    } finally {
      setSubmitting(false);
    }
  }
  
  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-40" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
        </Card>
    );
  }

  const firstRoomTypeId = propertyData?.room_types?.[0]?.id;

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>{isEditMode ? "Edit Property" : "New Property Details"}</CardTitle>
                <CardDescription>
                    {isEditMode ? "Update the details for your property." : "Enter the details for the new property."}
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl><Input placeholder="e.g., The Grand Coral Hotel" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="property_owner_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Property Owner</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                            <SelectContent>{owners.map(owner => (<SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="property_type_ref_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                            <SelectContent>{propertyTypes.map(type => (<SelectItem key={type.id} value={type.id.toString()}>{type.value}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="address_line_1"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="e.g., Anytown" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl><Input placeholder="e.g., California" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl><Input placeholder="e.g., 12345" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl><Input placeholder="e.g., USA" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <FormField
                        control={form.control}
                        name="check_in_time"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Check in time</FormLabel>
                            <FormControl><Input placeholder="e.g., 12:00" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="check_out_time"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Check out time</FormLabel>
                            <FormControl><Input placeholder="e.g., 11:00" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="min_nights"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Min. night(s)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="max_nights"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Max. night(s)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                <FormField
                    control={form.control}
                    name="listing_status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Listing Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Separator />
                    <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                        <FormItem>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="amenities">
                            <AccordionTrigger>
                                <h3 className="text-md font-medium">Amenities</h3>
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
                                            control={form.control}
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
                </CardContent>
            </Card>

            {isEditMode && firstRoomTypeId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Photo Gallery</CardTitle>
                        
                    </CardHeader>
                    <CardContent>
                        <PhotoGallery roomTypeId={firstRoomTypeId} />
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/properties')}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Update Property' : 'Create Property'}
                </Button>
            </div>

            
          </form>
        </Form>
  )
}

    

    