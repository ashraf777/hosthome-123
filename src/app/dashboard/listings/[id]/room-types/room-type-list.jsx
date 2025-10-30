
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, BedDouble, Trash2, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
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

export function RoomTypeList({ propertyId, assignedRoomTypes, loading, onUpdate }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleUnassign = async (roomTypeId) => {
    try {
      await api.delete(`properties/${propertyId}/room-types/${roomTypeId}`);
      toast({
          title: "Room Type Unassigned",
          description: "The room type has been unassigned from this property.",
      });
      onUpdate(); // Trigger a re-fetch in the parent component
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to unassign the room type.",
      });
    }
  };


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Type Name</TableHead>
            <TableHead>Max Guests</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-6 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : assignedRoomTypes.map((roomType) => (
            <TableRow key={roomType.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                 <Link href={`/dashboard/room-types/${roomType.id}`} className="hover:underline">
                    {roomType.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{(roomType.max_adults || 0) + (roomType.max_children || 0)}</Badge>
              </TableCell>
               <TableCell>
                <Badge variant="outline">{roomType.units_count || 0}</Badge>
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
                       <DropdownMenuItem onSelect={() => router.push(`/dashboard/room-types/${roomType.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        View/Edit Details
                      </DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => router.push(`/dashboard/listings/${propertyId}/room-types/${roomType.id}/units`)}>
                        <BedDouble className="mr-2 h-4 w-4" />
                        Manage Units
                      </DropdownMenuItem>
                       <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Unassign
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unassign Room Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will unassign "{roomType.name}" from this property. It will not delete the room type itself.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleUnassign(roomType.id)}
                        >
                          Unassign
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {!loading && assignedRoomTypes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No room types assigned to this property yet.
          </div>
        )}
    </div>
  )
}
