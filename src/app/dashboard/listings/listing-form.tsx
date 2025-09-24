"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Home, BedDouble, DollarSign, List, Image as ImageIcon } from "lucide-react"

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
  photos: z.string().optional(), // In a real app, this would be a file upload
})

interface ListingFormProps {
  isEditMode?: boolean;
}

export function ListingForm({ isEditMode = false }: ListingFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof listingFormSchema>>({
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
    },
  })

  function onSubmit(values: z.infer<typeof listingFormSchema>) {
    setLoading(true)
    console.log(values)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: isEditMode ? "Listing Updated" : "Listing Created",
        description: `The property listing has been successfully ${isEditMode ? 'updated' : 'saved'}.`,
      })
      setLoading(false)
    }, 1500)
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" multiple />
                    </label>
                </div> 
             </div>

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
