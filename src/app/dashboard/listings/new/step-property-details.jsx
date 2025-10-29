
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, X } from "lucide-react"
import { CreatePropertyTypeDialog } from "./create-property-type-dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const formSchema = z.object({
  property_id: z.any().optional(),
  create_new: z.boolean().default(false),
  name: z.string().optional(),
  address_line_1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip_code: z.string().optional(),
  property_type_ref_id: z.any().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  min_nights: z.coerce.number().optional(),
  max_nights: z.coerce.number().optional(),
  amenities: z.array(z.number()).optional(),
}).superRefine((data, ctx) => {
    if (data.create_new) {
        if (!data.name || data.name.length < 5) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Property name must be at least 5 characters.", path: ['name']});
        }
         if (!data.address_line_1 || data.address_line_1.length < 5) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a full address.", path: ['address_line_1']});
        }
         if (!data.city || data.city.length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required.", path: ['city']});
        }
         if (!data.zip_code || data.zip_code.length < 4) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Zip code is required.", path: ['zip_code']});
        }
        if (!data.property_type_ref_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a property type.", path: ['property_type_ref_id']});
        }
    } else {
        if (!data.property_id) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a property or create a new one.", path: ['property_id']});
        }
    }
});

export function StepPropertyDetails({ onNext, onBack, initialData }) {
  const [properties, setProperties] = React.useState([]);
  const [propertyTypes, setPropertyTypes] = React.useState([])
  const [amenities, setAmenities] = React.useState({});
  const [loading, setLoading] = React.useState(true)
  const [isCreateTypeOpen, setCreateTypeOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      property_id: undefined,
      create_new: false,
      name: "",
      address_line_1: "",
      city: "",
      state: "",
      country: "",
      zip_code: "",
      property_type_ref_id: undefined,
      check_in_time: "12:00",
      check_out_time: "11:00",
      min_nights: 1,
      max_nights: 0,
      amenities: [],
    },
  })
  
  const createNew = form.watch("create_new");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [propsRes, propTypesRes, amenitiesRes] = await Promise.all([
        api.get('properties'),
        api.get('property-references'),
        api.get('amenities')
      ]);

      setProperties(propsRes.data || []);
      setPropertyTypes(propTypesRes.property_type || []);

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
      } else {
        setAmenities({});
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch required data." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleNewTypeSuccess = (newTypeResponse) => {
    const newType = newTypeResponse.data || newTypeResponse;
    setPropertyTypes(prev => [...prev, newType]);
    form.setValue("property_type_ref_id", newType.id, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    if (data.create_new) {
        onNext({ propertyDetails: data })
    } else {
        const selectedProperty = properties.find(p => p.id === data.property_id);
        onNext({ propertyDetails: selectedProperty })
    }
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle>Step 2: Property</CardTitle>
          <CardDescription>Select an existing property, or add a new property.</CardDescription>
        </CardHeader>
        
        <div className="flex items-center space-x-2">
            <Switch id="create-new-switch" checked={createNew} onCheckedChange={(checked) => form.setValue("create_new", checked)} />
            <Label htmlFor="create-new-switch">Add new property</Label>
        </div>

        {createNew ? (
            <div className="space-y-6 p-4 border rounded-lg">
                <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Property Name</FormLabel>
                        <FormControl><Input placeholder="e.g., The Grand Coral Hotel" {...field} /></FormControl>
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
                        <div className="flex gap-2">
                            <Select key={propertyTypes.length} onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {propertyTypes.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>{type.value}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            {/* <Button type="button" variant="outline" onClick={() => setCreateTypeOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New
                            </Button> */}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Separator />
                <h3 className="text-lg font-medium text-foreground">Location</h3>

                <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <FormLabel>State</FormLabel>
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
                        <FormLabel>ZIP / Postal Code</FormLabel>
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

                <Separator />
                 <FormField
                  control={form.control}
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
            </div>
        ) : (
             <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Property</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select an existing property" />
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
        )}
        

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
    <CreatePropertyTypeDialog
        isOpen={isCreateTypeOpen}
        onClose={() => setCreateTypeOpen(false)}
        onSuccess={handleNewTypeSuccess}
    />
    </>
  )
}
