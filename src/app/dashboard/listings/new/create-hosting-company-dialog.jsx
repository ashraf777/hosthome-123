
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

const companySchema = z.object({
  name: z.string().min(2, "Company name is required."),
})

export function CreateHostingCompanyDialog({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
    },
  })

  const handleCreateCompany = async (values) => {
    setIsSubmitting(true)
    
    // This is a placeholder for your API call
    console.log("Creating new hosting company:", values.name)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For UI demonstration, we'll create a new object with a temporary ID
    const newCompany = {
        id: Date.now(),
        name: values.name
    };

    onSuccess(newCompany)
    form.reset()
    onClose()
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Hosting Company</DialogTitle>
          <DialogDescription>
            Enter the name for the new hosting company.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateCompany)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Premier Stays LLC" {...field} />
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
                Create Company
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
