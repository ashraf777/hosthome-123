
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/services/api"
import Image from "next/image"
import { Input } from "@/components/ui/input"


const AirbnbIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-red-500 mr-2"
  >
    <path
      d="M12 3.15c-2.43 0-4.4 1.97-4.4 4.4 0 3.32 4.4 11.25 4.4 11.25s4.4-7.93 4.4-11.25c0-2.43-1.97-4.4-4.4-4.4zm0 2.85c.85 0 1.55.7 1.55 1.55s-.7 1.55-1.55 1.55-1.55-.7-1.55-1.55.7-1.55 1.55-1.55zm0-2.85C6.73 3.15 3 6.88 3 11.25c0 5.4 5.25 11.55 7.95 14.25l1.05 1.05 1.05-1.05C15.75 22.8 21 16.65 21 11.25c0-4.37-3.73-8.1-9-8.1z"
      fill="#FF5A5F"
    />
  </svg>
)

const SortableTableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === columnKey;
    const direction = isSorted ? sortConfig.direction : undefined;

    return (
        <TableHead>
            <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-2 py-1 h-auto">
                <div className="flex items-center gap-2">
                    <span>{children}</span>
                    {isSorted ? (
                        direction === 'ascending' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    )}
                </div>
            </Button>
        </TableHead>
    )
}


export function BookingList() {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sortConfig, setSortConfig] = React.useState({ key: 'check_in_date', direction: 'descending' });
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter()
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('bookings');
        setBookings(response.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch bookings.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [toast]);
  
  const sortedBookings = React.useMemo(() => {
    let searchableItems = [...bookings];

    if (searchQuery) {
        searchableItems = searchableItems.filter(booking => {
            const lowercasedQuery = searchQuery.toLowerCase();
            const guestName = `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.toLowerCase();
            const confirmationCode = (booking.confirmation_code || '').toLowerCase();
            const propertyName = (booking.property_unit?.property?.name || '').toLowerCase();
            const unitName = (booking.property_unit?.unit_identifier || '').toLowerCase();
            const contactNumber = (booking.guest?.contact_number || '').toLowerCase();

            return guestName.includes(lowercasedQuery) ||
                   confirmationCode.includes(lowercasedQuery) ||
                   propertyName.includes(lowercasedQuery) ||
                   unitName.includes(lowercasedQuery) ||
                   contactNumber.includes(lowercasedQuery);
        });
    }


    if (sortConfig.key !== null) {
      searchableItems.sort((a, b) => {
        const getNestedValue = (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : null), obj);

        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return searchableItems;
  }, [bookings, sortConfig, searchQuery]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleDelete = async (id) => {
    const originalBookings = [...bookings];
    setBookings(bookings.filter(b => b.id !== id));
    
    try {
      await api.delete(`bookings/${id}`);

      toast({
          title: "Booking Deleted",
          description: "The booking has been successfully deleted.",
      })
    } catch (error) {
       setBookings(originalBookings);
       toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete the booking. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
                <CardTitle>Reservations</CardTitle>
                <CardDescription>
                Manage your reservations and view their details.
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search reservations..."
                    className="pl-8 sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                </div>
                <Link href="/dashboard/booking/new">
                    <Button>
                        <PlusCircle className="mr-2" />
                        New Reservation
                    </Button>
                </Link>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader columnKey="confirmation_code" sortConfig={sortConfig} requestSort={requestSort}>Confirmation Code</SortableTableHeader>
              <SortableTableHeader columnKey="property_unit.property.name" sortConfig={sortConfig} requestSort={requestSort}>Property Name</SortableTableHeader>
              <SortableTableHeader columnKey="property_unit.unit_identifier" sortConfig={sortConfig} requestSort={requestSort}>Unit Name</SortableTableHeader>
              <SortableTableHeader columnKey="check_in_date" sortConfig={sortConfig} requestSort={requestSort}>Check-in Date</SortableTableHeader>
              <SortableTableHeader columnKey="check_out_date" sortConfig={sortConfig} requestSort={requestSort}>Check-out Date</SortableTableHeader>
              <SortableTableHeader columnKey="guest.first_name" sortConfig={sortConfig} requestSort={requestSort}>Guest Name</SortableTableHeader>
              <SortableTableHeader columnKey="guest.contact_number" sortConfig={sortConfig} requestSort={requestSort}>Contact Number</SortableTableHeader>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sortedBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                    <div className="flex items-center">
                        {booking.booking_source !== "HostPlatform" && <AirbnbIcon />}
                        <div>
                             <div className="font-medium text-blue-600 cursor-pointer hover:underline">{booking.confirmation_code}</div>
                             <div className="text-xs text-muted-foreground">({booking.status})</div>
                        </div>
                    </div>
                </TableCell>
                <TableCell>{booking.property?.name}</TableCell>
                <TableCell>{booking.property_unit?.unit_identifier}</TableCell>
                <TableCell>{format(new Date(booking.check_in_date), "yyyy-MM-dd")}</TableCell>
                <TableCell>{format(new Date(booking.check_out_date), "yyyy-MM-dd")}</TableCell>
                <TableCell>{booking.guest?.first_name} {booking.guest?.last_name}</TableCell>
                <TableCell>
                  <a href={`tel:${booking.guest?.phone_number}`} className="text-blue-600 hover:underline">
                    {booking.guest?.phone_number}
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={() => router.push(`/dashboard/booking/${booking.id}/edit`)}
                        >
                          Edit
                        </DropdownMenuItem>
                         <AlertDialogTrigger asChild>
                           <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Delete
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the booking.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDelete(booking.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!loading && sortedBookings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No reservations found matching your search." : "No reservations found."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
