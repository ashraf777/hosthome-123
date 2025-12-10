
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { api } from '@/services/api';
import { PresetTaskDialog } from './preset-task-dialog';

const columns = [
    {
        accessorKey: "preset_task_name",
        header: "Task Name",
        cell: ({ row }) => (
            <Link href={`/dashboard/task-management/preset-task/${row.id}`} className="text-blue-600 hover:underline">
                {row.preset_task_name}
            </Link>
        ),
    },
    {
        accessorKey: "property.name",
        header: "Property",
        cell: ({ row }) => row?.property?.name || 'N/A',
    },
    {
        accessorKey: "trigger_type",
        header: "Trigger",
    },
    {
        accessorKey: "cleaning_team.team_name",
        header: "Cleaning Team",
        cell: ({ row }) => row?.cleaning_team?.team_name || 'N/A',
    },
];

export function PresetTaskList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [presetTasks, setPresetTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    async function fetchPresetTasks() {
        try {
            setLoading(true);
            const response = await api.get('preset-tasks');
            setPresetTasks(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch preset tasks");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPresetTasks();
    }, []);

    const handlePresetTaskCreated = () => {
        fetchPresetTasks();
        setIsDialogOpen(false);
    };

    const filteredTasks = presetTasks.filter(task => {
        const searchTerm = globalFilter.toLowerCase();
        return (
            task.preset_task_name?.toLowerCase().includes(searchTerm) ||
            task.property?.name?.toLowerCase().includes(searchTerm) ||
            task.trigger_type?.toLowerCase().includes(searchTerm) ||
            task.cleaning_team?.name?.toLowerCase().includes(searchTerm)
        );
    });

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setIsDialogOpen(true)}><span className="mr-2">+</span> Create Preset Task</Button>
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

            <PresetTaskDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onPresetTaskCreated={handlePresetTaskCreated} />

            <DataTable columns={columns} data={filteredTasks} isLoading={loading} />
        </div>
    );
}
