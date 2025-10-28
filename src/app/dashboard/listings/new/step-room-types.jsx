
"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { CreateRoomTypeDialog } from "./create-room-type-dialog"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  roomTypes: z.array(z.object({
    id: z.any(),
    name: z.string(),
    max_guests: z.number(),
    units_count: z.number().default(0), // For display
  })).min(1, "Please add at least one room type."),
});

const mockRoomTypes = [
    { id: 201, name: "Deluxe King", max_guests: 2, units_count: 5 },
    { id: 202, name: "Standard Queen", max_guests: 2, units_count: 10 },
    { id: 203, name: "Family Suite", max_guests: 4, units_count: 2 },
];


export function StepRoomTypes({ onNext, onBack, initialData, propertyId }) {
  const [isCreateOpen, setCreateOpen] = React.useState(false)
  const [existingRoomTypes, setExistingRoomTypes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomTypes: initialData || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "roomTypes",
  });

  React.useEffect(() => {
    if (!propertyId) return
    const fetchExisting = async () => {
      setLoading(true)
      try {
        const res = await api.get(`room-types?property_id=${propertyId}`)
        // Use mock data if API returns empty for demo purposes
        setExistingRoomTypes(res.data?.length > 0 ? res.data : mockRoomTypes)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch existing room types. Using mock data.'})
        setExistingRoomTypes(mockRoomTypes);
      } finally {
        setLoading(false)
      }
    }
    fetchExisting()
  }, [propertyId, toast])

  const handleCreateSuccess = (newRoomType) => {
    const isAlreadyAdded = fields.some(field => field.id === newRoomType.id);
    if (!isAlreadyAdded) {
      append(newRoomType);
    }
    // Also add to existing list so it can't be added again
    setExistingRoomTypes(prev => [...prev, newRoomType]);
  }

  const onSubmit = (data) => {
    onNext({ roomTypes: data.roomTypes });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader className="p-0 mb-6">
            <div className="flex justify-between items-start">
              <div>
                  <CardTitle>Step 3: Define Room Types</CardTitle>
                  <CardDescription>Add the room types available for this property.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Room Type
              </Button>
            </div>
          </CardHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 border rounded-lg p-4">
              {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/30">
                      <div>
                        <p className="font-semibold">{field.name}</p>
                        <p className="text-sm text-muted-foreground">Max Guests: {field.max_guests}</p>
                      </div>
                       <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                       >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove Room Type</span>
                      </Button>
                  </div>
              ))}
              {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No room types added yet. Click "Create New Room Type" to add one.</p>
              )}
          </div>
          {form.formState.errors.roomTypes && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.roomTypes.message}</p>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </Form>
      <CreateRoomTypeDialog
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        propertyId={propertyId}
      />
    </>
  )
}
