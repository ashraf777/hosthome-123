
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, RotateCw } from "lucide-react"

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

const bookingStatuses = {
  1: 'Confirmed',
  2: 'Cancel',
  3: 'Checked In',
  4: 'Checked Out',
  5: 'Booking Inquiry',
  6: 'Awaiting Payment',
  7: 'No Show',
  8: 'Vacant Dirty(VD)',
  9: 'Vacant Clean(VC)',
  10: 'Maintenance',
  11: 'Blocked',
  12: 'Walk In'
};

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
  const [syncing, setSyncing] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

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

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const response = await api.post('beds24/bookings/import-all');
      
      toast({
        title: "Sync Successful",
        description: response.message || "Bookings synchronized with Beds24.",
      });

      // Refresh the list
      const updatedResponse = await api.get('bookings');
      setBookings(updatedResponse.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.response?.data?.error || error.message || "Failed to sync bookings.",
      });
    } finally {
      setSyncing(false);
    }
  };

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

  const paginatedBookings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBookings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Link href="/dashboard/booking/new">
              <Button>
                <PlusCircle className="mr-2" />
                New Reservation
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleSyncAll} 
              disabled={syncing}
            >
              <RotateCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync from Beds24'}
            </Button>
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
              <TableHead>Source</TableHead>
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
            ) : paginatedBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="flex items-center">
                    {booking.channel?.name === "Airbnb" && <AirbnbIcon />}
                    <div>
                      <Link href={`/dashboard/booking/${booking.id}/edit`} className="font-medium text-blue-600 hover:underline">
                        {booking.confirmation_code}
                      </Link>
                      <div className="text-xs text-muted-foreground">{booking.channel?.name || "Direct"} - {bookingStatuses[booking.status] || booking.status}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{booking.property?.name}</TableCell>
                <TableCell>{booking.property_unit?.unit_identifier}</TableCell>
                <TableCell>{format(new Date(booking.check_in_date), "yyyy-MM-dd")}</TableCell>
                <TableCell>{format(new Date(booking.check_out_date), "yyyy-MM-dd")}</TableCell>
                <TableCell>{booking.guest?.first_name} {booking.guest?.last_name}</TableCell>
                <TableCell>
                  <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${(booking.guest?.phone_number || '').replace(/\D/g, '')}`} className="text-blue-600 hover:underline flex flex-wrap max-w-[120px]">
                    {booking.guest?.phone_number}
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-xs">{booking.channel_source || 'Direct'}</span>
                    {booking.channel_booking_id && (
                      <span className="text-[10px] text-muted-foreground">{booking.channel_booking_id}</span>
                    )}
                  </div>
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
                          Detail Action
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

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedBookings.length)} of {sortedBookings.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm border rounded px-3 py-1 bg-slate-50">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
