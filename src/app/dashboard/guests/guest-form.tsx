"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, UserPlus } from "lucide-react"

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
})

interface GuestFormProps {
  isEditMode?: boolean;
}

export function GuestForm({ isEditMode = false }: GuestFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof guestFormSchema>) {
    setLoading(true)
    console.log(values)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: isEditMode ? "Guest Updated" : "Guest Added",
        description: `The guest has been successfully ${isEditMode ? 'updated' : 'added'}.`,
      })
      setLoading(false)
    }, 1500)
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
                    <Input type="tel" placeholder="e.g., +1 234 567 890" {...field} />
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
                    <Textarea placeholder="Any notes about this guest..." {...field} />
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
