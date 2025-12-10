
"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from '@/services/api';

export function CleaningTeamForm({ form, team }) {
    const [allUsers, setAllUsers] = useState([]);
    const [hostingCompanies, setHostingCompanies] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await api.get('users'); 
                setAllUsers(response.data || []);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        }

        async function fetchHostingCompanies() {
            try {
                const response = await api.get('hosting-companies');
                setHostingCompanies(response.data || []);
            } catch (error) {
                console.error("Failed to fetch hosting companies", error);
            }
        }

        fetchUsers();
        fetchHostingCompanies();
    }, []);

    const selectedUserIds = form.watch('members', []);

    const handleUserSelect = (userId) => {
        const currentMemberIds = form.getValues('members') || [];
        if (!currentMemberIds.includes(userId)) {
            form.setValue('members', [...currentMemberIds, userId]);
        }
    };

    const handleUserRemove = (userId) => {
        const currentMemberIds = form.getValues('members') || [];
        form.setValue('members', currentMemberIds.filter(id => id !== userId));
    };

    return (
        <Form {...form}>
            <div className="grid gap-4 py-4">
                <FormField
                    control={form.control}
                    name="hosting_company_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hosting Company</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a hosting company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hostingCompanies.map(company => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="team_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Team Name</FormLabel>
                            <FormControl>
                                <Input placeholder="eg. KLCC team" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="team_leader_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Team Leader</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team leader" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                    <FormLabel>Apply to Users</FormLabel>
                    <Select onValueChange={handleUserSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select at least one user" />
                        </SelectTrigger>
                        <SelectContent>
                            {allUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedUserIds.map(userId => {
                            const user = allUsers.find(u => u.id === userId);
                            return user ? (
                                <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                                    {user.name}
                                    <button type="button" onClick={() => handleUserRemove(user.id)} className="rounded-full hover:bg-gray-200 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ) : null;
                        })}
                    </div>
                </div>
            </div>
        </Form>
    );
}
