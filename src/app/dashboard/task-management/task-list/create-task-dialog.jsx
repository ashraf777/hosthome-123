
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { PlusCircle } from 'lucide-react';

export function CreateTaskDialog({ onTaskCreate }) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data) => {
    console.log("New task data:", data);
    // Here you would typically call an API to create the task
    // For now, we'll just log it and pass it to the parent
    onTaskCreate(data);
    setOpen(false); // Close the dialog on successful submission
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Basic Information</DialogTitle>
        </DialogHeader>
        <TaskForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
