
"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Loader2, BedDouble, PlusCircle, Trash2 } from "lucide-react"
import { format, differenceInDays } from "date-fns"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AddGuestDialog } from "./add-guest-dialog"


const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  nationality: z.string().optional(),
  contact_number: z.string().optional(),
  state: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  passport_no: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  contact_number: z.string().optional(),
});

const vehicleSchema = z.object({
  number: z.string().min(1, "Vehicle number is required"),
});

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
});

const bookingFormSchema = z.object({
  property_id: z.coerce.number().optional(),
  room_type_id: z.coerce.number().optional(),
  property_unit_id: z.coerce.number({ required_error: "Please select a unit." }),
  check_in_date: z.date({ required_error: "Check-in date is required." }),
  check_out_date: z.date({ required_error: "Check-out date is required." }),
  total_price: z.coerce.number().min(0, "Total price must be a positive number.").default(0),
  guest_count: z.coerce.number().min(1, "Guest count must be at least 1.").default(1),
  status: z.enum(['confirmed', 'cancelled', 'checked_in', 'checked_out']),
  booking_type: z.string().optional(),
  booking_source: z.string().optional(),
  remarks: z.string().optional(),
  
  // Step 2 fields
  guests: z.array(guestSchema).optional(),
  emergency_contact: emergencyContactSchema.optional(),
  vehicles: z.array(vehicleSchema).optional(),
  items_provided: z.array(itemSchema).optional(),

  guest_id: z.coerce.number().optional(),

  // Step 3 fields
  early_checkin_fee: z.coerce.number().optional(),
  late_checkout_fee: z.coerce.number().optional(),
  shuttle_fee: z.coerce.number().optional(),
  transportation_fee: z.coerce.number().optional(),
  breakfast_fee: z.coerce.number().optional(),
  lunch_fee: z.coerce.number().optional(),
  dinner_fee: z.coerce.number().optional(),
  other_services_fee: z.coerce.number().optional(),
  cleaning_fee: z.coerce.number().optional(),
  extra_guest_fee: z.coerce.number().optional(),
  sales_tax: z.coerce.number().optional(),
  tourism_tax: z.coerce.number().optional(),
  heritage_tax: z.coerce.number().optional(),
  local_gov_tax: z.coerce.number().optional(),
  other_tax: z.coerce.number().optional(),
  ota_tax: z.coerce.number().optional(),
  payment_method: z.string().optional(),
  
  // Moved to payment card
  collected_amount: z.coerce.number().optional(),
  deposit_not_collected: z.boolean().default(false),
})

const STEPS = [
    { id: 1, title: 'Booking Details', fields: ['property_id', 'room_type_id', 'property_unit_id', 'check_in_date', 'check_out_date', 'total_price', 'guest_count'] },
    { id: 2, title: 'Guest Details', fields: ['guests', 'emergency_contact', 'vehicles', 'items_provided'] },
    { id: 3, title: 'Other Charges', fields: [
        'early_checkin_fee', 'late_checkout_fee', 'shuttle_fee', 'transportation_fee',
        'breakfast_fee', 'lunch_fee', 'dinner_fee', 'other_services_fee', 'cleaning_fee',
        'extra_guest_fee', 'sales_tax', 'tourism_tax', 'heritage_tax',
        'local_gov_tax', 'other_tax', 'ota_tax', 'payment_method'
    ] }
];

