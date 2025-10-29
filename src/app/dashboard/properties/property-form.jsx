
"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Home, PlusCircle } from "lucide-react"
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
import { CreatePropertyOwnerDialog } from "../listings/create-property-owner-dialog"

const propertySchema = z.object({
  name: z.string().min(5, "Property name must be at least 5 characters."),
  property_owner_id: z.coerce.number({ required_error: "Please select a property owner." }),
  address_line_1: z.string().min(5, "Please enter a full address."),
  city: z.string().min(2, "City is required."),
  zip_code: z.string().min(4, "Zip code is required."),
  property_type_ref_id: z.coerce.number({ required_error: "Please select a property type." }),
  listing_status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

export function GlobalPropertyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [isCreateOwnerOpen, setCreateOwnerOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address_line_1: "",
      city: "",
      zip_code: "",
      listing_status: "draft",
    },
  });

  const fetchDropdownData = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    fetchDropdownData().finally(() => setLoading(false));
  }, [fetchDropdownData]);

  const handleNewOwnerSuccess = (newOwner) => {
    fetchDropdownData().then(() => {
      form.setValue("property_owner_id", newOwner.id, { shouldValidate: true });
    });
  };

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("properties", values);
      toast({
        title: "Property Created",
        description: `The property "${values.name}" has been created.`,
      });
      router.push("/dashboard/properties");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create property.",
      });
    } finally {
      setSubmitting(false);
    }
  }
  
  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-40" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
        </Card>
    );
  }

  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>New Property Details</CardTitle>
              <CardDescription>
                Enter the details for the new property.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      <div className="flex gap-2">
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                          <SelectContent>{owners.map(owner => (<SelectItem key={owner.id} value={owner.id.toString()}>{owner.full_name}</SelectItem>))}</SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => setCreateOwnerOpen(true)}><PlusCircle className="h-4 w-4" /></Button>
                      </div>
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
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Property
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <CreatePropertyOwnerDialog
        isOpen={isCreateOwnerOpen}
        onClose={() => setCreateOwnerOpen(false)}
        onSuccess={handleNewOwnerSuccess}
      />
    </>
  )
}
