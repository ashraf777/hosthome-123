
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Loader2, BedDouble } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

const bookingFormSchema = z.object({
  property_unit_id: z.coerce.number({ required_error: "Please select a unit." }),
  guest_id: z.coerce.number({ required_error: "Please select a guest." }),
  check_in_date: z.date({ required_error: "Check-in date is required." }),
  check_out_date: z.date({ required_error: "Check-out date is required." }),
  total_price: z.coerce.number().min(0, "Total price must be a positive number."),
  guest_count: z.coerce.number().min(1, "Guest count must be at least 1."),
  status: z.enum(['confirmed', 'cancelled', 'checked_in', 'checked_out']),
  channel_source: z.string().optional(),
})


export function BookingForm({ isEditMode = false, bookingId }) {
  const [submitting, setSubmitting] = useState(false)
  const [formLoading, setFormLoading] = useState(true);
  const [units, setUnits] = useState([])
  const [guests, setGuests] = useState([])
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      status: "confirmed",
      guest_count: 1,
      total_price: 100,
      channel_source: 'Direct'
    },
  })

   useEffect(() => {
    async function fetchFormData() {
      setFormLoading(true);
      try {
        const [unitsRes, guestsRes] = await Promise.all([
          api.get('units'),
          api.get('guests')
        ]);
        setUnits(unitsRes.data);
        setGuests(guestsRes.data);

        if (isEditMode && bookingId) {
          const { data: bookingData } = await api.get(`bookings/${bookingId}`);
          const formattedBookingData = {
            ...bookingData,
            check_in_date: new Date(bookingData.check_in_date),
            check_out_date: new Date(bookingData.check_out_date),
          };
          form.reset(formattedBookingData);
        }
      } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Could not fetch required data." });
      } finally {
        setFormLoading(false);
      }
    }
    fetchFormData();
  }, [isEditMode, bookingId, form, toast]);


  async function onSubmit(values) {
    setSubmitting(true)
    const formattedValues = {
        ...values,
        check_in_date: values.check_in_date.toISOString().split('T')[0],
        check_out_date: values.check_out_date.toISOString().split('T')[0],
    }
    
    try {
      if (isEditMode) {
        await api.put(`bookings/${bookingId}`, formattedValues);
      } else {
        await api.post('bookings', formattedValues);
      }
      
      toast({
        title: isEditMode ? "Booking Updated" : "Booking Created",
        description: `The booking has been successfully ${isEditMode ? 'updated' : 'saved'}.`,
      })
      router.push('/dashboard/booking');
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

  if (formLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </CardHeader>
        <CardContent className="grid gap-6">
          {Array.from({length: 4}).map((_, i) => (
             <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
               <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-36" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>
              Manually add a new booking to your calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channel_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Direct">Direct</SelectItem>
                        <SelectItem value="Airbnb">Airbnb</SelectItem>
                        <SelectItem value="Booking.com">Booking.com</SelectItem>
                        <SelectItem value="Expedia">Expedia</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="check_in_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-in Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_out_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="guest_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest</FormLabel>
                       <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a guest" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guests.map(guest => (
                            <SelectItem key={guest.id} value={guest.id.toString()}>{guest.first_name} {guest.last_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="property_unit_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Unit</FormLabel>
                       <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                              {unit.unit_identifier} ({unit.room_type?.property?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <FormField
                  control={form.control}
                  name="total_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guest_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} />
                      </FormControl>
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
                <BedDouble className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Booking' : 'Create Booking'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
