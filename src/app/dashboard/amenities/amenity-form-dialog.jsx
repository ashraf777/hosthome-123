
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  amenities_reference_id: z.coerce.number({ required_error: "Please select a category." }),
  specific_name: z.string().min(2, "Amenity name is required."),
  type: z.coerce.number({ required_error: "Please select a type." }),
  status: z.boolean(),
})

export function AmenityFormDialog({ isOpen, onClose, onSuccess, initialData, amenityReferences }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  
  const isEditMode = !!initialData;

  const form = useForm({
    resolver: zodResolver(formSchema),
  })

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        amenities_reference_id: initialData?.amenities_reference_id || undefined,
        specific_name: initialData?.specific_name || "",
        type: initialData?.type || 3,
        status: initialData ? initialData.status === 1 : true,
      });
    }
  }, [isOpen, initialData, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    const payload = {
      ...values,
      status: values.status ? 1 : 0,
    };

    try {
      if (isEditMode) {
        await api.put(`amenities/${initialData.id}`, payload);
        toast({ title: "Success", description: "Amenity updated successfully." });
      } else {
        await api.post("amenities", payload);
        toast({ title: "Success", description: "Amenity created successfully." });
      }
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save the amenity.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Create"} Amenity</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this amenity." : "Add a new specific amenity."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="amenities_reference_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {amenityReferences.map(ref => (
                          <SelectItem key={ref.id} value={ref.id.toString()}>{ref.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specific_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Hair Dryer, Coffee Maker" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select where this amenity applies" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Property Only</SelectItem>
                      <SelectItem value="2">Room Type Only</SelectItem>
                      <SelectItem value="3">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                     <FormMessage />
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
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Amenity"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
