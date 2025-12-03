
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { CleaningTeamDialog } from "./cleaning-team-dialog";

const teams = [
    {
        id: 1,
        teamName: 'Kry',
        host: 'Feel Home Malaysia Sdn Bhd',
        users: ['Mah Kok Leong', 'Gan XiangNi', 'XiangNi Gan'],
        properties: ['Agile B-02-03', 'Agile']
    }
];

const columns = [
    {
        accessorKey: "teamName",
        header: "Team Name",
        cell: ({ row }) => (
            <Link href={`/dashboard/task-management/cleaning-team/${row.id}`} className="text-blue-600 hover:underline">
                {row.teamName}
            </Link>
        ),
    },
    {
        accessorKey: "host",
        header: "Host",
    },
    {
        accessorKey: "users",
        header: "User's Name",
        cell: ({ row }) => row.users.join(', '),
    },
    {
        accessorKey: "properties",
        header: "Property Name",
        cell: ({ row }) => row.properties.join(', '),
    },
];

export function CleaningTeamList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setIsDialogOpen(true)}><span className="mr-2">+</span> Create Cleaner Team</Button>
            </div>

            <CleaningTeamDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
            
            <div className="flex items-center mb-4 space-x-4">
                <div className="relative w-full max-w-xs">
                    <Input placeholder="Team Name" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                <div className="relative w-full max-w-xs">
                    <Input placeholder="Host" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                <div className="relative w-full max-w-xs">
                    <Input placeholder="User's Name" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                 <div className="relative w-full max-w-xs">
                    <Input placeholder="Property Name" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
            </div>
            
            <DataTable columns={columns} data={teams} />
        </div>
    );
}
