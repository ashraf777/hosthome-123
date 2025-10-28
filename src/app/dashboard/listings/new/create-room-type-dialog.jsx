
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
import { PhotoGallery } from "../../room-types/[roomTypeId]/photo-gallery"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

const roomTypeSchema = z.object({
  name: z.string().min(3, "Room type name is required."),
  max_guests: z.coerce.number().min(1, "Max guests must be at least 1."),
  max_adults: z.coerce.number().min(1, "Must have at least 1 adult."),
  max_children: z.coerce.number().min(0).default(0),
  room_size: z.coerce.number().optional(),
  weekday_price: z.coerce.number().optional(),
  weekend_price: z.coerce.number().optional(),
  property_id: z.coerce.number(),
  amenities: z.array(z.number()).optional(),
})

const mockAmenities = {
  "Room Amenities": [
    { id: 1, name: "Air Conditioning" },
    { id: 6, name: "TV" },
    { id: 7, name: "Washer" },
    { id: 8, name: "Dryer" },
  ],
  "Bathroom": [
    { id: 9, name: "Hair Dryer" },
    { id: 10, name: "Shampoo" },
    { id: 11, name: "Hot Water" },
  ],
  "Kitchen": [
    { id: 5, name: "Kitchen" },
    { id: 12, name: "Microwave" },
    { id: 13, name: "Refrigerator" },
    { id: 14, name: "Coffee Maker" },
  ],
  "General": [
     { id: 2, name: "Wi-Fi" },
     { id: 3, name: "Pool" },
     { id: 4, name: "Free Parking" },
  ]
};


export function CreateRoomTypeDialog({ isOpen, onClose, onSuccess, propertyId }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [createdRoomType, setCreatedRoomType] = React.useState(null)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: "",
      max_guests: 2,
      max_adults: 2,
      max_children: 0,
      property_id: Number(propertyId),
      amenities: [],
    },
  })
  
  React.useEffect(() => {
    if (isOpen) {
      // Reset state when dialog is re-opened
      setCreatedRoomType(null)
      form.reset({
        name: "",
        max_guests: 2,
        max_adults: 2,
        max_children: 0,
        property_id: Number(propertyId),
        amenities: [],
      });
    }
  }, [isOpen, propertyId, form]);

  const handleCreateRoomType = async (values) => {
    setIsSubmitting(true)
    try {
      // For demo, we simulate API call and response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = { ...values, id: Date.now() };
      setCreatedRoomType(mockResponse);
      toast({
        title: "Room Type Saved (Mock)",
        description: "Now you can add photos.",
      })
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

  const handleFinish = () => {
    if (createdRoomType) {
        onSuccess(createdRoomType);
    }
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="sm:max-w-3xl">
        {!createdRoomType ? (
            <>
            <DialogHeader>
                <DialogTitle>Create New Room Type</DialogTitle>
                <DialogDescription>
                Enter the details for the new room type.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateRoomType)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
                    <h3 className="text-lg font-medium">Basic Information</h3>
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
                         <FormField
                            control={form.control}
                            name="room_size"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Size (sqft)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 400" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="weekday_price"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Weekday Pricing ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 150" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="weekend_price"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Weekend Pricing ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 200" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator />
                    <h3 className="text-lg font-medium">Max Occupancy</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="max_adults"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Adults</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="max_children"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Children</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
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
                                <div className="mb-4">
                                    <FormLabel className="text-lg font-medium">Amenities</FormLabel>
                                    <FormMessage />
                                </div>
                                <div className="space-y-6">
                                {Object.entries(mockAmenities).map(([category, items]) => (
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
                            </FormItem>
                        )}
                    />

                    <DialogFooter className="pt-4">
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save & Add Photos
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
            </>
        ) : (
            <>
             <DialogHeader>
                <DialogTitle>Add Photos to: {createdRoomType.name}</DialogTitle>
                <DialogDescription>
                  Upload photos for your new room type. This step is optional.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-y-auto p-1">
                <PhotoGallery roomTypeId={createdRoomType.id} />
            </div>
            <DialogFooter>
                <Button onClick={handleFinish}>
                    Done
                </Button>
            </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  )
}
