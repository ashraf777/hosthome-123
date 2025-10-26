
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
  FormDescription,
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
import { Separator } from "@/components/ui/separator"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CreatePropertyOwnerDialog } from "./create-property-owner-dialog.jsx"


const listingFormSchema = z.object({
  name: z.string().min(5, "Property name must be at least 5 characters."),
  property_owner_id: z.coerce.number({ required_error: "Please select a property owner." }),
  address_line_1: z.string().min(5, "Please enter a full address."),
  city: z.string().min(2, "City is required."),
  zip_code: z.string().min(4, "Zip code is required."),
  timezone: z.string().optional(),
  property_type_ref_id: z.coerce.number({ required_error: "Please select a property type." }),
  listing_status: z.enum(['draft', 'active', 'archived'], { required_error: "Please select a status." }),
})


export function ListingForm({ isEditMode = false, listingId }) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [isCreateOwnerOpen, setCreateOwnerOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: "",
      property_owner_id: undefined,
      address_line_1: "",
      city: "",
      zip_code: "",
      timezone: "utc-5",
      listing_status: "draft",
      property_type_ref_id: undefined,
    },
  })

  const fetchOwners = useCallback(async () => {
    try {
        const ownersRes = await api.get('property-owners');
        setOwners(ownersRes.data);
    } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Could not fetch property owners." });
    }
  }, [toast]);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        await fetchOwners();
        const propTypesRes = await api.get('property-references');
        setPropertyTypes(propTypesRes.property_type || []);
        
        if (isEditMode && listingId) {
          const response = await api.get(`properties/${listingId}`);
          form.reset(response.data);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch required data for the form." });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEditMode, listingId, form, toast, fetchOwners]);

  const handleNewOwnerSuccess = (newOwner) => {
    fetchOwners().then(() => {
        form.setValue("property_owner_id", newOwner.id, { shouldValidate: true });
    });
  }


  async function onSubmit(values) {
    setSubmitting(true)
    
    try {
      if (isEditMode) {
        await api.put(`properties/${listingId}`, values);
      } else {
        await api.post('properties', values);
      }

      toast({
        title: isEditMode ? "Property Updated" : "Property Created",
        description: `The property has been successfully ${isEditMode ? 'updated' : 'saved'}.`,
      })
      router.push('/dashboard/listings');
      router.refresh();
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
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full max-w-sm" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                 </div>
              </CardContent>
              <CardFooter>
                 <Skeleton className="h-10 w-32" />
              </CardFooter>
          </Card>
      )
  }

  return (
    <>
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Fill out the information below to {isEditMode ? 'update your' : 'create a new'} property.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Grand Coral Hotel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="property_owner_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Owner</FormLabel>
                       <div className="flex gap-2">
                         <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an owner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {owners.map(owner => (
                              <SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => setCreateOwnerOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Owner
                        </Button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <Separator />
              <h3 className="text-md font-medium">Location</h3>

              <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Anytown" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="e.g., 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
               <h3 className="text-md font-medium">Listing Details</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <FormField
                  control={form.control}
                  name="property_type_ref_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {propertyTypes.map(type => (
                              <SelectItem key={type.id} value={type.id.toString()}>{type.value}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a timezone" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="utc-8">Pacific Time (UTC-08:00)</SelectItem>
                                <SelectItem value="utc-7">Mountain Time (UTC-07:00)</SelectItem>
                                <SelectItem value="utc-6">Central Time (UTC-06:00)</SelectItem>
                                <SelectItem value="utc-5">Eastern Time (UTC-05:00)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Home className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Property' : 'Create Property'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    
    <CreatePropertyOwnerDialog 
        isOpen={isCreateOwnerOpen}
        onClose={() => setCreateOwnerOpen(false)}
        onSuccess={handleNewOwnerSuccess}
    />
    </>
  )
}
