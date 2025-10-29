
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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

const roomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_guests: z.coerce.number().min(1, "Max guests must be at least 1."),
})

export function RoomTypeForm({ isEditMode = false, propertyId, roomTypeId }) {
  const [submitting, setSubmitting] = useState(false)
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: "",
      max_guests: 2,
    },
  })
  
  useEffect(() => {
    if (isEditMode && roomTypeId) {
      setFormLoading(true);
      const fetchRoomType = async () => {
        try {
          const response = await api.get(`room-types/${roomTypeId}`);
          form.reset(response.data);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not fetch room type data." });
        } finally {
          setFormLoading(false);
        }
      };
      fetchRoomType();
    }
  }, [isEditMode, roomTypeId, form, toast]);

  async function onSubmit(values) {
    setSubmitting(true)
    
    try {
      if (isEditMode) {
        await api.put(`room-types/${roomTypeId}`, values);
        toast({
          title: "Room Type Updated",
          description: `The room type has been successfully updated.`,
        })
        router.push(`/dashboard/listings/${propertyId}/room-types`);
        router.refresh();
      } else {
        const payload = {
          ...values,
          property_id: Number(propertyId),
          property_ids: [Number(propertyId)]
        };
        const response = await api.post('room-types', payload);
        toast({
          title: "Room Type Created",
          description: `Now you can add photos to your new room type.`,
        })
        router.push(`/dashboard/room-types/${response.data.id}`);
      }

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

  if (formLoading && isEditMode) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Room Type Details</CardTitle>
            <CardDescription>
              Fill out the details for the room type. You can add photos after creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
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
              {isEditMode ? 'Update Room Type' : 'Save and Add Photos'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

    