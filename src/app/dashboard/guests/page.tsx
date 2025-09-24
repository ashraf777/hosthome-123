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

// Mock Data
const initialGuests = [
  {
    id: "guest-001",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    avatar: "https://picsum.photos/seed/om/40/40",
    phone: "+1 (555) 123-4567",
    lastStay: new Date(2024, 6, 18),
    totalBookings: 3,
  },
  {
    id: "guest-002",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    avatar: "https://picsum.photos/seed/jl/40/40",
    phone: "+1 (555) 987-6543",
    lastStay: new Date(2024, 6, 22),
    totalBookings: 1,
  },
  {
    id: "guest-003",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "https://picsum.photos/seed/in/40/40",
    phone: "+1 (555) 234-5678",
    lastStay: new Date(2024, 7, 5),
    totalBookings: 5,
  },
  {
    id: "guest-004",
    name: "William Kim",
    email: "will@email.com",
    avatar: "https://picsum.photos/seed/wk/40/40",
    phone: "+1 (555) 876-5432",
    lastStay: new Date(2024, 7, 12),
    totalBookings: 2,
  },
];

export default function GuestManagementPage() {
  const [guests, setGuests] = React.useState(initialGuests);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
    toast({
        title: "Guest Deleted",
        description: "The guest has been successfully deleted.",
    })
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
              {guests.map((guest) => (
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
                  <TableCell>{format(guest.lastStay, "PPP")}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
