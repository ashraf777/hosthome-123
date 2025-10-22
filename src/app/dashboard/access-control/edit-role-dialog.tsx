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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import type { Role, Permission } from "./role-list"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface EditRoleDialogProps {
  role: Role
  isOpen: boolean
  onClose: (updated?: boolean) => void
}

export function EditRoleDialog({ role, isOpen, onClose }: EditRoleDialogProps) {
  const [allPermissions, setAllPermissions] = React.useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<number>>(new Set())
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (isOpen) {
      const fetchPermissions = async () => {
        setLoading(true)
        try {
          const response = await api.get("permissions")
          setAllPermissions(response.data)
          setSelectedPermissions(new Set(role.permissions.map((p) => p.id)))
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch permissions.",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchPermissions()
    }
  }, [isOpen, role.permissions, toast])

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(permissionId)
      } else {
        newSet.delete(permissionId)
      }
      return newSet
    })
  }
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedPermissions(new Set(allPermissions.map(p => p.id)));
    } else {
        setSelectedPermissions(new Set());
    }
  }

  const handleSaveChanges = async () => {
    setIsSubmitting(true)
    try {
      await api.post(`roles/${role.id}/sync-permissions`, {
        permission_ids: Array.from(selectedPermissions),
      })
      toast({
        title: "Permissions Updated",
        description: `Permissions for the "${role.name}" role have been updated.`,
      })
      onClose(true)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to update permissions.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const areAllSelected = allPermissions.length > 0 && selectedPermissions.size === allPermissions.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>
            Select the permissions for this role.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="select-all"
                    checked={areAllSelected}
                    onCheckedChange={handleSelectAll}
                />
                <label
                    htmlFor="select-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                   Select All Permissions
                </label>
            </div>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={`perm-${permission.id}`}
                        checked={selectedPermissions.has(permission.id)}
                        onCheckedChange={(checked) =>
                        handlePermissionChange(permission.id, !!checked)
                        }
                    />
                    <label
                        htmlFor={`perm-${permission.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {permission.name}
                    </label>
                    </div>
                ))}
                </div>
            </ScrollArea>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSubmitting || loading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
