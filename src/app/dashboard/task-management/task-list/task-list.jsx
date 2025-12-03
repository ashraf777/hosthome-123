
"use client"

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Download } from 'lucide-react';
import { CreateTaskDialog } from "./create-task-dialog";
import tasksData from '@/data/tasks.json';

const columns = [
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => new Date(row.createdAt).toLocaleString(),
  },
  {
    accessorKey: "unitName",
    header: "Unit Name",
    cell: ({ row }) => {
      const unitName = row.unitName;
      if (!unitName) return 'N/A';
      return (
        <Link href={`/dashboard/task-management/task-list/${row.id}`} className="text-blue-600 hover:underline">
          {unitName}
        </Link>
      );
    },
  },
  {
    accessorKey: "propertyName",
    header: "Property Name",
  },
  {
    accessorKey: "teamName",
    header: "Team Name",
  },
  {
    accessorKey: "cleanerName",
    header: "Cleaner Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.status;
      let color = "";
      switch (status) {
        case "Completed":
          color = "bg-green-100 text-green-800";
          break;
        case "In Progress":
          color = "bg-yellow-100 text-yellow-800";
          break;
        case "To Do":
          color = "bg-gray-100 text-gray-800";
          break;
        default:
          color = "bg-gray-100";
      }
      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>;
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
        const priority = row.priority;
        let color = "";
        switch (priority) {
          case "Urgent":
            color = "bg-red-100 text-red-800";
            break;
          case "High":
            color = "bg-orange-100 text-orange-800";
            break;
          case "Medium":
            color = "bg-yellow-100 text-yellow-800";
            break;
          default:
            color = "bg-gray-100 text-gray-800";
        }
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{priority}</span>;
      },
  },
  {
    accessorKey: "hours",
    header: "Hours",
    cell: ({ row }) => {
        const hours = row.hours;
        return hours ? `${hours} hour(s)` : 'N/A';
    }
  },
];

export function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    // Simulate API call
    setTasks(tasksData);
  }, []);

  const handleTaskCreate = (newTaskData) => {
    const newTask = {
      ...newTaskData,
      id: `TSK-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'To Do',
      unitName: newTaskData.unitListing,
      propertyName: newTaskData.property,
      teamName: newTaskData.teamAssign,
      cleanerName: 'unassigned',
      hours: null,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const filteredTasks = useMemo(() => {
    if (activeTab === "All") {
      return tasks;
    } else {
      return tasks.filter(task => task.status === activeTab);
    }
  }, [tasks, activeTab]);

  const summary = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      total: tasks.length,
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
            <CreateTaskDialog onTaskCreate={handleTaskCreate} />
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
                <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
                <DataTable columns={columns} data={filteredTasks} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
