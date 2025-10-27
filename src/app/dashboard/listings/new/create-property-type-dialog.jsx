
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
import { Loader2 } from "lucide-react"

const typeSchema = z.object({
  name: z.string().min(2, "Type name is required."),
})

export function CreatePropertyTypeDialog({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      name: "",
    },
  })

  const handleCreateType = async (values) => {
    setIsSubmitting(true)
    
    // This is a placeholder as per user instruction.
    // In a real app, you would make an API call here.
    console.log("Creating new property type:", values.name)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For UI demonstration, we'll create a new object with a temporary ID and the correct `value` field.
    const newType = {
        id: Date.now(),
        value: values.name,
    };

    onSuccess(newType)
    form.reset()
    onClose()
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Property Type</DialogTitle>
          <DialogDescription>
            Enter the name for the new property type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateType)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bungalow, Cabin" {...field} />
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
                Create Type
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
