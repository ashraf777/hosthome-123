
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const propertySchema = z.object({
  name: z.string().min(5, "Property name must be at least 5 characters."),
  property_owner_id: z.coerce.number({ required_error: "Please select a property owner." }),
  address_line_1: z.string().min(5, "Please enter a full address."),
  city: z.string().min(2, "City is required."),
  zip_code: z.string().min(4, "Zip code is required."),
  property_type_ref_id: z.coerce.number({ required_error: "Please select a property type." }),
  listing_status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

export function CreatePropertyDialog({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [owners, setOwners] = React.useState([])
  const [propertyTypes, setPropertyTypes] = React.useState([])
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address_line_1: "",
      city: "",
      zip_code: "",
      listing_status: "draft",
    },
  })

  React.useEffect(() => {
    if(isOpen) {
        const fetchDropdownData = async () => {
            try {
                const [ownersRes, propTypesRes] = await Promise.all([
                    api.get('property-owners'),
                    api.get('property-references')
                ]);
                setOwners(ownersRes.data);
                setPropertyTypes(propTypesRes.property_type || []);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch required data." });
            }
        }
        fetchDropdownData();
    }
  }, [isOpen, toast]);

  const handleCreateProperty = async (values) => {
    setIsSubmitting(true)
    try {
      const response = await api.post("properties", values)
      toast({
        title: "Property Created",
        description: `The property "${values.name}" has been created.`,
      })
      onSuccess(response.data)
      form.reset()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create property.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Property</DialogTitle>
          <DialogDescription>
            Enter the details for the new property. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateProperty)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl><Input placeholder="e.g., The Grand Coral Hotel" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="property_owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Owner</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                      <SelectContent>{owners.map(owner => (<SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="property_type_ref_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                      <SelectContent>{propertyTypes.map(type => (<SelectItem key={type.id} value={type.id.toString()}>{type.value}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="e.g., Anytown" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl><Input placeholder="e.g., 12345" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Property
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
