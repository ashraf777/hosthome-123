
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { api } from '@/services/api';
import { ChecklistDialog } from './checklist-dialog';

const columns = [
    {
        accessorKey: "checklist_name",
        header: "Checklist Name",
        cell: ({ row }) => (
            <Link href={`/dashboard/task-management/checklist/${row.id}`} className="text-blue-600 hover:underline">
                {row.checklist_name}
            </Link>
        ),
    },
    {
        accessorKey: "hosting_company_name",
        header: "Hosting Company",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
];

export function ChecklistList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    async function fetchChecklists() {
        try {
            setLoading(true);
            const response = await api.getChecklists();
            setChecklists(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch checklists");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchChecklists();
    }, []);

    const handleChecklistCreated = () => {
        fetchChecklists();
        setIsDialogOpen(false);
    }

    const filteredChecklists = checklists.filter(checklist => {
        const searchTerm = globalFilter.toLowerCase();
        return (
            checklist.checklist_name?.toLowerCase().includes(searchTerm) ||
            (checklist.description || '').toLowerCase().includes(searchTerm) ||
            checklist.hosting_company_name?.toLowerCase().includes(searchTerm)
        );
    });

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setIsDialogOpen(true)}><span className="mr-2">+</span> Create Checklist</Button>
                <div className="relative w-full max-w-sm">
                    <Input 
                        placeholder="Search..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
            </div>
            
            <ChecklistDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onChecklistCreated={handleChecklistCreated} />

            <DataTable columns={columns} data={filteredChecklists} isLoading={loading} />
        </div>
    );
}
