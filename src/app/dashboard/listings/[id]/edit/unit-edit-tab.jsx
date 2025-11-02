
"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Info } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PhotoGallery } from "@/components/photo-gallery"

const unitSchema = z.object({
  unit_identifier: z.string().min(1, "Unit name is required."),
  status: z.enum(['available', 'maintenance', 'owner_use']),
  owner_user_id: z.coerce.number().optional().nullable(),
  max_free_stay_days: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  about: z.string().optional(),
  guest_access: z.string().optional(),
});

export function UnitEditTab({ unitData, onUpdate }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            unit_identifier: unitData.unit_identifier || "",
            status: unitData.status || "available",
            owner_user_id: unitData.owner_user_id || null,
            max_free_stay_days: unitData.max_free_stay_days || 0,
            description: unitData.description || "",
            about: unitData.about || "",
            guest_access: unitData.guest_access || "",
        },
    });

    React.useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const usersRes = await api.get('users');
                setUsers(usersRes.data || []);
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch users." });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [toast]);

    async function onSubmit(values) {
        setIsSubmitting(true);
        const payload = {
            ...values,
            max_free_stay_days: values.max_free_stay_days ? parseInt(values.max_free_stay_days, 10) : 0,
        };
        try {
            await api.put(`units/${unitData.id}`, payload);
            toast({
                title: "Unit Updated",
                description: "The unit details have been saved.",
            });
            onUpdate();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update unit.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6 space-y-8">
                         <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertTitle className="text-blue-800 dark:text-blue-300">Small Tips</AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-400">
                                Give your unit a unique naming so that you can identify them easily in future. For example: E-11-02, A studio with contemporary design theme.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                            <h3 className="font-medium">Basic Information</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="unit_identifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Identifier</FormLabel>
                                            <FormControl><Input placeholder="e.g., Room 101, Appt 3B" {...field} /></FormControl>
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
                                                    <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="available">Available</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="owner_use">Owner Use</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="max_free_stay_days"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Free Stay Days (Optional)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 7" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="owner_user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Owner</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(value ? Number(value) : null)} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select an owner (optional)" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users.map(user => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                            <h3 className="font-medium">Fine Print Information</h3>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl><Textarea rows={4} placeholder="Describe the unit..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About Your Place (Optional)</FormLabel>
                                        <FormControl><Textarea rows={4} placeholder="What makes this unit unique?" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="guest_access"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Guest Access (Optional)</FormLabel>
                                        <FormControl><Textarea rows={4} placeholder="What can guests access?" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Unit Photos</CardTitle>
                        <CardDescription>Manage photos specific to this unit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PhotoGallery 
                            photoType="unit" 
                            photoTypeId={unitData.id} 
                            hostingCompanyId={unitData?.property?.hosting_company_id}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/listings')}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update
                    </Button>
                </div>
            </form>
        </Form>
    );
}
