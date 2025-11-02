
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MoreHorizontal, PlusCircle, Home, Bed, Edit } from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { PlaceHolderImages } from "@/lib/placeholder-images.js"


const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function ListingList() {
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter()
  const { toast } = useToast()

  const fetchListings = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('units');
      const listingsData = response?.data || response || [];
      setListings(Array.isArray(listingsData) ? listingsData : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch listings.",
      });
      setListings([]); // Ensure listings is an array on error
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`units/${id}`);
      toast({
          title: "Unit Deleted",
          description: "The unit has been successfully deleted.",
      })
      fetchListings(); // Re-fetch to update the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete the unit. Please try again.",
      });
    }
  };

  const getPlaceholder = (id) => {
    const image = PlaceHolderImages.find(img => img.id === `property-${id}`);
    if (image) {
      return {
        url: image.url,
        hint: image.hint
      };
    }
    // Fallback if no specific image is found
    return {
      url: `https://picsum.photos/seed/${id}/80/60`,
      hint: 'property exterior'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Listings</CardTitle>
                <CardDescription>
                Manage your listings and their details.
                </CardDescription>
            </div>
            <Link href="/dashboard/listings/new">
                <Button>
                    <PlusCircle className="mr-2" />
                    Add New Listing
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Weekday Price</TableHead>
              <TableHead>Weekend Price</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : listings.map((listing) => {
                const placeholder = getPlaceholder(listing.id);
                return (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          src={placeholder.url}
                          alt={listing.unit_identifier}
                          width={80}
                          height={60}
                          className="rounded-md object-cover"
                          data-ai-hint={placeholder.hint}
                        />
                        <span>{listing.unit_identifier}</span>
                      </div>
                    </TableCell>
                    <TableCell>{listing.room_type?.name || "N/A"}</TableCell>
                    <TableCell>{listing.property?.name || "N/A"}</TableCell>
                    <TableCell>{listing.room_type?.weekday_price || "N/A"}</TableCell>
                    <TableCell>{listing.room_type?.weekend_price || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(listing.status)} className="capitalize">
                        {listing.status.replace("_", " ")}
                      </Badge>
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
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Listing
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
                              This action cannot be undone. This will permanently delete this unit.
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
                )
            })}
          </TableBody>
        </Table>
         {!loading && listings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
            <Home className="w-12 h-12 text-muted-foreground/50" />
            <p>No Listings Found.</p>
            <Link href="/dashboard/listings/new">
                <Button>
                    <PlusCircle className="mr-2" />
                    Add Your First Listing
                </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
