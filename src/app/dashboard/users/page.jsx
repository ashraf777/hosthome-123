"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, PlusCircle, UserCog } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/services/api"


const getRoleBadgeVariant = (role) => {
  return role === 'Admin' ? 'destructive' : 'secondary';
}

export default function UserManagementPage() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('users');
        // Add a placeholder status and avatar to match the UI component needs
        const usersWithUiFields = response.data.map((user) => ({
            ...user,
            status: 'Active',
            avatar: `https://picsum.photos/seed/${user.email}/40/40`
        }));
        setUsers(usersWithUiFields);
      } catch (error) {
        const statusCode = error.status || 'N/A';
        const errorMessage = error.message || "Could not fetch users.";

        console.error("Error fetching users:", error);
        console.error("HTTP Status Code:", statusCode); // Now you'll see the 403

        let toastTitle = "Error";
        let toastDescription = "Could not fetch users.";

        // Check for 403 Forbidden
        if (statusCode === 403) {
          toastTitle = "Unauthorized Access";
          toastDescription = "You don't have permission to view users.";
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
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);


  // Note: The provided API spec does not include a DELETE /api/users/{id} endpoint.
  // The delete functionality is therefore disabled.
  const handleDelete = async (id) => {
     toast({
        variant: "destructive",
        title: "Not Implemented",
        description: "User deletion is not supported by the API.",
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <UserCog className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>
                  Manage users and their permissions.
                  </CardDescription>
              </div>
               <Link href="/dashboard/users/new" passHref>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add User
                </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
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
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role.name)}>
                      {user.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={"default"}>
                      {user.status}
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
                            onSelect={() => router.push(`/dashboard/users/${user.id}/edit`)}
                          >
                            Edit Role
                          </DropdownMenuItem>
                           <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                              Delete (Not Implemented)
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
