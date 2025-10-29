
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Loader2 } from "lucide-react"

export function AssignRoomTypeDialog({ isOpen, onClose, propertyId, assignedRoomTypeIds, onAssignSuccess }) {
  const [allRoomTypes, setAllRoomTypes] = React.useState([])
  const [selectedRoomTypeId, setSelectedRoomTypeId] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (isOpen) {
      const fetchAllRoomTypes = async () => {
        setLoading(true)
        try {
          const response = await api.get("room-types")
          // This logic assumes a room type is "unassigned" if its property_id is null.
          // It also filters out room types already assigned to the current property.
          const roomTypesData = response.data?.data || response.data || [];
          if (Array.isArray(roomTypesData)) {
            const availableRoomTypes = roomTypesData.filter(rt => !assignedRoomTypeIds.includes(rt.id));
            setAllRoomTypes(availableRoomTypes);
          } else {
            setAllRoomTypes([]);
            console.error("Expected an array of room types, but received:", roomTypesData);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch available room types.",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchAllRoomTypes()
    }
  }, [isOpen, assignedRoomTypeIds, toast])

  const handleAssign = async () => {
    if (!selectedRoomTypeId) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select a room type to assign.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // This API call should now handle associating the room type with the property.
      await api.post(`properties/${propertyId}/room-types/${selectedRoomTypeId}`)
      toast({
        title: "Room Type Assigned",
        description: "The room type has been successfully assigned to this property.",
      })
      onAssignSuccess()
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign room type.",
      })
    } finally {
      setIsSubmitting(false)
      setSelectedRoomTypeId(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setSelectedRoomTypeId(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Room Type</DialogTitle>
          <DialogDescription>
            Select an unassigned room type to link to this property.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={(value) => setSelectedRoomTypeId(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room type..." />
              </SelectTrigger>
              <SelectContent>
                {allRoomTypes.length > 0 ? (
                  allRoomTypes.map(rt => (
                    <SelectItem key={rt.id} value={rt.id.toString()}>
                      {rt.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No unassigned room types available.
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting || loading || !selectedRoomTypeId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Room Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
