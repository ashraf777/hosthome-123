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
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

const guestFormSchema = z.object({
  name: z.string().min(2, "Guest name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  notes: z.string().optional(),
  avatar: z.string().url().optional(),
})

type GuestFormValues = z.infer<typeof guestFormSchema>

interface GuestFormProps {
  isEditMode?: boolean;
  guestId?: string;
}

export function GuestForm({ isEditMode = false, guestId }: GuestFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter();

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      avatar: `https://picsum.photos/seed/${Math.random()}/40/40`,
    },
  })
  
  useEffect(() => {
    if (isEditMode && guestId) {
      setLoading(true);
      const fetchGuest = async () => {
        try {
          const response = await fetch(`/api/guests/${guestId}`);
          if (!response.ok) throw new Error("Failed to fetch guest");
          const data = await response.json();
          form.reset(data);
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not fetch guest data." });
        } finally {
          setLoading(false);
        }
      };
      fetchGuest();
    }
  }, [isEditMode, guestId, form, toast]);

  async function onSubmit(values: GuestFormValues) {
    setLoading(true)
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/guests/${guestId}` : '/api/guests';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update guest' : 'Failed to create guest');
      }

      toast({
        title: isEditMode ? "Guest Updated" : "Guest Added",
        description: `The guest has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      router.push('/dashboard/guests');
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
            <CardTitle>Guest Information</CardTitle>
            <CardDescription>
              Fill out the details for the guest.
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
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="e.g., +1 234 567 890" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any notes about this guest..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Guest' : 'Add Guest'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
