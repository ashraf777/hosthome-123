
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Download, Edit } from 'lucide-react';
import { CreateTaskDialog } from "./create-task-dialog";
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function TaskList() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'All') {
        params.append('status', activeTab);
      }
      const response = await api.get(`tasks?${params.toString()}`);
      setTasks(response.data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch tasks." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTaskCreateOrUpdate = () => {
    fetchData(); // Refetch tasks after create or update
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const columns = [
    {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ row }) => new Date(row.created_at).toLocaleString(),
    },
    {
        accessorKey: "unit.name",
        header: "Unit Name",
        cell: ({ row }) => {
            const unitName = row.unit?.unit_identifier;
            if (!unitName) return 'N/A';
            return (
                <Link href={`/dashboard/task-management/task-list/${row.id}`} className="text-blue-600 hover:underline">
                    {unitName}
                </Link>
            );
        },
    },
    {
        accessorKey: "property.name",
        header: "Property Name",
        cell: ({ row }) => row?.property?.name || 'N/A',
    },
    {
        accessorKey: "cleaning_team.team_name",
        header: "Team Name",
        cell: ({ row }) => row?.cleaning_team?.team_name || 'N/A',
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.status;
            const statusClass = {
                'To Do': 'bg-gray-100 text-gray-800',
                'In Progress': 'bg-blue-100 text-blue-800',
                'Completed': 'bg-green-100 text-green-800',
                'Cancelled': 'bg-red-100 text-red-800',
                'Paused': 'bg-yellow-100 text-yellow-800',
            }[status] || 'bg-gray-100';
            return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>{status}</span>;
        },
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.priority;
            const priorityClass = {
                'Low': 'bg-gray-100 text-gray-800',
                'Medium': 'bg-yellow-100 text-yellow-800',
                'High': 'bg-orange-100 text-orange-800',
                'Urgent': 'bg-red-100 text-red-800',
            }[priority] || 'bg-gray-100';
            return <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClass}`}>{priority}</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                <Edit className="h-4 w-4" />
            </Button>
        ),
    },
  ];

  const summary = useMemo(() => {
    const allTasks = tasks; // Use the fetched tasks
    return {
      todo: allTasks.filter(t => t.status === 'To Do').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      completed: allTasks.filter(t => t.status === 'Completed').length,
      total: allTasks.length,
    }
  }, [tasks]);

  return (
    <div>
        <div className="grid gap-4 md:grid-cols-4 grid-cols-2 mb-6">
           <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">To Do</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{summary.todo}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{summary.inProgress}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{summary.completed}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{summary.total}</div>
                </CardContent>
            </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
            <Button onClick={() => { setSelectedTask(null); setIsDialogOpen(true); }}>Create Task</Button>
            <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
            </Button>
        </div>
        
        <Tabs defaultValue="All" onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="To Do">To Do</TabsTrigger>
                <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
                 <TabsTrigger value="Paused">Paused</TabsTrigger>
                <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
                <DataTable columns={columns} data={tasks} isLoading={loading} />
            </TabsContent>
        </Tabs>

        <CreateTaskDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onTaskCreate={handleTaskCreateOrUpdate} 
            onTaskUpdate={handleTaskCreateOrUpdate} 
            task={selectedTask}
        />
    </div>
  );
}
