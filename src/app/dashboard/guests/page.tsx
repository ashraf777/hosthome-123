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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

type Guest = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    phone: string;
    lastStay: string;
    totalBookings: number;
}

export default function GuestManagementPage() {
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/guests');
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setGuests(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch guests.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGuests();
  }, [toast]);

  const handleDelete = async (id: string) => {
    const originalGuests = [...guests];
    setGuests(guests.filter(g => g.id !== id));
    
    try {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }
      
      toast({
          title: "Guest Deleted",
          description: "The guest has been successfully deleted.",
      })
    } catch (error) {
      setGuests(originalGuests);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the guest. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Guest</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Guests</CardTitle>
              <CardDescription>
                View and manage your guest database.
              </CardDescription>
            </div>
            <Link href="/dashboard/guests/new" passHref>
              <Button>
                <PlusCircle className="mr-2" />
                Add Guest
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Stay</TableHead>
                <TableHead className="text-center">Total Bookings</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={guest.avatar} alt={guest.name} data-ai-hint="person face" />
                        <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {guest.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{guest.email}</span>
                      <span className="text-muted-foreground text-sm">{guest.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(guest.lastStay), "PPP")}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{guest.totalBookings}</Badge>
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
                            onSelect={() => router.push(`/dashboard/guests/${guest.id}/edit`)}
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
                            This action cannot be undone. This will permanently delete the guest record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(guest.id)}
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
           {!loading && guests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No guests found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
