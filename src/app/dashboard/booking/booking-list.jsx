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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/services/api"


const getBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed':
      case 'checked_in':
      case 'checked_out':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

export function BookingList() {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
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
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                Manage your bookings and view their details.
                </CardDescription>
            </div>
            <Link href="/dashboard/booking/new">
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
             {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.guest.first_name} {booking.guest.last_name}</TableCell>
                <TableCell>{format(new Date(booking.check_in_date), "PPP")}</TableCell>
                <TableCell>{format(new Date(booking.check_out_date), "PPP")}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(booking.status)} className="capitalize">
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(booking.total_price)}
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
        {!loading && bookings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No bookings found.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
