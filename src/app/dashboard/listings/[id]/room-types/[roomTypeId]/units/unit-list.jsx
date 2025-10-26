
"use client"

import * as React from "react"
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
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

export function UnitList({ roomTypeId }) {
  const [units, setUnits] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const router = useRouter();
  const { toast } = useToast()

  const fetchUnits = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(`units?room_type_id=${roomTypeId}`)
      setUnits(response.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch units for this room type.",
      })
    } finally {
      setLoading(false)
    }
  }, [roomTypeId, toast])

  React.useEffect(() => {
    fetchUnits()
  }, [fetchUnits])
  
  const handleDelete = async (unitId) => {
    const originalUnits = [...units];
    setUnits(units.filter(u => u.id !== unitId));
    
    try {
      await api.delete(`units/${unitId}`);
      toast({
          title: "Unit Deleted",
          description: "The unit has been successfully deleted.",
      })
    } catch (error) {
      setUnits(originalUnits);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete the unit. Please try again.",
      });
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'maintenance':
        return 'destructive';
      case 'owner_use':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit Identifier</TableHead>
            <TableHead>Status</TableHead>
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
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : units.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell className="font-medium">{unit.unit_identifier}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(unit.status)} className="capitalize">{unit.status.replace('_', ' ')}</Badge>
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
                      <DropdownMenuItem disabled>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Unit (Not Implemented)
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
                          This action cannot be undone. This will permanently delete this unit.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleDelete(unit.id)}
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
       {!loading && units.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No units found for this room type.
          </div>
        )}
    </div>
  )
}
