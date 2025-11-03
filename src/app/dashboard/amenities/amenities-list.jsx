
"use client"

import * as React from "react"
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
import { MoreHorizontal, Edit, Trash2, PlusCircle } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { AmenityFormDialog } from "./amenity-form-dialog"

export function AmenitiesList() {
  const [amenities, setAmenities] = React.useState([])
  const [references, setReferences] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedAmenity, setSelectedAmenity] = React.useState(null)
  const { toast } = useToast()

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [amenitiesRes, referencesRes] = await Promise.all([
          api.get("amenities"),
          api.get("amenities-references")
      ]);
      setAmenities(amenitiesRes.data || []);
      setReferences(referencesRes.data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch amenities data.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id) => {
    try {
      await api.delete(`amenities/${id}`)
      toast({ title: "Success", description: "Amenity deleted successfully." })
      fetchData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Failed to delete amenity.",
      })
    }
  }
  
  const openFormForEdit = (amenity) => {
    setSelectedAmenity(amenity);
    setIsFormOpen(true);
  }

  const openFormForCreate = () => {
    setSelectedAmenity(null);
    setIsFormOpen(true);
  }

  const onFormSuccess = () => {
    fetchData();
    setIsFormOpen(false);
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 1:
        return <Badge variant="secondary">Property</Badge>
      case 2:
        return <Badge variant="secondary">Room Type</Badge>
      case 3:
        return <Badge variant="default">Both</Badge>
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }
  
  const getStatusBadge = (status) => {
    return status === 1 ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openFormForCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Amenity
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amenity Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : amenities.map((amenity) => (
              <TableRow key={amenity.id}>
                <TableCell className="font-medium pl-4">{amenity.specific_name || amenity.amenity_reference.name}</TableCell>
                <TableCell>{amenity.amenity_reference?.name}</TableCell>
                <TableCell>{getTypeBadge(amenity.type)}</TableCell>
                <TableCell>{getStatusBadge(amenity.status)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => openFormForEdit(amenity)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this amenity.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDelete(amenity.id)}
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
        {!loading && amenities.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No amenities found.
            </div>
        )}
      </div>
      <AmenityFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={onFormSuccess}
        initialData={selectedAmenity}
        amenityReferences={references}
      />
    </>
  )
}
