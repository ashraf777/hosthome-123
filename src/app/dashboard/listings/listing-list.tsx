"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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

const initialListings = [
  {
    id: "prop-001",
    name: "Cozy Downtown Apartment",
    imageUrl: "https://picsum.photos/seed/prop1/80/60",
    imageHint: "apartment interior",
    roomType: "Entire Place",
    status: "Listed",
    instantBook: true,
    price: 150,
  },
  {
    id: "prop-002",
    name: "Beachside Villa",
    imageUrl: "https://picsum.photos/seed/prop2/80/60",
    imageHint: "beach villa",
    roomType: "Entire Place",
    status: "Listed",
    instantBook: false,
    price: 450,
  },
  {
    id: "prop-003",
    name: "Mountain Cabin Retreat",
    imageUrl: "https://picsum.photos/seed/prop3/80/60",
    imageHint: "mountain cabin",
    roomType: "Entire Place",
    status: "Unlisted",
    instantBook: true,
    price: 220,
  },
  {
    id: "prop-004",
    name: "Urban Studio Loft",
    imageUrl: "https://picsum.photos/seed/prop4/80/60",
    imageHint: "studio loft",
    roomType: "Private Room",
    status: "Listed",
    instantBook: true,
    price: 95,
  },
];

const getStatusBadgeVariant = (status: string) => {
  return status === 'Listed' ? 'default' : 'secondary';
}

export function ListingList() {
  const [listings, setListings] = React.useState(initialListings);
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    setListings(listings.filter(l => l.id !== id));
    toast({
        title: "Listing Deleted",
        description: "The property listing has been successfully deleted.",
    })
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Properties</CardTitle>
                <CardDescription>
                Manage your property listings and their details.
                </CardDescription>
            </div>
            <Link href="/dashboard/listings/new" passHref>
                <Button>
                    <PlusCircle className="mr-2" />
                    Create Listing
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Instant Book</TableHead>
              <TableHead className="text-right">Price (per night)</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.name}
                      width={80}
                      height={60}
                      className="rounded-md"
                      data-ai-hint={listing.imageHint}
                    />
                    <span>{listing.name}</span>
                  </div>
                </TableCell>
                <TableCell>{listing.roomType}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(listing.status) as any}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={listing.instantBook ? 'secondary' : 'outline'}>
                    {listing.instantBook ? 'On' : 'Off'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(listing.price)}
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
                          onSelect={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
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
                          This action cannot be undone. This will permanently delete the listing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDelete(listing.id)}
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
