
"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Loader2, BedDouble, PlusCircle, Trash2, FilePlus, History } from "lucide-react"
import { format, differenceInDays, isBefore } from "date-fns"
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
import { ActivityLogSheet } from "./activity-log-sheet"


const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  nationality: z.string().optional(),
  phone_number: z.string().min(1, "Contact number is required"),
  state: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  ic_passport_no: z.string().optional(),
});

const emergencyContactSchema = z.object({
  emergency_contact_name: z.string().optional(),
  emergency_contact_number: z.string().optional(),
});

const vehicleSchema = z.object({
  number: z.string().min(1, "Vehicle number is required"),
});

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
});

const chargeSchema = z.object({
    charge_reference_id: z.number(),
    amount: z.coerce.number().min(0).optional().default(0)
});

const bookingFormSchema = z.object({
  property_id: z.coerce.number().optional(),
  room_type_id: z.coerce.number().optional(),
  property_unit_id: z.coerce.number({ required_error: "Please select a unit." }),
  check_in_date: z.date({ required_error: "Check-in date is required." }),
  check_out_date: z.date({ required_error: "Check-out date is required." }),
  raw_room_rate: z.coerce.number().min(0, "Total price must be a positive number.").default(0),
  number_of_guests: z.coerce.number().min(1, "Guest count must be at least 1.").default(1),
  status: z.enum(['Confirmed', 'Booking Inquery', 'Awaiting Payment', 'Checked In', 'Checked Out', 'Cancel', 'No Show', 'Vacant Dirty(VD)', 'Vacant Clean(VC)']),
  booking_source: z.string().optional(),
  booking_type: z.string().optional(),
  remarks: z.string().optional(),
  room_rate_modifier: z.coerce.number().optional(),
  
  guests: z.array(guestSchema).optional(),
  emergency_contact: emergencyContactSchema.optional(),
  vehicles: z.array(vehicleSchema).optional(),
  items_provided: z.array(itemSchema).optional(),

  guest_id: z.coerce.number().optional(),

  charges: z.array(chargeSchema).optional(),
  payment_method: z.string().optional(),
  
  amount_paid: z.coerce.number().optional(),
  amount_due: z.coerce.number().optional(),
  deposit_not_collected: z.boolean().default(false),
  new_payment_amount: z.coerce.number().optional(), // For edit mode only
}).refine(data => {
    if (data.check_in_date && data.check_out_date) {
        return !isBefore(data.check_out_date, data.check_in_date);
    }
    return true;
}, {
    message: "Check-out date cannot be before check-in date.",
    path: ["check_out_date"],
});

const STEPS = [
    { id: 1, title: 'Reservation Details', fields: ['property_id', 'room_type_id', 'property_unit_id', 'check_in_date', 'check_out_date', 'raw_room_rate', 'number_of_guests'] },
    { id: 2, title: 'Guest Details', fields: ['guests', 'emergency_contact', 'vehicles', 'items_provided'] },
    { id: 3, title: 'Other Charges', fields: ['charges', 'payment_method']}
];

 const statusMapping = {
    'Confirmed': 1,
    'Cancel': 2,
    'Checked In': 3,
    'Checked Out': 4,
    'Booking Inquery': 5,
    'Awaiting Payment': 6,
    'No Show': 7,
    'Vacant Dirty(VD)': 8,
    'Vacant Clean(VC)': 9,
  };

const reverseStatusMapping = Object.fromEntries(Object.entries(statusMapping).map(([k, v]) => [v, k]));

