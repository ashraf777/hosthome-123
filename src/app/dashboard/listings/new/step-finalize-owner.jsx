
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  owner_user_id: z.any().optional(),
})

export function StepFinalizeOwner({ onBack, onFinish, initialData, propertyId, createdUnitIds }) {
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner_user_id: initialData?.id || undefined,
    },
  })

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('users')
      setUsers(usersRes.data)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch system users." })
    } finally {
        setLoading(false);
    }
  }, [toast])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const ownerId = data.owner_user_id ? Number(data.owner_user_id) : null;

    try {
        // 1. Update owner for all newly created units
        if (ownerId && createdUnitIds && createdUnitIds.length > 0) {
            const unitUpdatePromises = createdUnitIds.map(unitId => 
                api.put(`units/${unitId}`, { owner_user_id: ownerId })
            );
            await Promise.all(unitUpdatePromises);
            toast({ title: "Unit Owners Assigned", description: `${createdUnitIds.length} units have been assigned an owner.` });
        }

        // 2. Update property status to active (1)
        if (propertyId) {
            await api.put(`properties/${propertyId}`, { status: 1 });
            toast({ title: "Property Activated", description: "The property is now active." });
        }
        
        // 3. Finalize and redirect
        router.push("/dashboard/listings");
        router.refresh();
        toast({ title: "Wizard Complete!", description: "The new listing has been successfully created and activated." });

    } catch (error) {
        toast({ variant: "destructive", title: "Finalization Failed", description: error.message || "An error occurred during the final step." });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle>Step 5: Assign Unit Owner</CardTitle>
            <CardDescription>Select a system user to be the owner of the units you created. This is optional.</CardDescription>
          </CardHeader>
          
          {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="owner_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Owner</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name} ({user.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finish & Activate Property
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
