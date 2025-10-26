
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Loader2 } from "lucide-react"

const roomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_guests: z.coerce.number().min(1, "Max guests must be at least 1."),
  property_id: z.coerce.number(),
})

export function CreateRoomTypeDialog({ isOpen, onClose, onSuccess, propertyId }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: "",
      max_guests: 2,
      property_id: Number(propertyId),
    },
  })
  
  React.useEffect(() => {
    // Reset form when dialog opens or propertyId changes
    form.reset({
      name: "",
      max_guests: 2,
      property_id: Number(propertyId),
    });
  }, [isOpen, propertyId, form]);

  const handleCreateRoomType = async (values) => {
    setIsSubmitting(true)
    try {
      const response = await api.post("room-types", values)
      toast({
        title: "Room Type Created",
        description: `The room type "${values.name}" has been created.`,
      })
      onSuccess(response.data)
      form.reset()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create room type.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room Type</DialogTitle>
          <DialogDescription>
            Enter the details for the new room type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateRoomType)} className="space-y-4">
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Room Type
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
