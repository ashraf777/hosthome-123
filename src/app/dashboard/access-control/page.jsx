"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ShieldCheck } from "lucide-react"
import { RoleList } from "./role-list"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function AccessControlPage() {
  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [newRoleName, setNewRoleName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  
  // This state will be used to trigger a re-fetch in the RoleList component
  const [roleUpdateCount, setRoleUpdateCount] = React.useState(0)

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Role name cannot be empty.",
      })
      return
    }
    setIsSubmitting(true)
    try {
      await api.post("roles", { name: newRoleName })
      toast({
        title: "Role Created",
        description: `The role "${newRoleName}" has been successfully created.`,
      })
      setNewRoleName("")
      setCreateDialogOpen(false)
      setRoleUpdateCount(prev => prev + 1); // Trigger re-fetch
    } catch (error) {
      const statusCode = error.status || 'N/A';
      const errorMessage = error.message || "Could not create roles.";

      console.error("Error create role:", error);
      console.error("HTTP Status Code:", statusCode); // Now you'll see the 403

      let toastTitle = "Error";
      let toastDescription = "Could not create role.";

      // Check for 403 Forbidden
      if (statusCode === 403) {
        toastTitle = "Unauthorized Access";
        toastDescription = "You don't have permission to create role.";
      } else {
        // Use the generic message for other errors
        toastDescription = errorMessage; 
      }
      
      toast({
        variant: "destructive",
        title: toastTitle,
        description: toastDescription,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Define roles and assign permissions for your system users.
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="mr-2" />
              Create Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <React.Suspense fallback={<Skeleton className="h-64 w-full" />}>
             <RoleList key={roleUpdateCount} />
          </React.Suspense>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Enter a name for the new role you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-name" className="text-right">
                Name
              </Label>
              <Input
                id="role-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Property Manager"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
