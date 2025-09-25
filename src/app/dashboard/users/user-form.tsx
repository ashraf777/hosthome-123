"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const userFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  role: z.string({ required_error: "Please select a role." }),
  status: z.string({ required_error: "Please select a status." }),
  avatar: z.string().url().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  isEditMode?: boolean;
  userId?: string;
}

export function UserForm({ isEditMode = false, userId }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Staff",
      status: "Active",
      avatar: `https://picsum.photos/seed/${Math.random()}/40/40`,
    },
  })

  useEffect(() => {
    if (isEditMode && userId) {
      setLoading(true);
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) throw new Error("Failed to fetch user");
          const data = await response.json();
          form.reset(data);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not fetch user data." });
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [isEditMode, userId, form, toast]);


  async function onSubmit(values: UserFormValues) {
    setLoading(true)
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/users/${userId}` : '/api/users';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update user' : 'Failed to create user');
      }

      toast({
        title: isEditMode ? "User Updated" : "User Added",
        description: `The user has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      router.push('/dashboard/users');
      router.refresh();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "An error occurred",
        description: (error as Error).message || "Something went wrong.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill out the details for the user.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Invited">Invited</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update User' : 'Add User'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
