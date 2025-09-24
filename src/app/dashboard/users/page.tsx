"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, PlusCircle } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock Data
const initialUsers = [
  {
    id: "user-001",
    name: "Admin User",
    email: "admin@hosthome.com",
    avatar: "https://picsum.photos/seed/hosthome-user/40/40",
    role: "Admin",
    status: "Active",
  },
  {
    id: "user-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "https://picsum.photos/seed/js/40/40",
    role: "Staff",
    status: "Active",
  },
  {
    id: "user-003",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://picsum.photos/seed/jd/40/40",
    role: "Staff",
    status: "Invited",
  },
];

const getRoleBadgeVariant = (role: string) => {
  return role === 'Admin' ? 'destructive' : 'secondary';
}

const getStatusBadgeVariant = (status: string) => {
  return status === 'Active' ? 'default' : 'outline';
}

export default function UserManagementPage() {
  const [users, setUsers] = React.useState(initialUsers);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
    })
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
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
              {users.map((user) => (
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
                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status) as any}>
                      {user.status}
                    </Badge>
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
                          <DropdownMenuItem
                            onSelect={() => router.push(`/dashboard/users/${user.id}/edit`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(user.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}
