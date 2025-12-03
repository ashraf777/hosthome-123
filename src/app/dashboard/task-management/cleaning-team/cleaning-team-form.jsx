
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

const allUsers = ['Mah Kok Leong', 'Gan XiangNi', 'XiangNi Gan', 'John Doe', 'Jane Smith'];

export function CleaningTeamForm({ team }) {
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (team) {
            setSelectedUsers(team.users);
        }
    }, [team]);

    const handleUserSelect = (user) => {
        if (!selectedUsers.includes(user)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleUserRemove = (user) => {
        setSelectedUsers(selectedUsers.filter(u => u !== user));
    };

    return (
        <div className="grid gap-4 py-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">For Host</label>
                <Select defaultValue={team?.host}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a host" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Feel Home Malaysia Sdn Bhd">Feel Home Malaysia Sdn Bhd</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Properties</label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select at least one property" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="agile">Agile B-02-03, Agile</SelectItem>
                        <SelectItem value="beta">Beta C-05-01, Beta</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <Input defaultValue={team?.teamName} placeholder="eg. KLCC team" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Apply to Users</label>
                <Select onValueChange={handleUserSelect}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select at least one user" />
                    </SelectTrigger>
                    <SelectContent>
                        {allUsers.map(user => (
                            <SelectItem key={user} value={user}>
                                {user}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                        <Badge key={user} variant="secondary" className="flex items-center gap-1">
                            {user}
                            <button onClick={() => handleUserRemove(user)} className="rounded-full hover:bg-gray-200 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
