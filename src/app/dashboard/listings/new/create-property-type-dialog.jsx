
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
import { Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"

const typeSchema = z.object({
  name: z.string().min(2, "Type name is required."),
})

export function CreatePropertyTypeDialog({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      name: "",
    },
  })

  const nameValue = form.watch("name");

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleCreateType = async (values) => {
    setIsSubmitting(true)
    try {
      const response = await api.post("property-references", {
        key: "property_type",
        value: values.name,
      })
      
      toast({
        title: "Property Type Created",
        description: `The type "${values.name}" has been successfully added.`,
      })

      onSuccess(response.data)
      form.reset()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Type",
        description: error.message || "An unknown error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                  <div className="relative">
                    <FormControl>
                      <Input placeholder="e.g., Bungalow, Cabin" {...field} />
                    </FormControl>
                    {nameValue && (
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
                        onClick={() => form.setValue("name", "")}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear</span>
                      </Button>
                    )}
                  </div>
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