export function BookingForm({ isEditMode = false, bookingId }) {
  const [submitting, setSubmitting] = useState(false)
  const [formLoading, setFormLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [units, setUnits] = useState([])
  const [guests, setGuests] = useState([]) // For guest selection dialog
  const [currentStep, setCurrentStep] = useState(1);
  const [isAddGuestOpen, setAddGuestOpen] = useState(false);

  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      status: "confirmed",
      guest_count: 1,
      total_price: 0,
      booking_type: 'Walk In',
      booking_source: 'HostPlatform',
      guests: [{ first_name: '', last_name: '' }],
      emergency_contact: { name: '', contact_number: '' },
      vehicles: [],
      items_provided: [],
      early_checkin_fee: 0,
      late_checkout_fee: 0,
      shuttle_fee: 0,
      transportation_fee: 0,
      breakfast_fee: 0,
      lunch_fee: 0,
      dinner_fee: 0,
      other_services_fee: 0,
      cleaning_fee: 0,
      extra_guest_fee: 0,
      sales_tax: 0,
      tourism_tax: 0,
      heritage_tax: 0,
      local_gov_tax: 0,
      other_tax: 0,
      ota_tax: 0,
      payment_method: 'Cash',
      collected_amount: 0,
      deposit_not_collected: false,
    },
  })
  
  const { fields: guestFields, append: appendGuest, remove: removeGuest } = useFieldArray({ control: form.control, name: "guests" });
  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({ control: form.control, name: "vehicles" });
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control: form.control, name: "items_provided" });

  const selectedPropertyId = form.watch("property_id");
  const selectedRoomTypeId = form.watch("room_type_id");
  const checkInDate = form.watch("check_in_date");
  const checkOutDate = form.watch("check_out_date");
  
  const formValues = form.watch();

  const numberOfNights = useMemo(() => {
    if (checkInDate && checkOutDate) {
      const diff = differenceInDays(checkOutDate, checkInDate);
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [checkInDate, checkOutDate]);

  const roomRate = useMemo(() => {
    return (formValues.total_price || 0) * numberOfNights;
  }, [formValues.total_price, numberOfNights]);

  const otherFees = useMemo(() => {
    const feeFields = [
      'early_checkin_fee', 'late_checkout_fee', 'shuttle_fee', 'transportation_fee',
      'breakfast_fee', 'lunch_fee', 'dinner_fee', 'other_services_fee', 'cleaning_fee',
      'extra_guest_fee', 'sales_tax', 'tourism_tax', 'heritage_tax',
      'local_gov_tax', 'other_tax', 'ota_tax'
    ];
    return feeFields.reduce((sum, field) => sum + (Number(formValues[field]) || 0), 0);
  }, [formValues]);

  const totalPrice = useMemo(() => {
    return roomRate + otherFees;
  }, [roomRate, otherFees]);

  const collectedAmount = formValues.collected_amount || 0;


  useEffect(() => {
    async function fetchInitialData() {
      setFormLoading(true);
      try {
        const propsRes = await api.get('properties');
        setGuests([]); // Keeping guests empty as requested
        
        const propertiesData = propsRes.data || []
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);

        if (isEditMode && bookingId) {
          const { data: bookingData } = await api.get(`bookings/${bookingId}`);
          const propertyId = bookingData.property_unit?.property?.id;
          const roomTypeId = bookingData.property_unit?.room_type_id;

          if (propertyId) {
             const roomTypesRes = await api.get(`properties/${propertyId}/room-types`);
             setRoomTypes(Array.isArray(roomTypesRes.data) ? roomTypesRes.data : []);
          }
          if (roomTypeId) {
             const unitsRes = await api.get(`units?room_type_id=${roomTypeId}`);
             setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
          }

          const formattedBookingData = {
            ...bookingData,
            property_id: propertyId,
            room_type_id: roomTypeId,
            property_unit_id: bookingData.property_unit_id,
            check_in_date: new Date(bookingData.check_in_date),
            check_out_date: new Date(bookingData.check_out_date),
            booking_type: 'Walk In',
            booking_source: 'HostPlatform'
          };
          form.reset(formattedBookingData);
        }
      } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Could not fetch required data." });
      } finally {
        setFormLoading(false);
      }
    }
    fetchInitialData();
  }, [isEditMode, bookingId, form, toast]);

  useEffect(() => {
    if (selectedPropertyId) {
        api.get(`properties/${selectedPropertyId}/room-types`).then(res => {
            const roomTypesData = Array.isArray(res.data) ? res.data : [];
            setRoomTypes(roomTypesData);
            setUnits([]);
            form.setValue('room_type_id', undefined);
            form.setValue('property_unit_id', undefined);
        });
    } else {
        setRoomTypes([]);
        setUnits([]);
    }
  }, [selectedPropertyId, form]);

  useEffect(() => {
    if (selectedRoomTypeId) {
      api.get(`units?room_type_id=${selectedRoomTypeId}`).then(res => {
        const unitsData = Array.isArray(res.data) ? res.data : [];
        setUnits(unitsData);
        form.setValue('property_unit_id', undefined);
        
        const selectedRoomType = roomTypes.find(rt => rt.id === Number(selectedRoomTypeId));
        if (selectedRoomType) {
            const newPrice = Number(selectedRoomType.weekday_price) || 0;
            form.setValue('total_price', newPrice);
        }

      });
    } else {
      setUnits([]);
      form.setValue('total_price', 0);
    }
  }, [selectedRoomTypeId, form, roomTypes]);

  const handleNextStep = async () => {
    const currentStepFields = STEPS.find(step => step.id === currentStep)?.fields || [];
    const isValid = await form.trigger(currentStepFields);
    
    if (isValid) {
      if (currentStep < STEPS.length) {
          setCurrentStep(currentStep + 1);
      }
    } else {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill out all required fields before proceeding.",
        });
    }
  };

  async function onSubmit(values) {
    setSubmitting(true);
    
    const mainGuest = values.guests && values.guests.length > 0 ? values.guests[0] : null;
    let guestId = values.guest_id;

    if (!guestId && mainGuest && mainGuest.first_name && mainGuest.last_name && mainGuest.email) {
      try {
        const guestResponse = await api.post("guests", {
          first_name: mainGuest.first_name,
          last_name: mainGuest.last_name,
          email: mainGuest.email,
          password: "password",
        });
        guestId = guestResponse.data.id;
        toast({ title: "Guest Created", description: `Main guest ${mainGuest.first_name} has been saved.` });
      } catch (error) {
         if (error.message.includes('email already exists')) {
             toast({ variant: "destructive", title: "Guest Exists", description: `A guest with email ${mainGuest.email} already exists. Please select them or use a different email.` });
             setSubmitting(false);
             return;
         }
         toast({ variant: "destructive", title: "Guest Creation Failed", description: error.message });
         setSubmitting(false);
         return;
      }
    }


    const formattedValues = {
        ...values,
        guest_id: guestId,
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
        title: isEditMode ? "Reservation Updated" : "Reservation Created",
        description: `The reservation has been successfully ${isEditMode ? 'updated' : 'saved'}.`,
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
      setSubmitting(false);
    }
  }

  const handleBack = () => {
    if(currentStep > 1) {
        setCurrentStep(currentStep - 1);
    }
  };

  const onGuestAdded = (newGuest) => {
    const guestData = newGuest.data || newGuest;
    setGuests(prev => [...prev, guestData]);
    form.setValue('guest_id', guestData.id, { shouldValidate: true });
    if (guestFields.length > 0) {
        form.setValue('guests.0.first_name', guestData.first_name);
        form.setValue('guests.0.last_name', guestData.last_name);
        form.setValue('guests.0.email', guestData.email);
    }
    setAddGuestOpen(false);
  }


  if (formLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
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
        <div className="lg:col-span-1">
            <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    )
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
              {STEPS.map(step => (
                  <div key={step.id} className="flex items-center gap-2">
                      <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg",
                          currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                          {step.id}
                      </div>
                      <span className={cn(
                          "font-medium",
                          currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                      )}>
                          {step.title}
                      </span>
                  </div>
              ))}
              </div>
              <Card>
                  
                      <CardHeader>
                          <CardTitle>Booking Details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-6">
                           {currentStep === 1 && (
                              <div className="space-y-6">
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
                                              <SelectItem value="confirmed">Confirm Reservation</SelectItem>
                                              <SelectItem value="cancelled">Cancelled</SelectItem>
                                              <SelectItem value="checked_in">Checked In</SelectItem>
                                              <SelectItem value="checked_out">Checked Out</SelectItem>
                                          </SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                      )}
                                  />
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <FormField control={form.control} name="check_in_date" render={({ field }) => (
                                      <FormItem className="flex flex-col"><FormLabel>Check-in</FormLabel>
                                          <Popover><PopoverTrigger asChild>
                                              <FormControl>
                                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                                  {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                              </Button>
                                              </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                          </Popover><FormMessage />
                                      </FormItem>
                                      )} />
                                      <FormField control={form.control} name="check_out_date" render={({ field }) => (
                                      <FormItem className="flex flex-col"><FormLabel>Check-out</FormLabel>
                                          <Popover><PopoverTrigger asChild>
                                              <FormControl>
                                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                                  {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                              </Button>
                                              </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                          </Popover><FormMessage />
                                      </FormItem>
                                      )} />
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                       <FormField control={form.control} name="property_id" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Property</FormLabel>
                                              <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger></FormControl>
                                              <SelectContent>{properties.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>))}</SelectContent>
                                              </Select><FormMessage />
                                          </FormItem>
                                          )} />
                                      <FormField control={form.control} name="room_type_id" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room Type</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()} disabled={!selectedPropertyId || roomTypes.length === 0}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={!selectedPropertyId ? "Select a property first" : "Select a room type"} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {roomTypes.map(rt => (<SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>))}
                                            </SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                        )} />
                                      <FormField control={form.control} name="property_unit_id" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Unit Listing</FormLabel>
                                          <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()} disabled={!selectedRoomTypeId || units.length === 0}>
                                          <FormControl><SelectTrigger><SelectValue placeholder={!selectedRoomTypeId ? "Select room type first" : "Select a unit"} /></SelectTrigger></FormControl>
                                          <SelectContent>
                                            {units.map(unit => (<SelectItem key={unit.id} value={unit.id.toString()}>{unit.unit_identifier}</SelectItem>))}
                                          </SelectContent>
                                          </Select><FormMessage />
                                      </FormItem>
                                      )} />
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                      <FormField control={form.control} name="total_price" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Room Rate Modifier</FormLabel>
                                              <FormControl><Input type="number" placeholder="e.g., 300" {...field} /></FormControl>
                                              <FormMessage />
                                          </FormItem>
                                          )} />
                                      <FormField control={form.control} name="guest_count" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Number of Pax</FormLabel>
                                          <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )} />
                                  </div>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                       <FormField control={form.control} name="booking_type" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Booking Type</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                          <SelectContent>
                                              <SelectItem value="Walk In">Walk In</SelectItem>
                                              <SelectItem value="Phone Call">Phone Call</SelectItem>
                                              <SelectItem value="Email">Email</SelectItem>
                                          </SelectContent>
                                          </Select><FormMessage />
                                      </FormItem>
                                      )} />
                                      <FormField control={form.control} name="booking_source" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Booking Source</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl><SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger></FormControl>
                                          <SelectContent>
                                              <SelectItem value="HostPlatform">HostPlatform</SelectItem>
                                              <SelectItem value="Direct">Direct</SelectItem>
                                              <SelectItem value="Airbnb">Airbnb</SelectItem>
                                              <SelectItem value="Booking.com">Booking.com</SelectItem>
                                              <SelectItem value="Expedia">Expedia</SelectItem>
                                              <SelectItem value="Other">Other</SelectItem>
                                          </SelectContent>
                                          </Select><FormMessage />
                                      </FormItem>
                                      )} />
                                  </div>
                                   <FormField control={form.control} name="remarks" render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Remarks (optional)</FormLabel>
                                          <FormControl><Textarea placeholder="Remarks goes here..." {...field} /></FormControl>
                                          <FormMessage />
                                      </FormItem>
                                      )} />
                              </div>
                           )}

                           {currentStep === 2 && (
                               <div className="space-y-6">
                                    <CardTitle>Guest Details</CardTitle>
                                    {guestFields.map((field, index) => (
                                    <div key={field.id} className="space-y-4 border p-4 rounded-md relative">
                                        {index > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={() => removeGuest(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`guests.${index}.first_name`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                                                <FormControl><Input placeholder="First Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`guests.${index}.last_name`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                                                <FormControl><Input placeholder="Last Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <FormField control={form.control} name={`guests.${index}.nationality`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nationality (Optional)</FormLabel>
                                                    <FormControl><Input placeholder="Select a Country" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`guests.${index}.contact_number`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Number</FormLabel>
                                                    <FormControl><Input placeholder="Contact Number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <FormField control={form.control} name={`guests.${index}.state`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State (Optional)</FormLabel>
                                                    <FormControl><Input placeholder="State" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`guests.${index}.email`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>E-mail (Optional)</FormLabel>
                                                    <FormControl><Input type="email" placeholder="Email" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name={`guests.${index}.passport_no`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IC/Passport No. (Optional)</FormLabel>
                                                <FormControl><Input placeholder="IC/Passport No." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    ))}
                                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendGuest({ first_name: '', last_name: '' })}>
                                        <PlusCircle className="mr-2 h-4 w-4"/> Add guest
                                    </Button>

                                    <div className="space-y-4 pt-4">
                                        <CardTitle className="text-xl">Emergency Contact</CardTitle>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <FormField control={form.control} name="emergency_contact.name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Emergency Contact Name</FormLabel>
                                                    <FormControl><Input placeholder="Emergency Contact Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="emergency_contact.contact_number" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Emergency Contact Number</FormLabel>
                                                    <FormControl><Input placeholder="Emergency Contact No." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 pt-4">
                                        <CardTitle className="text-xl">Tenant's Vehicle Registration</CardTitle>
                                         {vehicleFields.map((field, index) => (
                                            <div key={field.id} className="flex items-end gap-2">
                                                <FormField control={form.control} name={`vehicles.${index}.number`} render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormLabel>Vehicle Number</FormLabel>
                                                        <FormControl><Input placeholder="Vehicle Number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeVehicle(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                         ))}
                                        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendVehicle({ number: '' })}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add vehicle
                                        </Button>
                                    </div>
                                    
                                     <div className="space-y-4 pt-4">
                                        <CardTitle className="text-xl">Items Provided</CardTitle>
                                        {itemFields.map((field, index) => (
                                            <div key={field.id} className="flex items-end gap-2">
                                                 <FormField control={form.control} name={`items_provided.${index}.name`} render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormLabel>Item Name</FormLabel>
                                                        <FormControl><Input placeholder="Item Name" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendItem({ name: '' })}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add item
                                        </Button>
                                    </div>
                               </div>
                          )}

                          {currentStep === 3 && (
                               <div className="space-y-6">
                                   <div className="space-y-4 p-4 border rounded-md">
                                        <h3 className="font-medium">Services Fees</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="early_checkin_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Early Check-in Fee</FormLabel>
                                                    <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="late_checkout_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Late Check-out Fee</FormLabel>
                                                     <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="shuttle_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Shuttle Fee</FormLabel>
                                                    <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="transportation_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transportation Fee</FormLabel>
                                                     <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="breakfast_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Breakfast</FormLabel>
                                                    <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="lunch_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lunch</FormLabel>
                                                     <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="dinner_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Dinner</FormLabel>
                                                    <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="other_services_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Others</FormLabel>
                                                     <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                   </div>
                                   <div className="space-y-4 p-4 border rounded-md">
                                        <h3 className="font-medium">Other Fees</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="cleaning_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cleaning Fees</FormLabel>
                                                    <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="extra_guest_fee" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Extra Guest Fees</FormLabel>
                                                     <div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            <FormField control={form.control} name="sales_tax" render={({ field }) => (<FormItem><FormLabel>Sales & Service Tax</FormLabel><div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="tourism_tax" render={({ field }) => (<FormItem><FormLabel>Tourism Tax</FormLabel><div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="heritage_tax" render={({ field }) => (<FormItem><FormLabel>Heritage Tax</FormLabel><div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="local_gov_tax" render={({ field }) => (<FormItem><FormLabel>Local Government Tax</FormLabel><div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="other_tax" render={({ field }) => (<FormItem><FormLabel>Other Tax</FormLabel><div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="ota_tax" render={({ field }) => (<FormItem><FormLabel>OTA Tax</FormLabel><div className="flex items-center gap-2"><span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span><FormControl><Input type="number" placeholder="0" {...field} /></FormControl></div><FormMessage /></FormItem>)} />
                                        </div>
                                   </div>
                                    <div className="space-y-4 p-4 border rounded-md">
                                        <h3 className="font-medium">Payment Type</h3>
                                        <FormField control={form.control} name="payment_method" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Method</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a payment method" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                               </div>
                          )}
                          

                      </CardContent>
                      <CardFooter className="justify-between">
                           {currentStep > 1 ? (
                              <Button type="button" variant="outline" onClick={handleBack} disabled={submitting}>
                                  Back
                              </Button>
                           ) : <div />}
                           <div className={cn(currentStep === 1 && "w-full flex justify-end")}>
                            {currentStep < STEPS.length && (
                              <Button type="button" onClick={handleNextStep} disabled={submitting} className={cn(currentStep === 1 && "w-auto")}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Next
                              </Button>
                            )}
                           </div>
                      </CardFooter>
              </Card>
          </div>
          <div className="lg:col-span-1">
               <Card>
                  <CardHeader>
                      <CardTitle>Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                      <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Check-in</span>
                          <span className="font-medium">{checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '-'}</span>
                      </div>
                       <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Check-out</span>
                          <span className="font-medium">{checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '-'}</span>
                      </div>
                       <div className="border-t pt-4 space-y-4">
                          <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Room Charges ({numberOfNights} Night(s))</span>
                              <span className="font-medium">MYR {roomRate.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Other Fees & Taxes</span>
                              <span className="font-medium">MYR {otherFees.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                              <span>Total Amount</span>
                              <span>MYR {totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Payment Received</span>
                              <span className="font-medium text-green-600">MYR {collectedAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg text-destructive border-t pt-2">
                              <span>Outstanding Balance</span>
                              <span>MYR {(totalPrice - collectedAmount).toFixed(2)}</span>
                          </div>
                       </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 items-stretch">
                     <FormField
                        control={form.control}
                        name="collected_amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Collected</FormLabel>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter Amount" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="deposit_not_collected"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            </FormControl>
                             <FormLabel className="font-normal text-muted-foreground">
                                Deposit Not Collected
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                     <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Update Booking' : 'New Booking'}
                    </Button>
                  </CardFooter>
              </Card>
          </div>
      </form>
    </Form>
    <AddGuestDialog 
        isOpen={isAddGuestOpen}
        onClose={() => setAddGuestOpen(false)}
        onSuccess={onGuestAdded}
    />
    </>
  )
}

    
