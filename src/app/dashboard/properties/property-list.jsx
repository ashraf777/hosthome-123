
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Bed } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function PropertyList() {
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter()
  const { toast } = useToast()

  const fetchProperties = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('properties');
      const propertiesData = response?.data || response || [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch properties.",
      });
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  React.useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);


  const getPlaceholder = (id) => {
    const image = PlaceHolderImages.find(img => img.id === `property-${id}`);
    if (image) {
      return {
        url: image.url,
        hint: image.hint
      };
    }
    return {
      url: `https://picsum.photos/seed/${id}/80/60`,
      hint: 'property exterior'
    }
  }

  return (
    <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Address</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : properties.map((property) => {
                const placeholder = getPlaceholder(property.id);
                return (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image
                          src={placeholder.url}
                          alt={property.name}
                          width={80}
                          height={60}
                          className="rounded-md object-cover"
                          data-ai-hint={placeholder.hint}
                        />
                         <Link href={`/dashboard/listings/${property.id}/room-types`} className="hover:underline">
                            {property.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{property.address_line_1}, {property.city}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(property.listing_status)} className="capitalize">
                        {property.listing_status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                              onSelect={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Property
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                                onSelect={() => router.push(`/dashboard/listings/${property.id}/room-types`)}
                            >
                              <Bed className="mr-2 h-4 w-4" />
                              Manage Room Types
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
         {!loading && properties.length === 0 && (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
            <p>No Properties Found.</p>
          </div>
        )}
    </div>
  )
}