export function BookingForm({ isEditMode = false, bookingId }) {
  const [submitting, setSubmitting] = useState(false)
  const [formLoading, setFormLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [units, setUnits] = useState([])
  const [guests, setGuests] = useState([]) 
  const [bookingTypes, setBookingTypes] = useState([])
  const [bookingSources, setBookingSources] = useState([])
  const [chargeReferences, setChargeReferences] = useState([])
  const [currentStep, setCurrentStep] = useState(1);
  const [isAddGuestOpen, setAddGuestOpen] = useState(false);
  const [bookingDataForLog, setBookingDataForLog] = useState(null)
  const [isActivityLogOpen, setActivityLogOpen] = useState(false)


  const { toast } = useToast()
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      status: "Confirmed",
      number_of_guests: 1,
      raw_room_rate: 0,
      booking_source: 'HostPlatform',
      booking_type: 'Walk In',
      guests: [{ first_name: '', last_name: '', email: '', phone_number: '' }],
      emergency_contact: { emergency_contact_name: '', emergency_contact_number: '' },
      vehicles: [],
      items_provided: [],
      charges: [],
      payment_method: 'Cash',
      amount_paid: 0,
      amount_due: 0,
      deposit_not_collected: false,
      room_rate_modifier: 0,
      new_payment_amount: 0,
    },
  })
  
  const { fields: guestFields, append: appendGuest, remove: removeGuest } = useFieldArray({ control: form.control, name: "guests" });
  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({ control: form.control, name: "vehicles" });
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control: form.control, name: "items_provided" });
  const { fields: chargeFields, append: appendCharge } = useFieldArray({ control: form.control, name: "charges" });


  const selectedPropertyId = form.watch("property_id");
  const selectedRoomTypeId = form.watch("room_type_id");
  const checkInDate = form.watch("check_in_date");
  const checkOutDate = form.watch("check_out_date");
  
  const watchedCharges = form.watch("charges");
  const watchedRoomRateModifier = form.watch("room_rate_modifier");
  const amountPaid = form.watch("amount_paid") || 0;
  const newPaymentAmount = form.watch("new_payment_amount") || 0;
  
  const bookingType = form.watch("booking_type");
  const depositNotCollected = form.watch("deposit_not_collected");
  const arePriceFieldsDisabled = bookingType === 'Blocked' || depositNotCollected;


  const numberOfNights = useMemo(() => {
    if (checkInDate && checkOutDate && !isBefore(checkOutDate, checkInDate)) {
      const diff = differenceInDays(checkOutDate, checkInDate);
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [checkInDate, checkOutDate]);

  const roomRate = (watchedRoomRateModifier || 0) * numberOfNights;
  const otherFees = (form.watch('charges') || []).reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0);
  const totalAmount = roomRate + otherFees;
  const totalPaidDisplay = isEditMode ? amountPaid + newPaymentAmount : amountPaid;
  const outstandingBalance = totalAmount - totalPaidDisplay;
  
  useEffect(() => {
    if (arePriceFieldsDisabled) {
      form.setValue('room_rate_modifier', 0);
      form.setValue('amount_paid', 0);
    }
  }, [arePriceFieldsDisabled, form]);


  useEffect(() => {
    async function fetchInitialData() {
        setFormLoading(true);
        try {
            const [propsRes, bookingTypesRes, channelsRes, chargesRes] = await Promise.all([
                api.get('properties'),
                api.get('booking-type-references'),
                api.get('channels'),
                api.get('charge-references')
            ]);
            
            setProperties(Array.isArray(propsRes.data) ? propsRes.data : []);
            setBookingTypes(Array.isArray(bookingTypesRes.data) ? bookingTypesRes.data : []);
            setBookingSources(Array.isArray(channelsRes.data) ? channelsRes.data : []);

            const chargesData = chargesRes.data || [];
            if(Array.isArray(chargesData)) {
              setChargeReferences(chargesData);
              const initialCharges = chargesData.map(c => ({ charge_reference_id: c.id, amount: 0 }));
              if (!isEditMode) {
                form.setValue('charges', initialCharges);
              }
            }

        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: `Could not fetch initial form data. ${error.message}` });
        } finally {
            if (!isEditMode) {
              setFormLoading(false);
            }
        }
    }
    
    fetchInitialData();
  }, [toast, form, isEditMode]);

  useEffect(() => {
    if (isEditMode && bookingId && properties.length > 0 && chargeReferences.length > 0) {
        async function fetchEditData() {
            try {
                const bookingRes = await api.get(`bookings/${bookingId}`);
                const bookingData = bookingRes.data.data || bookingRes.data;
                setBookingDataForLog(bookingData)

                const propertyId = bookingData.property?.id;
                const roomTypeId = bookingData.room_type?.id;
        
                if (propertyId) {
                    const roomTypesRes = await api.get(`properties/${propertyId}/room-types`);
                    const fetchedRoomTypes = Array.isArray(roomTypesRes.data) ? roomTypesRes.data : [];
                    setRoomTypes(fetchedRoomTypes);

                    if (roomTypeId) {
                        const unitsRes = await api.get(`units?room_type_id=${roomTypeId}`);
                        setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
                    }
                }
                
                const existingCharges = bookingData.charges || [];
                const allCharges = chargeReferences.map(ref => {
                    const existing = existingCharges.find(c => c.charge_reference_id === ref.id);
                    return {
                        charge_reference_id: ref.id,
                        amount: Number(existing?.amount) || 0
                    };
                });

                const formattedBookingData = {
                    property_id: propertyId || undefined,
                    room_type_id: roomTypeId || undefined,
                    property_unit_id: bookingData.property_unit?.id || undefined,
                    check_in_date: bookingData.check_in_date ? new Date(bookingData.check_in_date) : null,
                    check_out_date: bookingData.check_out_date ? new Date(bookingData.check_out_date) : null,
                    booking_source: bookingData.channel?.name || 'HostPlatform',
                    booking_type: bookingData.booking_type?.name || 'Walk In',
                    status: reverseStatusMapping[bookingData.status] || 'Confirmed',
                    guests: (bookingData.guest ? [{
                        first_name: bookingData.guest.first_name || '',
                        last_name: bookingData.guest.last_name || '',
                        email: bookingData.guest.email || '',
                        nationality: bookingData.guest.nationality || '',
                        phone_number: bookingData.guest.phone_number || '',
                        state: bookingData.guest.state || '',
                        ic_passport_no: bookingData.guest.ic_passport_no || ''
                    }] : [{ first_name: '', last_name: '', email: '', phone_number: '' }]),
                    emergency_contact: {
                        emergency_contact_name: bookingData.guest?.emergency_contact_name || '',
                        emergency_contact_number: bookingData.guest?.emergency_contact_number || '',
                    },
                    vehicles: bookingData.guest?.vehicles?.map(v => ({ number: v.registration_number })) || [],
                    items_provided: bookingData.items_provided?.map(item => ({ name: item.name })) || [],
                    amount_paid: Number(bookingData.amount_paid) || 0,
                    deposit_not_collected: !!bookingData.deposit_not_collected,
                    payment_method: bookingData.payments?.[0]?.payment_method || 'Cash',
                    remarks: bookingData.remarks || '',
                    raw_room_rate: Number(bookingData.raw_room_rate) || 0,
                    room_rate_modifier: Number(bookingData.room_rate_modifier) || 0,
                    number_of_guests: bookingData.number_of_guests || 1,
                    charges: allCharges,
                };
                form.reset(formattedBookingData);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: `Could not fetch required data. ${error.message}` });
            } finally {
                setFormLoading(false);
            }
        }
        fetchEditData();
    }
}, [isEditMode, bookingId, form, toast, properties, chargeReferences]);

  useEffect(() => {
    if (selectedPropertyId) {
        api.get(`properties/${selectedPropertyId}/room-types`).then(res => {
            const fetchedRoomTypes = Array.isArray(res.data) ? res.data : [];
            setRoomTypes(fetchedRoomTypes);
            if (!isEditMode || (isEditMode && form.getValues('property_id') !== selectedPropertyId)) {
                form.setValue('room_type_id', undefined);
                form.setValue('property_unit_id', undefined);
                setUnits([]);
            }
        });
    } else {
        setRoomTypes([]);
        setUnits([]);
    }
}, [selectedPropertyId, form, isEditMode]);

  useEffect(() => {
    if (selectedRoomTypeId) {
      api.get(`units?room_type_id=${selectedRoomTypeId}`).then(res => {
        setUnits(Array.isArray(res.data) ? res.data : []);
        if(!isEditMode || (isEditMode && form.getValues('room_type_id') !== selectedRoomTypeId)) {
             form.setValue('property_unit_id', undefined);
        }
        
        const selectedRoomType = roomTypes.find(rt => rt.id === Number(selectedRoomTypeId));
        if (selectedRoomType && (!form.getValues('raw_room_rate'))) {
            const newPrice = Number(selectedRoomType.weekday_price) || 0;
            form.setValue('raw_room_rate', newPrice);
            form.setValue('room_rate_modifier', newPrice);
        }
      });
    } else {
      setUnits([]);
      if(!isEditMode) {
         form.setValue('raw_room_rate', 0);
         form.setValue('room_rate_modifier', 0);
      }
    }
  }, [selectedRoomTypeId, form, roomTypes, isEditMode]);

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

  
   const channelMapping = {
      HostPlatform: 1,
      Direct: 2,
      Airbnb: 3,
      'Booking.com': 4,
      Expedia: 5,
      Other: 6
    };

    const bookingTypeMapping = {
        "Walk In": 1,
        "Extended Stay": 2,
        "Social Media": 3,
        "Phone Call": 4,
        "Platform": 5,
        "Free Stay": 6,
        "Maintenance": 7,
        "Blocked": 8
    }


  async function onSubmit(values) {
    setSubmitting(true);
    
    const mainGuestData = values.guests && values.guests.length > 0 ? values.guests[0] : {};
    const selectedProperty = properties.find(p => p.id === values.property_id);
    const guestPayload = {
      ...mainGuestData,
      ...values.emergency_contact,
      hosting_company_id: selectedProperty?.hosting_company_id,
    }

    const charges = values.charges?.filter(charge => charge.amount > 0) || [];
    
    const finalAmountPaid = (isEditMode ? (form.getValues('amount_paid') || 0) : 0) + (values.new_payment_amount || 0) + (!isEditMode ? (values.amount_paid || 0) : 0);
    const calculatedAmountDue = totalAmount - finalAmountPaid;
    const newPaymentAmount = isEditMode ? (values.new_payment_amount || 0) : (values.amount_paid || 0);

    const formattedValues = {
        guest: guestPayload,
        check_in_date: values.check_in_date.toISOString().split('T')[0],
        check_out_date: values.check_out_date.toISOString().split('T')[0],
        total_amount: totalAmount,
        raw_room_rate: values.raw_room_rate,
        room_rate_modifier: values.room_rate_modifier || 0,
        amount_paid: finalAmountPaid,
        amount_due: calculatedAmountDue,
        deposit_not_collected: values.deposit_not_collected,
        number_of_guests: Number(values.number_of_guests),
        status: statusMapping[values.status],
        channel_id: channelMapping[values.booking_source],
        booking_type_reference_id: bookingTypeMapping[values.booking_type],
        remarks: values.remarks,
        property_id: Number(values.property_id),
        room_type_id: Number(values.room_type_id),
        property_unit_id: Number(values.property_unit_id),
        hosting_company_id: selectedProperty?.hosting_company_id,
        vehicles: values.vehicles?.map(v => ({ registration_number: v.number })),
        items_provided: values.items_provided?.map(item => ({ name: item.name })),
        charges: charges,
        payment: {
            amount: Number(newPaymentAmount) || 0,
            payment_method: values.payment_method,
            status: isEditMode ? 1 : 0,
        }
    };
    
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
       console.error('API Error:', error.response || error.message);
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
                          <CardTitle>Reservation Details</CardTitle>
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
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Booking Inquery">Booking Inquery</SelectItem>
                                                <SelectItem value="Awaiting Payment">Awaiting Payment</SelectItem>
                                                <SelectItem value="Checked In">Checked In</SelectItem>
                                                <SelectItem value="Checked Out">Checked Out</SelectItem>
                                                <SelectItem value="Cancel">Cancel</SelectItem>
                                                <SelectItem value="No Show">No Show</SelectItem>
                                                <SelectItem value="Vacant Dirty(VD)">Vacant Dirty (VD)</SelectItem>
                                                <SelectItem value="Vacant Clean(VC)">Vacant Clean (VC)</SelectItem>
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
                                      <FormField control={form.control} name="raw_room_rate" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Room Rate (per night)</FormLabel>
                                              <FormControl><Input type="number" placeholder="e.g., 300" {...field} disabled /></FormControl>
                                              <FormMessage />
                                          </FormItem>
                                          )} />
                                      <FormField control={form.control} name="room_rate_modifier" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Room Rate Modifier</FormLabel>
                                              <FormControl><Input type="number" placeholder="e.g., -50 for discount" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={arePriceFieldsDisabled} /></FormControl>
                                              <FormMessage />
                                          </FormItem>
                                          )} />
                                  </div>
                                  <FormField control={form.control} name="number_of_guests" render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Number of Pax</FormLabel>
                                      <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )} />
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                       <FormField control={form.control} name="booking_source" render={({ field }) => (
                                          <FormItem>
                                              <FormLabel>Booking Source</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                  {bookingSources.map(bs => (
                                                    <SelectItem key={bs.id} value={bs.name}>{bs.name}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select><FormMessage />
                                          </FormItem>
                                        )} />
                                        <FormField control={form.control} name="booking_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Booking Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {bookingTypes.map(bt => (
                                                            <SelectItem key={bt.id} value={bt.name}>{bt.name}</SelectItem>
                                                        ))}
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
                                            <FormField control={form.control} name={`guests.${index}.phone_number`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Number <span className="text-destructive">*</span></FormLabel>
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
                                        <FormField control={form.control} name={`guests.${index}.ic_passport_no`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IC/Passport No. (Optional)</FormLabel>
                                                <FormControl><Input placeholder="IC/Passport No." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    ))}
                                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendGuest({ first_name: '', last_name: '', email: '', phone_number: '' })}>
                                        <PlusCircle className="mr-2 h-4 w-4"/> Add guest
                                    </Button>

                                    <div className="space-y-4 pt-4">
                                        <CardTitle className="text-xl">Emergency Contact</CardTitle>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <FormField control={form.control} name="emergency_contact.emergency_contact_name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Emergency Contact Name</FormLabel>
                                                    <FormControl><Input placeholder="Emergency Contact Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="emergency_contact.emergency_contact_number" render={({ field }) => (
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
                                        <h3 className="font-medium">Other Charges & Fees</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {chargeReferences.map((chargeRef, index) => (
                                                <FormField
                                                    key={chargeRef.id}
                                                    control={form.control}
                                                    name={`charges.${index}.amount`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{chargeRef.description}</FormLabel>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span>
                                                                <FormControl>
                                                                    <Input type="number" placeholder="0" {...field} />
                                                                </FormControl>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
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
                  <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                          <CardTitle>Payment Details</CardTitle>
                           {isEditMode && bookingDataForLog?.confirmation_code && (
                            <CardDescription className="pt-1">
                                Confirmation Code: <span className="font-semibold text-primary">{bookingDataForLog.confirmation_code}</span>
                            </CardDescription>
                          )}
                      </div>
                      {isEditMode && (
                        <Button variant="outline" size="sm" type="button" onClick={() => setActivityLogOpen(true)}>
                            <History className="mr-2 h-4 w-4" />
                            Payment Log
                        </Button>
                      )}
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
                              <span>MYR {totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Payment Received</span>
                              <span className="font-medium text-green-600">MYR {totalPaidDisplay.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg text-destructive border-t pt-2">
                              <span>Outstanding Balance</span>
                              <span>MYR {outstandingBalance.toFixed(2)}</span>
                          </div>
                       </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 items-stretch">
                     {isEditMode ? (
                        <>
                           <FormField
                                control={form.control}
                                name="amount_paid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Collected</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="new_payment_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receive Payment</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                     ) : (
                        <FormField
                            control={form.control}
                            name="amount_paid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Collected</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium p-2 bg-muted rounded-md">MYR</span>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter Amount" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} disabled={arePriceFieldsDisabled}/>
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                     )}

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
                        {isEditMode ? 'Update Reservation' : 'Create Reservation'}
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
     <ActivityLogSheet
        isOpen={isActivityLogOpen}
        onClose={() => setActivityLogOpen(false)}
        payments={bookingDataForLog?.payments || []}
      />
    </>
  )
}

    