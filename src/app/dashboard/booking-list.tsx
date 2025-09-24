"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MoreHorizontal, PlusCircle } from "lucide-react"

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

// Mock Data
const initialBookings = [
  {
    id: "booking-001",
    guestName: "Olivia Martin",
    checkIn: new Date(2024, 6, 15),
    checkOut: new Date(2024, 6, 18),
    status: "Confirmed",
    total: 599.0,
  },
  {
    id: "booking-002",
    guestName: "Jackson Lee",
    checkIn: new Date(2024, 6, 20),
    checkOut: new Date(2024, 6, 22),
    status: "Pending",
    total: 250.0,
  },
  {
    id: "booking-003",
    guestName: "Isabella Nguyen",
    checkIn: new Date(2024, 7, 1),
    checkOut: new Date(2024, 7, 5),
    status: "Cancelled",
    total: 890.0,
  },
  {
    id: "booking-004",
    guestName: "William Kim",
    checkIn: new Date(2024, 7, 10),
    checkOut: new Date(2024, 7, 12),
    status: "Confirmed",
    total: 300.0,
  },
];

const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

export function BookingList() {
  const [bookings, setBookings] = React.useState(initialBookings);
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
    toast({
        title: "Booking Deleted",
        description: "The booking has been successfully deleted.",
    })
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                Manage your bookings and view their details.
                </CardDescription>
            </div>
            <Link href="/dashboard/booking/new" passHref>
                <Button>
                    <PlusCircle className="mr-2" />
                    Create Booking
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.guestName}</TableCell>
                <TableCell>{format(booking.checkIn, "PPP")}</TableCell>
                <TableCell>{format(booking.checkOut, "PPP")}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(booking.status) as any}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(booking.total)}
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
      </CardContent>
    </Card>
  )
}
