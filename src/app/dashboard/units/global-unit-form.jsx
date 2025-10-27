
"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, KeyRound, PlusCircle } from "lucide-react"
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
import { CreateRoomTypeDialog } from "./create-room-type-dialog"
import { CreatePropertyDialog } from "../room-types/create-property-dialog"
import { PhotoGallery } from "../room-types/[roomTypeId]/photo-gallery"

const unitFormSchema = z.object({
  property_id: z.coerce.number({ required_error: "Please select a property." }),
  room_type_id: z.coerce.number({ required_error: "Please select a room type." }),
  unit_identifier: z.string().min(1, "Unit identifier is required."),
  status: z.enum(['available', 'maintenance', 'owner_use']),
})

export function GlobalUnitForm() {
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isRoomTypeLoading, setIsRoomTypeLoading] = useState(false);
  const [isCreateRoomTypeOpen, setCreateRoomTypeOpen] = useState(false);
  const [isCreatePropertyOpen, setCreatePropertyOpen] = useState(false);
  const [createdUnit, setCreatedUnit] = useState(null);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      property_id: undefined,
      room_type_id: undefined,
      unit_identifier: "",
      status: "available",
    },
  })

  const selectedPropertyId = form.watch("property_id");

  const fetchProperties = useCallback(async () => {
    try {
        const response = await api.get('properties');
        setProperties(response.data);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch properties." });
    }
  }, [toast]);

  const fetchRoomTypes = useCallback(async (propertyId) => {
    if (!propertyId) {
      setRoomTypes([]);
      return;
    }
    setIsRoomTypeLoading(true);
    try {
      const response = await api.get(`room-types?property_id=${propertyId}`);
      setRoomTypes(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch room types." });
      setRoomTypes([]);
    } finally {
      setIsRoomTypeLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    async function initialFetch() {
        setLoading(true);
        await fetchProperties();
        setLoading(false);
    }
    initialFetch();
  }, [fetchProperties]);

  useEffect(() => {
    form.setValue("room_type_id", undefined);
    fetchRoomTypes(selectedPropertyId);
  }, [selectedPropertyId, fetchRoomTypes, form]);

  const handleNewPropertySuccess = (newProperty) => {
    fetchProperties().then(() => {
      form.setValue("property_id", newProperty.id, { shouldValidate: true });
    });
  };

  const handleNewRoomTypeSuccess = (newRoomType) => {
    fetchRoomTypes(selectedPropertyId).then(() => {
      form.setValue("room_type_id", newRoomType.id, { shouldValidate: true });
    });
  };

  const handleCreateRoomTypeClick = () => {
    if (!selectedPropertyId) {
      toast({
        variant: "destructive",
        title: "Property Not Selected",
        description: "Please select a property before creating a new room type.",
      });
      return;
    }
    setCreateRoomTypeOpen(true);
  };

  async function onSubmit(values) {
    setSubmitting(true)
    const { property_id, ...submissionValues } = values;

    try {
      const response = await api.post('units', submissionValues);
      toast({
        title: "Unit Created",
        description: `Now you can manage it.`,
      })
      setCreatedUnit(response.data);
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
    return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
  }
  
  if (createdUnit) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Unit Created: {createdUnit.unit_identifier}</CardTitle>
                <CardDescription>
                    This unit has been successfully created under the Room Type "{createdUnit.room_type.name}".
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can now manage this unit from the "Units" or "Listings" section of the dashboard.</p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.push(`/dashboard/units`)}>
                    Done
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <>
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create New Unit</CardTitle>
            <CardDescription>
              First select a property, then a room type to create a new unit.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <div className="flex gap-2">
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {properties.map(prop => (
                            <SelectItem key={prop.id} value={prop.id.toString()}>{prop.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => setCreatePropertyOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="room_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <div className="flex gap-2">
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()} disabled={!selectedPropertyId || isRoomTypeLoading}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder={isRoomTypeLoading ? "Loading..." : "Select a room type"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {roomTypes.map(rt => (
                            <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={handleCreateRoomTypeClick}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New
                        </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              Create Unit
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
    <CreatePropertyDialog
        isOpen={isCreatePropertyOpen}
        onClose={() => setCreatePropertyOpen(false)}
        onSuccess={handleNewPropertySuccess}
    />
    {selectedPropertyId && (
        <CreateRoomTypeDialog
            isOpen={isCreateRoomTypeOpen}
            onClose={() => setCreateRoomTypeOpen(false)}
            onSuccess={handleNewRoomTypeSuccess}
            propertyId={selectedPropertyId}
        />
    )}
    </>
  )
}
