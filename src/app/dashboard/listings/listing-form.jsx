"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Home, BedDouble, DollarSign, List, Image as ImageIcon } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

const listingFormSchema = z.object({
  name: z.string().min(5, "Property name must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  status: z.string({ required_error: "Please select a status." }),
  roomType: z.string({ required_error: "Please select a room type." }),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  instantBook: z.boolean().default(false),
  address: z.string().min(10, "Please enter a full address."),
  amenities: z.string().min(5, "List at least one amenity."),
  imageUrl: z.string().url("Please enter a valid image URL.").optional(),
  imageHint: z.string().optional(),
})


export function ListingForm({ isEditMode = false, listingId }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Listed",
      roomType: "Entire Place",
      price: 100,
      instantBook: true,
      address: "",
      amenities: "Wi-Fi, Kitchen, Free Parking",
      imageUrl: "https://picsum.photos/seed/prop-new/800/600",
      imageHint: "apartment interior",
    },
  })

  useEffect(() => {
    if (isEditMode && listingId) {
      setLoading(true);
      const fetchListing = async () => {
        try {
          const response = await fetch(`/api/listings/${listingId}`);
          if (!response.ok) throw new Error("Failed to fetch listing");
          const data = await response.json();
          form.reset(data);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not fetch listing data." });
        } finally {
          setLoading(false);
        }
      };
      fetchListing();
    }
  }, [isEditMode, listingId, form, toast]);


  async function onSubmit(values) {
    setLoading(true)
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/listings/${listingId}` : '/api/listings';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update listing' : 'Failed to create listing');
      }

      toast({
        title: isEditMode ? "Listing Updated" : "Listing Created",
        description: `The property listing has been successfully ${isEditMode ? 'updated' : 'saved'}.`,
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
      setLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Fill out the information below to {isEditMode ? 'update your' : 'create a new'} listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
             {loading && isEditMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                  <div className="h-20 w-full bg-muted rounded-md animate-pulse" />
                </div>
              </div>
            ) : (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cozy Downtown Apartment" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your beautiful property to guests..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St, Anytown, USA 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="status"
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
                          <SelectItem value="Listed">Listed</SelectItem>
                          <SelectItem value="Unlisted">Unlisted</SelectItem>
                          <SelectItem value="In-progress">In-progress</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Entire Place">Entire Place</SelectItem>
                          <SelectItem value="Private Room">Private Room</SelectItem>
                          <SelectItem value="Shared Room">Shared Room</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (per night)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="number" placeholder="100" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                  <FormField
                      control={form.control}
                      name="amenities"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Amenities</FormLabel>
                          <FormControl>
                              <Input placeholder="e.g., Wi-Fi, Pool, Gym, Free Parking" {...field} />
                          </FormControl>
                          <FormDescription>
                              Separate amenities with a comma.
                          </FormDescription>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="instantBook"
                      render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                  Instant Booking
                                  </FormLabel>
                                  <FormDescription>
                                  Allow guests to book without needing your approval.
                                  </FormDescription>
                              </div>
                              <FormControl>
                                  <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  />
                              </FormControl>
                          </FormItem>
                      )}
                  />
              </div>
              
              <Separator />
              
              <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <ImageIcon className="w-5 h-5" />
                      Photos
                  </h3>
                   <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                              <Input placeholder="https://picsum.photos/seed/prop1/800/600" {...field} />
                          </FormControl>
                          <FormDescription>
                              Enter a URL for the property image.
                          </FormDescription>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
            </>
           )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Home className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Listing' : 'Create Listing'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
