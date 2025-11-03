
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
import { AmenityReferenceFormDialog } from "./amenity-reference-form-dialog"

export function AmenityReferencesList() {
  const [references, setReferences] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedReference, setSelectedReference] = React.useState(null)
  const { toast } = useToast()

  const fetchReferences = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("amenities-references")
      setReferences(response.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch amenity categories.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchReferences()
  }, [fetchReferences])

  const handleDelete = async (id) => {
    try {
      await api.delete(`amenities-references/${id}`)
      toast({ title: "Success", description: "Category deleted successfully." })
      fetchReferences()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Failed to delete category.",
      })
    }
  }
  
  const openFormForEdit = (reference) => {
    setSelectedReference(reference);
    setIsFormOpen(true);
  }

  const openFormForCreate = () => {
    setSelectedReference(null);
    setIsFormOpen(true);
  }

  const onFormSuccess = () => {
    fetchReferences();
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

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openFormForCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Type</TableHead>
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
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : references.map((ref) => (
              <TableRow key={ref.id}>
                <TableCell className="font-medium pl-4">{ref.name}</TableCell>
                <TableCell>{getTypeBadge(ref.type)}</TableCell>
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
                        <DropdownMenuItem onSelect={() => openFormForEdit(ref)}>
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
                          This will permanently delete the category and may affect amenities using it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDelete(ref.id)}
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
        {!loading && references.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No amenity categories found.
            </div>
        )}
      </div>
      <AmenityReferenceFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={onFormSuccess}
        initialData={selectedReference}
      />
    </>
  )
}
