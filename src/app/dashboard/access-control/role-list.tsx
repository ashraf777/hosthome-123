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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { EditRoleDialog } from "./edit-role-dialog"

export type Permission = {
  id: number
  name: string
}

export type Role = {
  id: number
  name: string
  permissions: Permission[]
}

export function RoleList() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingRole, setEditingRole] = React.useState<Role | null>(null)
  const { toast } = useToast()

  const fetchRoles = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("roles")
      setRoles(response.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch roles.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleEdit = (role: Role) => {
    setEditingRole(role)
  }
  
  const handleDialogClose = (updated?: boolean) => {
      setEditingRole(null);
      if (updated) {
          fetchRoles(); // Re-fetch roles if an update occurred
      }
  }


  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions Count</TableHead>
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
            ) : roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{role.permissions.length}</Badge>
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
                      <DropdownMenuItem onSelect={() => handleEdit(role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete (Not Implemented)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {!loading && roles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No roles found.
            </div>
          )}
      </div>

      {editingRole && (
          <EditRoleDialog
            role={editingRole}
            isOpen={!!editingRole}
            onClose={handleDialogClose}
          />
      )}
    </>
  )
}
