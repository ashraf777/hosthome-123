
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Separator } from "@/components/ui/separator"
import { PlusCircle } from "lucide-react"
import { CreatePropertyTypeDialog } from "./create-property-type-dialog"

const formSchema = z.object({
  name: z.string().min(5, "Property name must be at least 5 characters."),
  address_line_1: z.string().min(5, "Please enter a full address."),
  city: z.string().min(2, "City is required."),
  zip_code: z.string().min(4, "Zip code is required."),
  property_type_ref_id: z.coerce.number().optional(),
})

export function StepPropertyDetails({ onNext, initialData }) {
  const [propertyTypes, setPropertyTypes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCreateTypeOpen, setCreateTypeOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      address_line_1: "",
      city: "",
      zip_code: "",
      property_type_ref_id: undefined,
    },
  })

  React.useEffect(() => {
    async function fetchPropTypes() {
      try {
        const propTypesRes = await api.get('property-references')
        setPropertyTypes(propTypesRes.property_type || [])
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch property types." })
      } finally {
        setLoading(false)
      }
    }
    fetchPropTypes()
  }, [toast])
  
  const handleNewTypeSuccess = (newType) => {
    setPropertyTypes(prev => [...prev, newType]);
    form.setValue("property_type_ref_id", newType.id, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    onNext({ propertyDetails: data })
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle>Step 1: Property Details</CardTitle>
          <CardDescription>Start by entering the basic details of your property.</CardDescription>
        </CardHeader>
        
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
        
        <FormField
          control={form.control}
          name="property_type_ref_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a property type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>{type.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={() => setCreateTypeOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <h3 className="text-md font-medium text-foreground">Location</h3>

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <FormLabel>ZIP / Postal Code</FormLabel>
                <FormControl><Input placeholder="e.g., 12345" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
    <CreatePropertyTypeDialog
        isOpen={isCreateTypeOpen}
        onClose={() => setCreateTypeOpen(false)}
        onSuccess={handleNewTypeSuccess}
    />
    </>
  )
}
