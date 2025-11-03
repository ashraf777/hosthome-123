
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
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Category name is required."),
  type: z.coerce.number({ required_error: "Please select a type." }),
})

export function AmenityReferenceFormDialog({ isOpen, onClose, onSuccess, initialData }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  
  const isEditMode = !!initialData;

  const form = useForm({
    resolver: zodResolver(formSchema),
  })

  React.useEffect(() => {
    if (isOpen) {
      form.reset(initialData || { name: "", type: 3 });
    }
  }, [isOpen, initialData, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await api.put(`amenities-references/${initialData.id}`, values);
        toast({ title: "Success", description: "Category updated successfully." });
      } else {
        await api.post("amenities-references", values);
        toast({ title: "Success", description: "Category created successfully." });
      }
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save the category.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit" : "Create"} Amenity Category</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this category." : "Add a new category to group amenities."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kitchen, Safety Features" {...field} />
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
                        <SelectValue placeholder="Select where this category applies" />
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
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
