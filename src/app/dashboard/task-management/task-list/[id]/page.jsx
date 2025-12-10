
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetails } from './task-details';
import { TaskLogs } from './task-logs';
import { useToast } from '@/hooks/use-toast';

export default function TaskDetailsPage() {
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await api.get(`tasks/${id}`);
        setTask(response.data);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch task details." });
      }
      setLoading(false);
    };

    if (id) {
      fetchTask();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div>Loading task details...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Task: {task.task_name}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="details">Task Details</TabsTrigger>
          <TabsTrigger value="logs">Task Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
            <TaskDetails task={task} />
        </TabsContent>
        <TabsContent value="logs">
            <TaskLogs taskId={task.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
