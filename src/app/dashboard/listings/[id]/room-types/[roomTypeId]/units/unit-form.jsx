
"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { Skeleton } from "@/components/ui/skeleton"

const unitFormSchema = z.object({
  unit_identifier: z.string().min(1, "Unit identifier is required."),
  status: z.enum(['available', 'maintenance', 'owner_use']),
  room_type_id: z.coerce.number(),
  unit_type_ref_id: z.coerce.number().optional(), // This is optional for now
})

export function UnitForm({ isEditMode = false, propertyId, roomTypeId, unitId }) {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      unit_identifier: "",
      status: "available",
      room_type_id: Number(roomTypeId),
    },
  })
  
  useEffect(() => {
    async function fetchData() {
        if (isEditMode && unitId) {
            try {
                const response = await api.get(`units/${unitId}`);
                form.reset(response.data);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch unit data." });
            }
        }
        setLoading(false);
    }
    fetchData();
  }, [isEditMode, unitId, form, toast]);

  async function onSubmit(values) {
    setSubmitting(true)
    try {
      if (isEditMode) {
        await api.put(`units/${unitId}`, values);
      } else {
        await api.post('units', values);
      }

      toast({
        title: isEditMode ? "Unit Updated" : "Unit Created",
        description: `The unit has been successfully ${isEditMode ? 'updated' : 'created'}.`,
      })
      router.push(`/dashboard/listings/${propertyId}/room-types/${roomTypeId}/units`);
      router.refresh();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "An error occurred",
        description: error.message || "Something went wrong.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Unit Details</CardTitle>
            <CardDescription>
              Fill out the details for this specific unit.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="unit_identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Identifier</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 101, Apartment 3B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="owner_use">Owner Use</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Unit' : 'Create Unit'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
