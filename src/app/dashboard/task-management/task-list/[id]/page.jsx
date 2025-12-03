
"use client";

import { useParams } from 'next/navigation';
import { useState } from 'react';
import tasks from '@/data/tasks.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetails } from './task-details';
import { TaskLogs } from './task-logs';

export default function TaskDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [activeTab, setActiveTab] = useState("details");

  // Find the task from our dummy data
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Task ID: {task.id}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="details">Task Details</TabsTrigger>
          <TabsTrigger value="logs">Task Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
            <TaskDetails task={task} />
        </TabsContent>
        <TabsContent value="logs">
            <TaskLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
