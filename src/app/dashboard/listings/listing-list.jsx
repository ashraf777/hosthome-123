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
import { Skeleton } from "@/components/ui/skeleton"


const getStatusBadgeVariant = (status) => {
  return status === 'Listed' ? 'default' : 'secondary';
}

export function ListingList() {
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter()
  const { toast } = useToast()

  React.useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings');
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setListings(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch listings.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [toast]);

  const handleDelete = async (id) => {
    const originalListings = [...listings];
    setListings(listings.filter(l => l.id !== id));
    
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }
      
      toast({
          title: "Listing Deleted",
          description: "The property listing has been successfully deleted.",
      })
    } catch (error) {
      setListings(originalListings);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the listing. Please try again.",
      });
    }
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
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                       <Skeleton className="h-[60px] w-[80px] rounded-md" />
                       <Skeleton className="h-6 w-48" />
                     </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.name}
                      width={80}
                      height={60}
                      className="rounded-md object-cover"
                      data-ai-hint={listing.imageHint}
                    />
                    <span>{listing.name}</span>
                  </div>
                </TableCell>
                <TableCell>{listing.roomType}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(listing.status)}>
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
         {!loading && listings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No listings found.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
