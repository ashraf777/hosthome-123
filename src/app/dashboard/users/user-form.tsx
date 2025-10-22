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
import { api } from "@/services/api"

const userRegisterSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  hosting_company_id: z.coerce.number().default(1),
  role_id: z.coerce.number({ required_error: "Please select a role." }),
});

const userEditSchema = z.object({
  role_id: z.coerce.number({ required_error: "Please select a role." }),
  name: z.string(), // Not editable via this form, but needed for display
  email: z.string(), // Not editable, for display
});


type UserRegisterValues = z.infer<typeof userRegisterSchema>;
type UserEditValues = z.infer<typeof userEditSchema>;

interface UserFormProps {
  isEditMode?: boolean;
  userId?: string;
}

type Role = {
  id: number;
  name: string;
}

export function UserForm({ isEditMode = false, userId }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([]);
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm<UserRegisterValues | UserEditValues>({
    resolver: zodResolver(isEditMode ? userEditSchema : userRegisterSchema),
  })

  useEffect(() => {
    async function fetchRolesAndUserData() {
      setLoading(true);
      try {
        const rolesResponse = await api.get('roles');
        setRoles(rolesResponse.data);

        if (isEditMode && userId) {
          // The GET /api/users endpoint returns all users. We find the one we're editing.
          const usersResponse = await api.get('users');
          const currentUser = usersResponse.data.find((u: any) => u.id.toString() === userId);
          if (currentUser) {
            form.reset({
              role_id: currentUser.role.id,
              name: currentUser.name, // for display
              email: currentUser.email, // for display
            });
          } else {
            throw new Error('User not found');
          }
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch required data." });
      } finally {
        setLoading(false);
      }
    }
    fetchRolesAndUserData();
  }, [isEditMode, userId, form, toast]);


  async function onSubmit(values: UserRegisterValues | UserEditValues) {
    setLoading(true)
    
    try {
      if (isEditMode && userId) {
        // We are updating the role
        const editValues = values as UserEditValues;
        await api.put(`users/${userId}/role`, { role_id: editValues.role_id });
        toast({ title: "User Updated", description: "The user's role has been successfully updated." });
      } else {
        // We are creating a new user (registering)
        const registerValues = values as UserRegisterValues;
        await api.post('register', registerValues);
        toast({ title: "User Created", description: "The new user has been successfully created." });
      }

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

  const schema = isEditMode ? userEditSchema : userRegisterSchema;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit User Role' : 'Add New User'}</CardTitle>
            <CardDescription>
              {isEditMode ? "Change the role for this user." : "Fill out the details to register a new user."}
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
                      <Input placeholder="e.g., John Doe" {...field} disabled={isEditMode} />
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
                      <Input type="email" placeholder="e.g., john.doe@example.com" {...field} disabled={isEditMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             {!isEditMode && (
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map(role => (
                           <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                        ))}
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
