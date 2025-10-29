
"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, BedDouble, PlusCircle } from "lucide-react"
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
import { CreatePropertyDialog } from "./create-property-dialog"
import { PhotoGallery } from "./[roomTypeId]/photo-gallery"

const roomTypeSchema = z.object({
  property_id: z.coerce.number({ required_error: "Please select a property." }),
  name: z.string().min(3, "Room type name is required."),
  max_guests: z.coerce.number().min(1, "Max guests must be at least 1."),
})

export function GlobalRoomTypeForm() {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [isCreatePropertyOpen, setCreatePropertyOpen] = useState(false);
  const [createdRoomType, setCreatedRoomType] = useState(null); // New state to hold created room type
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      property_id: undefined,
      name: "",
      max_guests: 2,
    },
  })

  const fetchProperties = useCallback(async () => {
    try {
      const response = await api.get('properties');
      setProperties(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch properties." });
    }
  }, [toast]);
  
  useEffect(() => {
    async function initialFetch() {
        setLoading(true);
        await fetchProperties();
        setLoading(false);
    }
    initialFetch();
  }, [fetchProperties]);

  const handleNewPropertySuccess = (newProperty) => {
    fetchProperties().then(() => {
      form.setValue("property_id", newProperty.id, { shouldValidate: true });
    });
  };

  async function onSubmit(values) {
    setSubmitting(true)
    const payload = {
      name: values.name,
      max_guests: values.max_guests,
      property_id: values.property_id,
      property_ids: [values.property_id]
    };
    try {
      const response = await api.post('room-types', payload);
      toast({
        title: "Room Type Created",
        description: `Now you can add photos to your new room type.`,
      })
      setCreatedRoomType(response.data.data || response.data); // Set the created room type to switch to step 2
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
    return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
  }
  
  // If a room type has been created, show the photo gallery (Step 2)
  if (createdRoomType) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Add Photos</CardTitle>
                <CardDescription>
                    Upload photos for your newly created room type: <span className="font-bold">{createdRoomType.name}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PhotoGallery roomTypeId={createdRoomType.id} />
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.push(`/dashboard/room-types`)}>
                    Done
                </Button>
            </CardFooter>
        </Card>
    );
  }

  // Otherwise, show the creation form (Step 1)
  return (
    <>
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Step 1: Room Type Details</CardTitle>
            <CardDescription>
              Select a property, fill out the room type info, then you can add photos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map(prop => (
                          <SelectItem key={prop.id} value={prop.id.toString()}>{prop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setCreatePropertyOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <FormField
                control={form.control}
                name="max_guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} />
                    </FormControl>
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
                <BedDouble className="mr-2 h-4 w-4" />
              )}
              Save and Continue
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    <CreatePropertyDialog
        isOpen={isCreatePropertyOpen}
        onClose={() => setCreatePropertyOpen(false)}
        onSuccess={handleNewPropertySuccess}
    />
    </>
  )
}

    