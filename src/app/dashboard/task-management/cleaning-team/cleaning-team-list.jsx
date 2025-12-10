
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { CleaningTeamDialog } from "./cleaning-team-dialog";
import { api } from '@/services/api';

const columns = [
    {
        accessorKey: "team_name",
        header: "Team Name",
        cell: ({ row }) => (
            <Link href={`/dashboard/task-management/cleaning-team/${row?.id}`} className="text-blue-600 hover:underline">
                {row?.team_name}
            </Link>
        ),
    },
    {
        accessorKey: "host",
        header: "Host",
        cell: ({ row }) => row?.hosting_company?.name || 'N/A',
    },
    {
        accessorKey: "users",
        header: "User's Name",
        cell: ({ row }) => row?.members?.map(m => m.name).join(', ') || 'N/A',
    },
    {
        accessorKey: "team_leader",
        header: "Team Leader",
        cell: ({ row }) => row.team_leader?.name || 'N/A',
    },
];

export function CleaningTeamList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('');

    async function fetchCleaningTeams() {
        try {
            setLoading(true);
            const response = await api.getCleaningTeams();
            const fetchedTeams = response.data?.teams || response.data || [];
            setTeams(fetchedTeams.filter(Boolean));
        } catch (err) {
            setError(err.message || "Failed to fetch cleaning teams");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCleaningTeams();
    }, []);

    const handleTeamCreated = () => {
        fetchCleaningTeams();
        setIsDialogOpen(false);
    }

    const filteredTeams = teams.filter(team => {
        const searchTerm = globalFilter.toLowerCase();
        return (
            team.team_name?.toLowerCase().includes(searchTerm) ||
            (team.hosting_company?.company_name || '').toLowerCase().includes(searchTerm) ||
            (team.members?.map(m => m.name).join(', ') || '').toLowerCase().includes(searchTerm) ||
            (team.team_leader?.name || '').toLowerCase().includes(searchTerm)
        );
    });

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setIsDialogOpen(true)}><span className="mr-2">+</span> Create Cleaner Team</Button>
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

            <CleaningTeamDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onTeamCreated={handleTeamCreated} />
            
            <DataTable columns={columns} data={filteredTeams} isLoading={loading} />
        </div>
    );
}
