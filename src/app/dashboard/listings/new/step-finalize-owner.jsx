
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { CreatePropertyOwnerDialog } from "../create-property-owner-dialog.jsx"

const formSchema = z.object({
  property_owner_id: z.any().optional(),
})

export function StepFinalizeOwner({ onBack, onFinish, initialData, hostingCompanyId }) {
  const [owners, setOwners] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCreateOwnerOpen, setCreateOwnerOpen] = React.useState(false)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_owner_id: initialData?.id || undefined,
    },
  })

  const fetchOwners = React.useCallback(async () => {
    setLoading(true);
    try {
      const ownersRes = await api.get('property-owners')
      setOwners(ownersRes.data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch property owners." })
    } finally {
        setLoading(false);
    }
  }, [toast])

  React.useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  const handleNewOwnerSuccess = (newOwnerResponse) => {
    const newOwner = newOwnerResponse.data || newOwnerResponse;
    setOwners(prev => [...prev, newOwner]);
    form.setValue("property_owner_id", newOwner.id, { shouldValidate: true });
  }

  const onSubmit = (data) => {
    const selectedOwner = data.property_owner_id ? owners.find(o => o.id === data.property_owner_id) : null;
    onFinish({ owner: selectedOwner });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle>Step 5: Assign Owner</CardTitle>
            <CardDescription>Select the property owner. This is optional.</CardDescription>
          </CardHeader>
          
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="property_owner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Owner</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an owner (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {owners.map(owner => (
                          <SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setCreateOwnerOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Owner
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Finish & Save Property</Button>
          </div>
        </form>
      </Form>
      
      <CreatePropertyOwnerDialog
        isOpen={isCreateOwnerOpen}
        onClose={() => setCreateOwnerOpen(false)}
        onSuccess={handleNewOwnerSuccess}
        hostingCompanyId={hostingCompanyId}
      />
    </>
  )
}
