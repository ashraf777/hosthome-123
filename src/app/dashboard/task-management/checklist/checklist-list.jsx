
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Download, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { CreateChecklistDialog } from "./create-checklist-dialog";

const checklists = [
    {
        id: 1,
        name: 'Night shift checklist',
        hostName: 'Feel Home Malaysia Sdn Bhd',
        property: 'Agile, B-02-03'
    }
];

const columns = [
    {
        accessorKey: "name",
        header: "Checklist Name",
        cell: ({ row }) => (
            <Link href={`/dashboard/task-management/checklist/${row.id}`} className="text-blue-600 hover:underline">
                {row.name}
            </Link>
        ),
    },
    {
        accessorKey: "hostName",
        header: "Host Name",
    },
    {
        accessorKey: "property",
        header: "Property Name",
    },
];

export function ChecklistList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setIsDialogOpen(true)}><span className="mr-2">+</span> Create Checklist</Button>
                <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download CSV</Button>
            </div>

            <CreateChecklistDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
            
            <div className="flex items-center mb-4">
                <div className="relative w-full max-w-xs">
                    <Input placeholder="Checklist Name" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                <div className="relative w-full max-w-xs ml-4">
                    <Input placeholder="Host Name" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
                <div className="relative w-full max-w-xs ml-4">
                    <Input placeholder="Property Name" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
            </div>
            
            <DataTable columns={columns} data={checklists} />
        </div>
    );
}
