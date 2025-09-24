"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Loader2, BedDouble, User, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"

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
  FormDescription,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const bookingFormSchema = z.object({
  status: z.string({ required_error: "Please select a status." }),
  checkIn: z.date({ required_error: "Check-in date is required." }),
  checkOut: z.date({ required_error: "Check-out date is required." }),
  guestName: z.string().min(2, "Guest name is required."),
  guestEmail: z.string().email("Invalid email address."),
  guestPhone: z.string().optional(),
  channel: z.string().optional(),
  channelProperty: z.string().optional(),
  roomType: z.string({ required_error: "Please select a room type." }),
  unitListing: z.string({ required_error: "Please select a unit listing." }),
  roomRate: z.coerce.number().min(0, "Room rate must be a positive number."),
  otherCharges: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  bookingType: z.string({ required_error: "Please select a booking type." }),
  bookingSource: z.string(),
})

// Mock Data for existing guests
const existingGuests = [
  { id: "guest-001", name: "Olivia Martin", email: "olivia.martin@email.com", phone: "+1 (555) 123-4567" },
  { id: "guest-002", name: "Jackson Lee", email: "jackson.lee@email.com", phone: "+1 (555) 987-6543" },
  { id: "guest-003", name: "Isabella Nguyen", email: "isabella.nguyen@email.com", phone: "+1 (555) 234-5678" },
  { id: "guest-004", name: "William Kim", email: "will@email.com", phone: "+1 (555) 876-5432" },
];

interface BookingFormProps {
  isEditMode?: boolean;
}

export function BookingForm({ isEditMode = false }: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      status: "Confirmed",
      bookingSource: "HostHome",
      roomRate: 100,
      otherCharges: 0,
      discount: 0,
      tax: 0
    },
  })

  function onSubmit(values: z.infer<typeof bookingFormSchema>) {
    setLoading(true)
    console.log(values)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: isEditMode ? "Booking Updated" : "Booking Created",
        description: `The booking has been successfully ${isEditMode ? 'updated' : 'saved'}.`,
      })
      setLoading(false)
    }, 1500)
  }

  const channels = [
    "Airbnb",
    "Booking.com",
    "Agoda",
    "Expedia",
    "Google Vacation Rentals",
  ]

  const handleGuestSelect = (guestName: string) => {
    const selectedGuest = existingGuests.find(guest => guest.name.toLowerCase() === guestName.toLowerCase());
    if (selectedGuest) {
      form.setValue("guestName", selectedGuest.name);
      form.setValue("guestEmail", selectedGuest.email);
      form.setValue("guestPhone", selectedGuest.phone);
    } else {
      form.setValue("guestName", guestName);
      form.setValue("guestEmail", "");
      form.setValue("guestPhone", "");
    }
    setOpenCombobox(false);
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                name="checkIn"
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
                name="checkOut"
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
            
            <Separator />

            <div>
              <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                <User className="w-5 h-5" />
                Guest Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Guest Name</FormLabel>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? existingGuests.find(
                                    (guest) => guest.name.toLowerCase() === field.value.toLowerCase()
                                  )?.name || field.value
                                : "Select or type guest name"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command
                            filter={(value, search) => {
                              if (value.toLowerCase().includes(search.toLowerCase())) return 1
                              return 0
                            }}
                          >
                            <CommandInput 
                              placeholder="Search guest or add new..."
                              onValueChange={(search) => {
                                // if no guest is found, still allow setting the name
                                const isExisting = existingGuests.some(g => g.name.toLowerCase() === search.toLowerCase());
                                if (!isExisting) {
                                  form.setValue("guestName", search);
                                }
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <CommandItem
                                  onSelect={() => handleGuestSelect(form.getValues("guestName"))}
                                >
                                  Add new guest: "{form.getValues("guestName")}"
                                </CommandItem>
                              </CommandEmpty>
                              <CommandGroup>
                                {existingGuests.map((guest) => (
                                  <CommandItem
                                    value={guest.name}
                                    key={guest.id}
                                    onSelect={() => {
                                      handleGuestSelect(guest.name)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === guest.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {guest.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g., john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                 <FormField
                  control={form.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., +1 234 567 890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Direct)</SelectItem>
                        {channels.map((channel) => (
                          <SelectItem key={channel} value={channel}>
                            {channel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channelProperty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Property</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!form.watch("channel") || form.watch("channel") === "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prop1">Cozy Downtown Apartment</SelectItem>
                        <SelectItem value="prop2">Beachside Villa</SelectItem>
                        <SelectItem value="prop3">Mountain Cabin Retreat</SelectItem>
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
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entire">Entire Place</SelectItem>
                        <SelectItem value="private">Private Room</SelectItem>
                        <SelectItem value="shared">Shared Room</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitListing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Listing</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unit101">Unit 101</SelectItem>
                        <SelectItem value="unit102">Unit 102 (Penthouse)</SelectItem>
                        <SelectItem value="unit205">Unit 205</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
               <FormField
                  control={form.control}
                  name="roomRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Charges ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 8.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
               <FormField
                control={form.control}
                name="bookingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a booking type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nightly">Nightly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="bookingSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Source</FormLabel>
                      <FormControl>
                        <Input disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
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
